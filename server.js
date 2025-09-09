const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use('/slides', express.static('slides'));

// Current slide state
let currentSlideIndex = 0;
let slides = [];

// Load slides from directory
function loadSlides() {
    const slidesDir = path.join(__dirname, 'slides');
    
    if (!fs.existsSync(slidesDir)) {
        fs.mkdirSync(slidesDir);
        console.log('Created slides directory. Please add your PNG files to the slides folder.');
        return [];
    }
    
    const files = fs.readdirSync(slidesDir)
        .filter(file => file.toLowerCase().endsWith('.png'))
        .sort(); // Sort alphabetically
    
    return files.map(file => `/slides/${file}`);
}

// Initialize slides
slides = loadSlides();
console.log(`Loaded ${slides.length} slides`);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/presenter', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'presenter.html'));
});

app.get('/audience', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'audience.html'));
});

// API endpoints
app.get('/api/slides', (req, res) => {
    res.json({
        slides: slides,
        currentIndex: currentSlideIndex,
        total: slides.length
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send current slide state to newly connected client
    socket.emit('slideUpdate', {
        currentIndex: currentSlideIndex,
        slides: slides,
        total: slides.length
    });
    
    // Handle slide navigation from presenter
    socket.on('nextSlide', () => {
        if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            io.emit('slideUpdate', {
                currentIndex: currentSlideIndex,
                slides: slides,
                total: slides.length
            });
        }
    });
    
    socket.on('prevSlide', () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            io.emit('slideUpdate', {
                currentIndex: currentSlideIndex,
                slides: slides,
                total: slides.length
            });
        }
    });
    
    socket.on('goToSlide', (index) => {
        if (index >= 0 && index < slides.length) {
            currentSlideIndex = index;
            io.emit('slideUpdate', {
                currentIndex: currentSlideIndex,
                slides: slides,
                total: slides.length
            });
        }
    });
    
    // Reload slides (useful for adding new slides without restarting)
    socket.on('reloadSlides', () => {
        slides = loadSlides();
        currentSlideIndex = Math.min(currentSlideIndex, slides.length - 1);
        io.emit('slideUpdate', {
            currentIndex: currentSlideIndex,
            slides: slides,
            total: slides.length
        });
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Presenter view: http://localhost:${PORT}/presenter`);
    console.log(`Audience view: http://localhost:${PORT}/audience`);
});

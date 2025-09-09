const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use('/slides', express.static('slides'));

// Current slide state
let currentSlideIndex = 0;
let slides = [];

// Team scoring state - now dynamic
let teamScores = {
    team1: { name: 'Team 1', score: 0 },
    team2: { name: 'Team 2', score: 0 }
};

// Scoreboard visibility state
let scoreboardVisible = false;

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

app.get('/api/scores', (req, res) => {
    res.json(teamScores);
});

app.get('/api/teams', (req, res) => {
    res.json(teamScores);
});

app.post('/api/configure-teams', (req, res) => {
    try {
        const { teams } = req.body;
        
        if (!teams || !Array.isArray(teams)) {
            return res.status(400).json({ success: false, error: 'Invalid teams data' });
        }
        
        // Create new team scores object
        const newTeamScores = {};
        teams.forEach(team => {
            newTeamScores[team.id] = {
                name: team.name,
                score: team.score || 0
            };
        });
        
        teamScores = newTeamScores;
        
        // Broadcast the updated team configuration to all connected clients
        io.emit('scoreUpdate', teamScores);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error configuring teams:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send current slide state and scores to newly connected client
    socket.emit('slideUpdate', {
        currentIndex: currentSlideIndex,
        slides: slides,
        total: slides.length
    });
    
    socket.emit('scoreUpdate', teamScores);
    socket.emit('scoreboardVisibility', { visible: scoreboardVisible });
    
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
    
    // Handle team scoring
    socket.on('updateScore', (data) => {
        const { team, change } = data;
        if (teamScores[team]) {
            teamScores[team].score += change;
            // Allow negative scores - no minimum restriction
            io.emit('scoreUpdate', teamScores);
        }
    });
    
    socket.on('resetScores', () => {
        // Reset all teams to 0, regardless of how many teams are configured
        Object.keys(teamScores).forEach(teamId => {
            teamScores[teamId].score = 0;
        });
        io.emit('scoreUpdate', teamScores);
    });
    
    socket.on('updateTeamNames', (data) => {
        if (data.team1Name) teamScores.team1.name = data.team1Name;
        if (data.team2Name) teamScores.team2.name = data.team2Name;
        io.emit('scoreUpdate', teamScores);
    });
    
    // Handle scoreboard visibility toggle
    socket.on('toggleScoreboard', (data) => {
        scoreboardVisible = data.visible;
        io.emit('scoreboardVisibility', { visible: scoreboardVisible });
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

# Slide Presentation Application

A real-time slide presentation application with separate presenter and audience views.

## Features

- **Presenter View**: Control slides with navigation buttons and keyboard shortcuts, preview next/previous slides
- **Audience View**: Clean, full-screen display of current slide only
- **Real-time Synchronization**: Audience view automatically updates when presenter changes slides
- **PNG Support**: Load slides from PNG images in a directory
- **Keyboard Navigation**: Use arrow keys to navigate slides in presenter view

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your PNG slide images to the `slides/` directory

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser:
   - Main page: http://localhost:3000
   - Presenter view: http://localhost:3000/presenter
   - Audience view: http://localhost:3000/audience

## Usage

1. **Add Slides**: Place your PNG files in the `slides/` directory. Files will be sorted alphabetically.

2. **Presenter Controls**:
   - Use "Previous" and "Next" buttons or arrow keys to navigate
   - Press 'R' to reload slides if you add new files
   - See current slide in center, with previews of previous/next slides on sides

3. **Audience View**: 
   - Shows only the current slide in full-screen
   - Automatically syncs with presenter's navigation
   - Clean interface with no controls

## File Structure

```
slide-presentation/
├── server.js          # Express server with Socket.io
├── package.json       # Dependencies
├── slides/            # Directory for PNG slide files
├── public/
│   ├── index.html     # Main landing page
│   ├── presenter.html # Presenter control interface
│   └── audience.html  # Audience display interface
└── README.md
```

## Keyboard Shortcuts (Presenter View)

- `←` Left Arrow: Previous slide
- `→` Right Arrow: Next slide  
- `R`: Reload slides from directory

## Technical Details

- Built with Node.js, Express, and Socket.io
- Real-time communication between presenter and audience
- Responsive design for different screen sizes
- Automatic slide loading and sorting

# Slide Presentation Application

A real-time slide presentation application with separate presenter and audience views.

## Features

- **Presenter View**: Control slides with navigation buttons and keyboard shortcuts, preview next/previous slides
- **Audience View**: Clean, full-screen display of current slide only
- **Real-time Synchronization**: Audience view automatically updates when presenter changes slides
- **Dynamic Team Configuration**: Configure 2-8 teams with custom names from the main page
- **Live Team Scoring**: Maintain scores for multiple teams with +10/-10 point controls
- **Scoreboard Toggle Control**: Show/hide scoreboard with large, readable display for audience
- **Real-time Score Display**: Scores update instantly on both presenter and audience views
- **Team Name Customization**: Edit team names and configure team count
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

1. **Team Configuration** (Main Page):
   - Select number of teams (2-8) from dropdown
   - Enter custom team names for each team
   - Save configuration to apply to both presenter and audience views

2. **Add Slides**: Place your PNG files in the `slides/` directory. Files will be sorted alphabetically.

3. **Presenter Controls**:
   - Use "Previous" and "Next" buttons or arrow keys to navigate slides
   - Press 'R' to reload slides if you add new files
   - See current slide in center, with previews of previous/next slides on sides
   - **Dynamic Team Scoring Panel**: 
     - Displays all configured teams with their scores
     - Edit team names by clicking on the name fields
     - Use +10/-10 buttons to adjust scores for each team
     - "Reset Scores" button to set all teams back to 0
     - Scores can be positive or negative (no minimum limit)
     - **"Show/Hide Scoreboard" toggle button** to control audience display

4. **Audience View**: 
   - Shows only the current slide in full-screen
   - **Dynamic Live Scoreboard**: Hidden by default, appears as large overlay when toggled by presenter
   - Large, readable scoreboard display centered on screen when visible
   - Automatically syncs with presenter's navigation and scoring changes
   - Clean interface with no audience controls

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
- Real-time communication between presenter and audience for slides and scoring
- Dynamic team configuration (2-6 teams) with persistent state during session
- Responsive design for different screen sizes
- Automatic slide loading and sorting
- Live team scoring with real-time synchronization across all views
- Score persistence during session (resets on server restart)
- Team name and count customization with instant updates
- RESTful API endpoints for team configuration and data retrieval

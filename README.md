# Listen - Audio Player

A modern, responsive web-based audio player with dual-track support for audio files and background music. Built with PHP, JavaScript, and SCSS.

## Features

### 🎵 Dual Audio Support
- **Audio Player**: Main audio file playback with full controls
- **Music Player**: Background music that loops independently
- Both players operate independently with separate volume controls

### 🎛️ Advanced Controls
- **Real-time Scrubber**: Drag to seek with immediate visual feedback
- **Skip Controls**: Jump forward/backward 10 seconds
- **Volume Sliders**: Independent volume control for each player
- **Tap to Pause/Resume**: Click the main player area to toggle playback

### 📱 Responsive Design
- Mobile-friendly interface with touch support
- Clean, modern UI with smooth transitions
- Adaptive layout for different screen sizes

### 🔧 Technical Features
- **Full Audio Buffering**: Pre-loads audio files for smooth playback
- **File Caching**: Efficient memory management for loaded files
- **Multiple Format Support**: MP3, WAV, OGG, M4A, AAC, FLAC
- **Seek Queue Management**: Prevents conflicts during seeking operations

## Setup

### Prerequisites
- Web server with PHP support (Apache, Nginx, etc.)
- Modern web browser with audio support

### Installation

1. **Clone or download** the project to your web server directory
2. **Create audio folders** (if they don't exist):
   ```bash
   mkdir _audio
   mkdir _music
   ```
3. **Add audio files**:
   - Place main audio files in the `_audio/` folder
   - Place background music in the `_music/` folder
4. **Access the application** via your web browser

### Supported Audio Formats
- MP3
- WAV
- OGG
- M4A
- AAC
- FLAC

## Usage

### Loading Audio Files
1. Click **"Load Audio"** to open the audio file selector
2. Choose an audio file from the list
3. The file will be buffered and ready for playback

### Loading Background Music
1. Click **"Music"** to open the music file selector
2. Choose a music file from the list
3. Music will loop automatically when it ends

### Playback Controls
- **Play/Pause**: Click the ▶ button or tap the main player area
- **Skip**: Use the `< 10s` and `10s >` buttons to jump backward/forward
- **Seek**: Drag the scrubber bar to any position in the track
- **Volume**: Adjust volume sliders for each player independently

### Visual Feedback
- **Main Player Area**: Changes color when playing (green) vs paused (gray)
- **Time Display**: Shows current position and total duration
- **Scrubber**: Real-time progress indicator with draggable handle

## File Structure

```
listen/
├── index.php          # Main application file
├── main.js            # JavaScript functionality
├── main.min.js        # Minified JavaScript (production)
├── style.scss         # SCSS source styles
├── style.css          # Compiled CSS
├── jquery.min.js      # jQuery library
├── _audio/            # Audio files directory
│   └── .gitkeep       # Keeps folder in git
├── _music/            # Music files directory
│   └── .gitkeep       # Keeps folder in git
└── README.md          # This file
```

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP for file scanning
- **Dependencies**: jQuery for DOM manipulation
- **Styling**: SCSS with custom variables and mixins

### Key Components

#### Audio Management
- **Buffer System**: Fully loads audio files using Fetch API and Blob URLs
- **Cache Management**: Stores buffered files in memory for quick access
- **Seek Safety**: Queue-based seeking to prevent conflicts

#### UI Components
- **Modal System**: File selection dialogs
- **Scrubber**: Custom progress bar with drag support
- **Volume Controls**: Range sliders with visual feedback
- **Responsive Layout**: Flexbox-based design

#### Event Handling
- **Touch Support**: Mouse and touch events for mobile compatibility
- **Keyboard Support**: Standard media controls integration
- **State Management**: Consistent UI state across all interactions

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Building
The project uses SCSS for styling. To compile:
```bash
sass style.scss style.css
```

### Minification
JavaScript is minified for production:
```bash
# Using a tool like uglify-js
uglifyjs main.js -o main.min.js
```

### Git Configuration
- Audio files are ignored but folders are preserved
- `.gitkeep` files maintain folder structure
- See `.gitignore` for exclusion patterns

## Troubleshooting

### Common Issues

**Audio not playing:**
- Check browser audio permissions
- Verify file format is supported
- Ensure files are properly placed in _audio/_music folders

**Scrubber not working:**
- Try refreshing the page
- Check for JavaScript errors in console
- Verify file is fully loaded

**Volume controls not responding:**
- Check if audio file is loaded
- Verify browser supports HTML5 audio

### Debug Mode
Use browser developer tools to:
- Check console for errors
- Monitor network requests
- Inspect audio element states

## License

This project is open source. See the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This player is designed for personal use and local file playback. For production use, consider implementing proper security measures and file validation. 
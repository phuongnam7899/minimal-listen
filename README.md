# Angular Music PWA

A Progressive Web App (PWA) for playing music offline with a beautiful dark theme interface optimized for mobile devices.

## Features

- 🎵 **Random Song Playback**: Automatically plays a random song when accessing the `/listen` page
- 📱 **Mobile-First Design**: Responsive UI optimized for mobile devices
- 🌙 **Dark Theme**: Beautiful gradient dark theme with glassmorphism effects
- ⚡ **Offline Support**: PWA capabilities allow music playback without internet connection
- 🎮 **Simple Controls**: Single play/pause button centered on the screen
- 🔄 **Auto-Next**: Automatically loads and plays the next random song when current song ends

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Music Files

Replace the placeholder files in `src/assets/music/` with your actual audio files:

- `song1.mp3`
- `song2.mp3`
- `song3.mp3`

You can add more songs by:

1. Adding audio files to `src/assets/music/`
2. Updating the song list in `src/app/services/audio.service.ts`

### 3. Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/listen` to see the app.

### 4. Build for Production

```bash
ng build --prod
```

### 5. Test PWA Features

```bash
# Install http-server globally if not already installed
npm install -g http-server

# Serve the built app
http-server dist/angular-music-pwa -p 8080

# Navigate to http://localhost:8080/listen
```

## PWA Installation

### On Mobile (Android/iOS):

1. Open the app in your mobile browser
2. Look for "Add to Home Screen" or "Install App" prompt
3. Follow the installation prompts
4. The app will be available as a standalone app on your device

### On Desktop:

1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install the PWA

## Project Structure

```
src/
├── app/
│   ├── listen/                 # Main music player component
│   │   ├── listen.component.ts
│   │   ├── listen.component.html
│   │   └── listen.component.scss
│   ├── services/
│   │   └── audio.service.ts    # Audio playback service
│   ├── app.routes.ts          # Routing configuration
│   └── app.component.*
├── assets/
│   ├── music/                 # Audio files directory
│   │   ├── song1.mp3
│   │   ├── song2.mp3
│   │   ├── song3.mp3
│   │   └── song-list.json
│   └── icons/                 # PWA icons
├── manifest.webmanifest       # PWA manifest
└── ngsw-config.json          # Service worker configuration
```

## Customization

### Adding More Songs

1. Add audio files to `src/assets/music/`
2. Update the `songs` array in `src/app/services/audio.service.ts`:

```typescript
private songs: Song[] = [
  { id: 1, title: 'Your Song Title', filename: 'your-song.mp3' },
  // Add more songs here
];
```

### Changing Colors

Update the color scheme in:

- `src/app/listen/listen.component.scss` - Component styles
- `src/styles.scss` - Global styles
- `src/manifest.webmanifest` - PWA theme colors

### Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Technical Details

- **Framework**: Angular 17
- **PWA**: Angular Service Worker
- **Styling**: SCSS with CSS Grid/Flexbox
- **Audio**: HTML5 Audio API
- **State Management**: RxJS Observables
- **Offline Caching**: Service Worker with custom caching strategies

## License

This project is open source and available under the [MIT License](LICENSE).

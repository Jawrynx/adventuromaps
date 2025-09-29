# Adventuro Maps Desktop App 🗺️

A stationary companion app for adventurers and explorers to plan their next journey.

## About the Project

Adventuro Maps is designed to create a more immersive and interactive travel experience. This desktop application is the planning and preparation hub, providing a wealth of information to help you prepare for your next adventure.

## Core Features ✨

### Planning & Exploration
- **Browse Adventures:** Explore a comprehensive menu of adventures, quests, and explorations from the comfort of your desktop.
- **View Maps:** Get a detailed look at all available maps, complete with factual and fictional content.
- **Interactive Demo Mode:** Experience immersive waypoint navigation with synchronized audio narration and text highlighting.
- **Factual Content:** Dive into rich historical and geographical information for each location.
- **Fictional Content:** Read up on story games and role-playing quests to prepare for your immersive experience.

### Demo Mode Features 🎧
- **Waypoint Navigation:** Navigate through adventure routes with interactive waypoints and detailed information.
- **Audio Narration:** Optional audio guides that automatically play as you explore each waypoint.
- **Synchronized Text Highlighting:** Real-time text highlighting that follows along with audio narration using keyframe timestamps.
- **Image Galleries:** Browse through multiple images for each waypoint with touch-friendly carousel controls.
- **Cinematic Map Movement:** Smooth camera transitions between waypoints for an immersive experience.

### Safety & Guides
- **Mandatory Safety Guides:** Access crucial safety information to ensure a secure and enjoyable journey.
- **Guides for All Levels:** Read up on tips and tricks for both new and experienced adventurers and explorers.

## Future Enhancements ✨

Several future enhancements will be implemented with the Desktop version, including:

- **Custom Routes**: Users will be able to create their own Exploration/Adventure Routes and Publish them.
- **User Forums**: Users will be able to chat and discuss their own tips, adventure stories and experiences.
- **Group Events**: Users will be able to arrange organised walks, adventures and events so users who don't want to do an adventure/exploration alone but lacks the people to go with have that opportunity to.
- **Integrated OS Maps Topo (*UK Only*)**: For premium subscribers of OS Maps, users will be able to link their account and be able to use Ordnance Survey Maps Premium Topo to see highly accurate maps that pin point every single detail of the area and terrain they are crossing.

The future is exciting!

## Getting Started

**For Explorers and Adventurers!**

The App is at VERY EARLY stages of development. An initial release date for the `1st November 2025` has been set. Exploration, Adventure Quests and Guides will be developed over time! The Download (*once ready!*) will be available below.

- **DOWNLOAD**: Not Available (Release *1st NOVEMBER 2025*)

**For Developers wishing to help development**

To get the app up and running on your local machine from this repository, follow these steps.

### Prerequisites

- **Node.js & npm:** You'll need Node.js and npm installed on your machine.
  ```bash
  npm install npm@latest -g
  ```

- **Firebase Project:** Set up your own Firebase project with:
  - Firestore Database (for storing adventures, routes, waypoints)
  - Firebase Storage (for images, audio files, keyframes)
  - Web app configuration for firebaseConfig variables

- **Google Maps API:** You'll need a Google Maps JavaScript API key with:
  - Maps JavaScript API enabled
  - A custom Map ID for styling

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jawrynx/adventuromaps.git
   cd adventuromaps
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Google Maps Setup:**
   - Update `src/core/layout/App.jsx` with your Google Maps API key in the APIProvider
   - Update `src/core/layout/MainContent.jsx` with your custom Map ID in the mapProps useMemo

5. **Database Structure:**
   Set up Firestore collections with this structure:
   ```
   adventure/
   ├── [adventure_id]/
   │   ├── routes/
   │   │   └── [route_id]/
   │   │       └── waypoints/
   │   │           └── [waypoint_id]
   exploration/
   ├── [exploration_id]/
   │   ├── routes/
   │   │   └── [route_id]/
   │   │       └── waypoints/
   │   │           └── [waypoint_id]
   ```

6. **Media Files Setup:**
   For demo mode features, waypoints should include:
   - `image_urls`: Array of image URLs
   - `narration_url`: URL to audio file (MP3/WAV)
   - `keyframes_url`: URL to keyframes text file (format: `timestamp:text`)

7. **Test the setup:**
   Try creating an Adventure/Exploration item through the admin interface!

### Development Commands

- **Development mode:** `npm start` - Opens the Electron app with hot reload
- **Build for production:** `npm run build` - Creates production build
- **Preview build:** `npm run preview` - Preview production build locally

### Keyframes Format for Narration 🎵

For synchronized text highlighting with audio narration, create keyframes files with this format:

```
0.1:This is a test
1.2:of something
1.8:that will go in the
2.8:description box!
```

- **Format:** `timestamp:text_to_highlight`
- **Timestamp:** Seconds into the audio (decimal supported)
- **Text:** Exact text from waypoint description to highlight
- **File Type:** Plain text file (.txt) hosted on Firebase Storage

The system will automatically:
1. Parse keyframes when demo mode starts
2. Segment waypoint descriptions into highlightable spans
3. Highlight text in real-time as audio plays
4. Provide smooth transitions between highlighted segments

### Usage

This command will open the Adventuro Maps desktop app, ready for you to explore and develop!

## Built With

- **Electron.js** - Desktop framework
- **React** - UI library
- **Vite** - Build tool

## Contributing

We welcome contributions! Please feel free to fork the repository and submit a pull request.
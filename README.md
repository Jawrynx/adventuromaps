# Adventuro Maps Desktop App 🗺️

A stationary companion app for adventurers and explorers to plan their next journey.

## About the Project

Adventuro Maps is designed to create a more immersive and interactive travel experience. This desktop application is the planning and preparation hub, providing a wealth of information to help you prepare for your next adventure.

## Core Features ✨

### Planning & Exploration
- **Browse Adventures:** Explore a comprehensive menu of adventures, quests, and explorations from the comfort of your desktop.
- **View Maps:** Get a detailed look at all available maps, complete with factual and fictional content.
- **Factual Content:** Dive into rich historical and geographical information for each location.
- **Fictional Content:** Read up on story games and role-playing quests to prepare for your immersive experience.

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

You'll need `npm` installed on your machine.

```npm install npm@latest -g```

You'll need to setup your own Firebase project and create a firestore database and a 'web (</>)' app to generate firebaseConfig variables (i.e. an API Key, Project ID, Storage Bucket, etc.)

### Installation
1. Clone the repository:
   `git clone https://github.com/jawrynx/adventuromaps.git`
2. Navigate to the project directory:
   `cd adventuromaps`
3. Install dependencies:
   `npm install`
4. (a) Create a ```.env```, Add your FirebaseConfig to a ```.env``` file in the format ```VITE_FIREBASE_<VARIABLE_NAME>```
4. (b) You'll also need to attach a Google Maps JavaScript API, attach its API Key and mapId to APIProvider in App.jsx. Within MainContent.jsx look for a mapProps useMemo and attach the mapId here too. This will be passed on to the relevant <Map> component and allow loading of AdvancedMarkers etc.

5. Test saving an Exploration/Adventure Item to your database!

6. Ready to Develop :D

### Usage

To run the application in development mode: ```npm start```

This command will open the Adventuro Maps desktop app, ready for you to explore.

## Built With

- **Electron.js** - Desktop framework
- **React** - UI library
- **Vite** - Build tool

## Contributing

We welcome contributions! Please feel free to fork the repository and submit a pull request.
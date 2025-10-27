// This script uploads the test exploration directly to Firestore
// Run with: node uploadTestExploration.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadTestExploration() {
  try {
    console.log('\n🚀 Starting upload to Firestore...\n');

    // Create main exploration document
    const explorationData = {
      categories: ['Distance Testing', 'Demo Mode', 'Development'],
      createdAt: Timestamp.now(),
      description: 'Test exploration covering various distance ranges: very close (<400m), close (400m-2km), medium (2-8km), long (8-50km), very long (50-200km), and extreme (>200km) to test loading screen timing.',
      difficulty: 'Easy',
      estimatedTime: '30 minutes',
      image_url: '',
      keyLocations: ['London Eye', 'Big Ben', 'Tower Bridge', 'Buckingham Palace', 'Oxford', 'Birmingham', 'Manchester', 'Edinburgh'],
      name: 'Distance Range Test Route',
      publishedAt: Timestamp.now(),
      status: 'published',
      subDescription: 'Tests all distance ranges for cinematic panning transition timing validation.',
      type: 'exploration'
    };

    const explorationRef = await addDoc(collection(db, 'exploration'), explorationData);
    console.log('✅ Created exploration with ID:', explorationRef.id);

    // Route 1: Very close (~350m)
    console.log('\n📍 Adding Route 1: London Eye → Big Ben (~350m)...');
    const route1Data = {
      order: 1,
      coordinates: [
        { lat: 51.5033, lng: -0.1195 },
        { lat: 51.5007, lng: -0.1246 }
      ]
    };
    const route1Ref = await addDoc(collection(db, `exploration/${explorationRef.id}/routes`), route1Data);
    
    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route1Ref.id}/waypoints`), {
      description: 'Start at the iconic London Eye observation wheel.',
      image: null,
      keyframes: null,
      lat: 51.5033,
      lng: -0.1195,
      name: 'London Eye',
      narration: null,
      order: 1
    });

    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route1Ref.id}/waypoints`), {
      description: 'Walk to the nearby Big Ben clock tower.',
      image: null,
      keyframes: null,
      lat: 51.5007,
      lng: -0.1246,
      name: 'Big Ben',
      narration: null,
      order: 2
    });
    console.log('   ✓ Added 2 waypoints');

    // Route 2: Close (~3.7km)
    console.log('\n📍 Adding Route 2: Big Ben → Tower Bridge (~3.7km)...');
    const route2Data = {
      order: 2,
      coordinates: [
        { lat: 51.5007, lng: -0.1246 },
        { lat: 51.5055, lng: -0.0754 }
      ]
    };
    const route2Ref = await addDoc(collection(db, `exploration/${explorationRef.id}/routes`), route2Data);
    
    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route2Ref.id}/waypoints`), {
      description: 'Continue from Big Ben along the Thames.',
      image: null,
      keyframes: null,
      lat: 51.5007,
      lng: -0.1246,
      name: 'Big Ben',
      narration: null,
      order: 1
    });

    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route2Ref.id}/waypoints`), {
      description: 'Arrive at the famous Tower Bridge.',
      image: null,
      keyframes: null,
      lat: 51.5055,
      lng: -0.0754,
      name: 'Tower Bridge',
      narration: null,
      order: 2
    });
    console.log('   ✓ Added 2 waypoints');

    // Route 3: Medium (~5.2km)
    console.log('\n📍 Adding Route 3: Tower Bridge → Buckingham Palace (~5.2km)...');
    const route3Data = {
      order: 3,
      coordinates: [
        { lat: 51.5055, lng: -0.0754 },
        { lat: 51.5014, lng: -0.1419 }
      ]
    };
    const route3Ref = await addDoc(collection(db, `exploration/${explorationRef.id}/routes`), route3Data);
    
    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route3Ref.id}/waypoints`), {
      description: 'Leave Tower Bridge and head west.',
      image: null,
      keyframes: null,
      lat: 51.5055,
      lng: -0.0754,
      name: 'Tower Bridge',
      narration: null,
      order: 1
    });

    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route3Ref.id}/waypoints`), {
      description: 'Arrive at the royal residence of Buckingham Palace.',
      image: null,
      keyframes: null,
      lat: 51.5014,
      lng: -0.1419,
      name: 'Buckingham Palace',
      narration: null,
      order: 2
    });
    console.log('   ✓ Added 2 waypoints');

    // Route 4: Long (~77km)
    console.log('\n📍 Adding Route 4: Buckingham Palace → Oxford (~77km)...');
    const route4Data = {
      order: 4,
      coordinates: [
        { lat: 51.5014, lng: -0.1419 },
        { lat: 51.7520, lng: -1.2577 }
      ]
    };
    const route4Ref = await addDoc(collection(db, `exploration/${explorationRef.id}/routes`), route4Data);
    
    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route4Ref.id}/waypoints`), {
      description: 'Depart from London heading northwest.',
      image: null,
      keyframes: null,
      lat: 51.5014,
      lng: -0.1419,
      name: 'Buckingham Palace',
      narration: null,
      order: 1
    });

    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route4Ref.id}/waypoints`), {
      description: 'Arrive in the historic university city of Oxford.',
      image: null,
      keyframes: null,
      lat: 51.7520,
      lng: -1.2577,
      name: 'Oxford City Centre',
      narration: null,
      order: 2
    });
    console.log('   ✓ Added 2 waypoints');

    // Route 5: Very long (~102km)
    console.log('\n📍 Adding Route 5: Oxford → Birmingham (~102km)...');
    const route5Data = {
      order: 5,
      coordinates: [
        { lat: 51.7520, lng: -1.2577 },
        { lat: 52.4862, lng: -1.8904 }
      ]
    };
    const route5Ref = await addDoc(collection(db, `exploration/${explorationRef.id}/routes`), route5Data);
    
    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route5Ref.id}/waypoints`), {
      description: 'Leave Oxford heading north.',
      image: null,
      keyframes: null,
      lat: 51.7520,
      lng: -1.2577,
      name: 'Oxford City Centre',
      narration: null,
      order: 1
    });

    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route5Ref.id}/waypoints`), {
      description: 'Reach Birmingham, the second largest city in England.',
      image: null,
      keyframes: null,
      lat: 52.4862,
      lng: -1.8904,
      name: 'Birmingham City Centre',
      narration: null,
      order: 2
    });
    console.log('   ✓ Added 2 waypoints');

    // Route 6: Extreme (125km + 345km)
    console.log('\n📍 Adding Route 6: Birmingham → Manchester → Edinburgh (~470km total)...');
    const route6Data = {
      order: 6,
      coordinates: [
        { lat: 52.4862, lng: -1.8904 },
        { lat: 53.4808, lng: -2.2426 },
        { lat: 55.9533, lng: -3.1883 }
      ]
    };
    const route6Ref = await addDoc(collection(db, `exploration/${explorationRef.id}/routes`), route6Data);
    
    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route6Ref.id}/waypoints`), {
      description: 'Depart Birmingham for Manchester.',
      image: null,
      keyframes: null,
      lat: 52.4862,
      lng: -1.8904,
      name: 'Birmingham City Centre',
      narration: null,
      order: 1
    });

    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route6Ref.id}/waypoints`), {
      description: 'Pass through Manchester, a major northern city.',
      image: null,
      keyframes: null,
      lat: 53.4808,
      lng: -2.2426,
      name: 'Manchester City Centre',
      narration: null,
      order: 2
    });

    await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${route6Ref.id}/waypoints`), {
      description: 'Complete your journey in Edinburgh, Scotland\'s capital.',
      image: null,
      keyframes: null,
      lat: 55.9533,
      lng: -3.1883,
      name: 'Edinburgh Castle',
      narration: null,
      order: 3
    });
    console.log('   ✓ Added 3 waypoints');

    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS! Test exploration uploaded to Firestore!');
    console.log('='.repeat(80));
    console.log('\nExploration ID:', explorationRef.id);
    console.log('Name: Distance Range Test Route');
    console.log('Total Routes: 6');
    console.log('Total Waypoints: 13');
    console.log('\nYou should now see "Distance Range Test Route" in your Explore view!');
    console.log('Open Demo Mode to test the distance-based loading screen timing.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error uploading exploration:', error);
    console.error('\nMake sure your .env file has the correct Firebase credentials!');
    process.exit(1);
  }
}

uploadTestExploration();

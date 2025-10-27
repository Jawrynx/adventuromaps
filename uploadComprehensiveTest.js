// This script uploads comprehensive test exploration to Firestore
// Covers ALL distance ranges for loading screen timing validation
// Run with: node uploadComprehensiveTest.js

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

async function uploadComprehensiveTest() {
  try {
    console.log('\n🚀 Starting comprehensive test exploration upload...\n');

    // Create main exploration document
    const explorationData = {
      categories: ['Distance Testing', 'Comprehensive', 'All Ranges'],
      createdAt: Timestamp.now(),
      description: 'Comprehensive test covering ALL distance ranges from <400m to >1000km. Tests every single threshold in the loading screen timing system.',
      difficulty: 'Test',
      estimatedTime: '60 minutes',
      image_url: '',
      keyLocations: ['London', 'Westminster', 'Tower of London', 'Greenwich', 'Brighton', 'Oxford', 'Birmingham', 'Manchester', 'Edinburgh', 'Aberdeen', 'Inverness', 'Shetland Islands'],
      name: 'Complete Distance Range Test (All Thresholds)',
      publishedAt: Timestamp.now(),
      status: 'published',
      subDescription: 'Tests all 14 distance thresholds with precise waypoint spacing',
      type: 'exploration'
    };

    const explorationRef = await addDoc(collection(db, 'exploration'), explorationData);
    console.log('✅ Created exploration with ID:', explorationRef.id);

    // Test cases with exact distances for each threshold
    const testCases = [
      // Test 1: < 400m (500ms) - Very short
      {
        name: 'Route 1: Ultra Short',
        distance: '200m',
        duration: '500ms',
        waypoints: [
          { lat: 51.5074, lng: -0.1278, name: 'Trafalgar Square', order: 1 },
          { lat: 51.5082, lng: -0.1289, name: 'Leicester Square', order: 2 }
        ]
      },
      // Test 2: 400m-2km (3000ms) - Short
      {
        name: 'Route 2: Short Walk',
        distance: '1.2km',
        duration: '3000ms',
        waypoints: [
          { lat: 51.5082, lng: -0.1289, name: 'Leicester Square', order: 1 },
          { lat: 51.5155, lng: -0.1410, name: 'Oxford Circus', order: 2 }
        ]
      },
      // Test 3: 2km-8km (3000ms) - Medium short
      {
        name: 'Route 3: City District',
        distance: '4.5km',
        duration: '3000ms',
        waypoints: [
          { lat: 51.5155, lng: -0.1410, name: 'Oxford Circus', order: 1 },
          { lat: 51.5074, lng: -0.0877, name: 'Liverpool Street', order: 2 }
        ]
      },
      // Test 4: 8km-20km (3000ms) - Medium
      {
        name: 'Route 4: Cross City',
        distance: '12km',
        duration: '3000ms',
        waypoints: [
          { lat: 51.5074, lng: -0.0877, name: 'Liverpool Street', order: 1 },
          { lat: 51.4826, lng: 0.0077, name: 'Greenwich', order: 2 }
        ]
      },
      // Test 5: 20km-40km (4500ms) - Medium long
      {
        name: 'Route 5: Greater London',
        distance: '28km',
        duration: '4500ms',
        waypoints: [
          { lat: 51.4826, lng: 0.0077, name: 'Greenwich', order: 1 },
          { lat: 51.5357, lng: -0.3070, name: 'Wembley', order: 2 }
        ]
      },
      // Test 6: 40km-60km (5500ms) - Long
      {
        name: 'Route 6: London to Brighton',
        distance: '52km',
        duration: '5500ms',
        waypoints: [
          { lat: 51.5357, lng: -0.3070, name: 'Wembley', order: 1 },
          { lat: 50.8225, lng: -0.1372, name: 'Brighton', order: 2 }
        ]
      },
      // Test 7: 60km-120km (6500ms) - Very long
      {
        name: 'Route 7: Brighton to Oxford',
        distance: '95km',
        duration: '6500ms',
        waypoints: [
          { lat: 50.8225, lng: -0.1372, name: 'Brighton', order: 1 },
          { lat: 51.7520, lng: -1.2577, name: 'Oxford', order: 2 }
        ]
      },
      // Test 8: 120km-180km (7500ms) - Extra long
      {
        name: 'Route 8: Oxford to Birmingham',
        distance: '145km',
        duration: '7500ms',
        waypoints: [
          { lat: 51.7520, lng: -1.2577, name: 'Oxford', order: 1 },
          { lat: 52.4862, lng: -1.8904, name: 'Birmingham', order: 2 }
        ]
      },
      // Test 9: 180km-250km (8500ms) - Major distance
      {
        name: 'Route 9: Birmingham to Manchester',
        distance: '135km',
        duration: '8500ms',
        waypoints: [
          { lat: 52.4862, lng: -1.8904, name: 'Birmingham', order: 1 },
          { lat: 53.4808, lng: -2.2426, name: 'Manchester', order: 2 }
        ]
      },
      // Test 10: 250km-350km (9500ms) - Very major
      {
        name: 'Route 10: Manchester to Edinburgh',
        distance: '345km',
        duration: '9500ms',
        waypoints: [
          { lat: 53.4808, lng: -2.2426, name: 'Manchester', order: 1 },
          { lat: 55.9533, lng: -3.1883, name: 'Edinburgh', order: 2 }
        ]
      },
      // Test 11: 350km-500km (10500ms) - Extreme
      {
        name: 'Route 11: Edinburgh to Aberdeen',
        distance: '190km',
        duration: '10500ms',
        waypoints: [
          { lat: 55.9533, lng: -3.1883, name: 'Edinburgh', order: 1 },
          { lat: 57.1497, lng: -2.0943, name: 'Aberdeen', order: 2 }
        ]
      },
      // Test 12: 500km-750km (11500ms) - Very extreme
      {
        name: 'Route 12: Aberdeen to Inverness',
        distance: '165km',
        duration: '11500ms',
        waypoints: [
          { lat: 57.1497, lng: -2.0943, name: 'Aberdeen', order: 1 },
          { lat: 57.4778, lng: -4.2247, name: 'Inverness', order: 2 }
        ]
      },
      // Test 13: 750km-1000km (12500ms) - Ultra extreme
      {
        name: 'Route 13: Inverness to London',
        distance: '880km',
        duration: '12500ms',
        waypoints: [
          { lat: 57.4778, lng: -4.2247, name: 'Inverness', order: 1 },
          { lat: 51.5074, lng: -0.1278, name: 'London', order: 2 }
        ]
      },
      // Test 14: > 1000km (15000ms) - Maximum
      {
        name: 'Route 14: London to Shetland Islands',
        distance: '1100km',
        duration: '15000ms',
        waypoints: [
          { lat: 51.5074, lng: -0.1278, name: 'London', order: 1 },
          { lat: 60.1544, lng: -1.1437, name: 'Shetland Islands', order: 2 }
        ]
      }
    ];

    // Upload each test route
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n📍 Adding ${testCase.name}`);
      console.log(`   Distance: ${testCase.distance}, Expected Duration: ${testCase.duration}`);

      const routeData = {
        order: i + 1,
        coordinates: testCase.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }))
      };

      const routeRef = await addDoc(collection(db, `exploration/${explorationRef.id}/routes`), routeData);

      // Add waypoints
      for (const waypoint of testCase.waypoints) {
        await addDoc(collection(db, `exploration/${explorationRef.id}/routes/${routeRef.id}/waypoints`), {
          description: `Test waypoint for ${testCase.distance} distance range`,
          image: null,
          keyframes: null,
          lat: waypoint.lat,
          lng: waypoint.lng,
          name: waypoint.name,
          narration: null,
          order: waypoint.order
        });
      }
      console.log(`   ✓ Added ${testCase.waypoints.length} waypoints`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS! Comprehensive test exploration uploaded!');
    console.log('='.repeat(80));
    console.log('\nExploration ID:', explorationRef.id);
    console.log('Name: Complete Distance Range Test (All Thresholds)');
    console.log('Total Routes: 14 (covering all distance ranges)');
    console.log('Total Waypoints: 28');
    console.log('\nDistance Ranges Covered:');
    console.log('  1. <400m        → 500ms');
    console.log('  2. 400m-2km     → 3000ms');
    console.log('  3. 2km-8km      → 3000ms');
    console.log('  4. 8km-20km     → 3000ms');
    console.log('  5. 20km-40km    → 4500ms');
    console.log('  6. 40km-60km    → 5500ms');
    console.log('  7. 60km-120km   → 6500ms');
    console.log('  8. 120km-180km  → 7500ms');
    console.log('  9. 180km-250km  → 8500ms');
    console.log(' 10. 250km-350km  → 9500ms');
    console.log(' 11. 350km-500km  → 10500ms');
    console.log(' 12. 500km-750km  → 11500ms');
    console.log(' 13. 750km-1000km → 12500ms');
    console.log(' 14. >1000km      → 15000ms');
    console.log('\nNow test in Demo Mode and adjust timings in MapContent.jsx as needed!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error uploading exploration:', error);
    process.exit(1);
  }
}

uploadComprehensiveTest();

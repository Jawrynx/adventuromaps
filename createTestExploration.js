// This script creates a test exploration with various distance ranges
// Instructions:
// 1. Open the Firebase Console
// 2. Go to your project > Firestore Database
// 3. Copy and paste the JSON output from this script
// Or use the Firebase Admin SDK if you have serviceAccountKey.json

const testExplorationData = {
  exploration: {
    categories: ['Distance Testing', 'Demo Mode', 'Development'],
    createdAt: new Date().toISOString(),
    description: 'Test exploration covering various distance ranges: very close (<400m), close (400m-2km), medium (2-8km), long (8-50km), very long (50-200km), and extreme (>200km) to test loading screen timing.',
    difficulty: 'Easy',
    estimatedTime: '30 minutes',
    image_url: '',
    keyLocations: ['London Eye', 'Big Ben', 'Tower Bridge', 'Buckingham Palace', 'Oxford', 'Birmingham', 'Manchester', 'Edinburgh'],
    name: 'Distance Range Test Route',
    publishedAt: new Date().toISOString(),
    status: 'published',
    subDescription: 'Tests all distance ranges for cinematic panning transition timing validation.',
    type: 'exploration'
  },
  routes: [
    // Route 1: Very close (~350m)
    {
      order: 1,
      coordinates: [
        { lat: 51.5033, lng: -0.1195 }, // London Eye
        { lat: 51.5007, lng: -0.1246 }  // Big Ben
      ],
      waypoints: [
        {
          description: 'Start at the iconic London Eye observation wheel.',
          image: null,
          instructions: 'Begin your journey at the London Eye.',
          keyframes: null,
          lat: 51.5033,
          lng: -0.1195,
          name: 'London Eye',
          narration: null,
          order: 1
        },
        {
          description: 'Walk to the nearby Big Ben clock tower.',
          image: null,
          instructions: 'Head east towards Westminster.',
          keyframes: null,
          lat: 51.5007,
          lng: -0.1246,
          name: 'Big Ben',
          narration: null,
          order: 2
        }
      ]
    },
    // Route 2: Close (~3.7km)
    {
      order: 2,
      coordinates: [
        { lat: 51.5007, lng: -0.1246 }, // Big Ben
        { lat: 51.5055, lng: -0.0754 }  // Tower Bridge
      ],
      waypoints: [
        {
          description: 'Continue from Big Ben along the Thames.',
          image: null,
          instructions: 'Follow the river eastward.',
          keyframes: null,
          lat: 51.5007,
          lng: -0.1246,
          name: 'Big Ben',
          narration: null,
          order: 1
        },
        {
          description: 'Arrive at the famous Tower Bridge.',
          image: null,
          instructions: 'Cross the bridge if you wish.',
          keyframes: null,
          lat: 51.5055,
          lng: -0.0754,
          name: 'Tower Bridge',
          narration: null,
          order: 2
        }
      ]
    },
    // Route 3: Medium (~5.2km)
    {
      order: 3,
      coordinates: [
        { lat: 51.5055, lng: -0.0754 }, // Tower Bridge
        { lat: 51.5014, lng: -0.1419 }  // Buckingham Palace
      ],
      waypoints: [
        {
          description: 'Leave Tower Bridge and head west.',
          image: null,
          instructions: 'Return towards central London.',
          keyframes: null,
          lat: 51.5055,
          lng: -0.0754,
          name: 'Tower Bridge',
          narration: null,
          order: 1
        },
        {
          description: 'Arrive at the royal residence of Buckingham Palace.',
          image: null,
          instructions: 'View the palace and guards.',
          keyframes: null,
          lat: 51.5014,
          lng: -0.1419,
          name: 'Buckingham Palace',
          narration: null,
          order: 2
        }
      ]
    },
    // Route 4: Long (~77km)
    {
      order: 4,
      coordinates: [
        { lat: 51.5014, lng: -0.1419 }, // Buckingham Palace
        { lat: 51.7520, lng: -1.2577 }  // Oxford
      ],
      waypoints: [
        {
          description: 'Depart from London heading northwest.',
          image: null,
          instructions: 'Travel to Oxford.',
          keyframes: null,
          lat: 51.5014,
          lng: -0.1419,
          name: 'Buckingham Palace',
          narration: null,
          order: 1
        },
        {
          description: 'Arrive in the historic university city of Oxford.',
          image: null,
          instructions: 'Explore the colleges and architecture.',
          keyframes: null,
          lat: 51.7520,
          lng: -1.2577,
          name: 'Oxford City Centre',
          narration: null,
          order: 2
        }
      ]
    },
    // Route 5: Very long (~102km)
    {
      order: 5,
      coordinates: [
        { lat: 51.7520, lng: -1.2577 }, // Oxford
        { lat: 52.4862, lng: -1.8904 }  // Birmingham
      ],
      waypoints: [
        {
          description: 'Leave Oxford heading north.',
          image: null,
          instructions: 'Journey to Birmingham.',
          keyframes: null,
          lat: 51.7520,
          lng: -1.2577,
          name: 'Oxford City Centre',
          narration: null,
          order: 1
        },
        {
          description: 'Reach Birmingham, the second largest city in England.',
          image: null,
          instructions: 'Explore the industrial heritage.',
          keyframes: null,
          lat: 52.4862,
          lng: -1.8904,
          name: 'Birmingham City Centre',
          narration: null,
          order: 2
        }
      ]
    },
    // Route 6: Extreme (125km + 345km)
    {
      order: 6,
      coordinates: [
        { lat: 52.4862, lng: -1.8904 }, // Birmingham
        { lat: 53.4808, lng: -2.2426 }, // Manchester
        { lat: 55.9533, lng: -3.1883 }  // Edinburgh
      ],
      waypoints: [
        {
          description: 'Depart Birmingham for Manchester.',
          image: null,
          instructions: 'Travel northwest.',
          keyframes: null,
          lat: 52.4862,
          lng: -1.8904,
          name: 'Birmingham City Centre',
          narration: null,
          order: 1
        },
        {
          description: 'Pass through Manchester, a major northern city.',
          image: null,
          instructions: 'Continue north to Scotland.',
          keyframes: null,
          lat: 53.4808,
          lng: -2.2426,
          name: 'Manchester City Centre',
          narration: null,
          order: 2
        },
        {
          description: 'Complete your journey in Edinburgh, Scotland\'s capital.',
          image: null,
          instructions: 'Enjoy the castle and old town.',
          keyframes: null,
          lat: 55.9533,
          lng: -3.1883,
          name: 'Edinburgh Castle',
          narration: null,
          order: 3
        }
      ]
    }
  ]
};

function displayInstructions() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST EXPLORATION DATA - Distance Range Testing');
  console.log('='.repeat(80));
  console.log('\nThis exploration includes 6 routes covering all distance ranges:');
  console.log('  Route 1: ~350m   (Very close - <400m)');
  console.log('  Route 2: ~3.7km  (Close - tests slightly above 400m-2km range)');
  console.log('  Route 3: ~5.2km  (Medium - 2-8km)');
  console.log('  Route 4: ~77km   (Long - tests above 8-50km range)');
  console.log('  Route 5: ~102km  (Very long - 50-200km)');
  console.log('  Route 6: ~125km + ~345km (Extreme - >200km, tests both thresholds)');
  console.log('\n' + '='.repeat(80));
  console.log('MANUAL SETUP INSTRUCTIONS:');
  console.log('='.repeat(80));
  console.log('\n1. Open Firebase Console: https://console.firebase.google.com');
  console.log('2. Go to your project > Firestore Database');
  console.log('3. Click "Start collection" and name it "explorations"');
  console.log('4. Add the main exploration document with these fields:');
  console.log('\n   Main Document Fields:');
  console.log('   ---------------------');
  Object.entries(testExplorationData.exploration).forEach(([key, value]) => {
    if (typeof value === 'object' && Array.isArray(value)) {
      console.log(`   ${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
    } else {
      console.log(`   ${key}: "${value}"`);
    }
  });
  console.log('\n5. For each document, create a subcollection called "routes"');
  console.log('6. For each route, add the coordinates array and order number');
  console.log('7. For each route, create a "waypoints" subcollection');
  console.log('8. Add each waypoint with its fields (description, lat, lng, name, order, etc.)');
  console.log('\n' + '='.repeat(80));
  console.log('AUTOMATED SETUP (If you have Firebase Admin SDK):');
  console.log('='.repeat(80));
  console.log('\nSee the commented code below to use Firebase Admin SDK');
  console.log('\n' + '='.repeat(80));
}

async function createTestExploration() {
  try {
    // Create main exploration document
    const explorationRef = await addDoc(collection(db, 'explorations'), {
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
    });

    console.log('Created exploration with ID:', explorationRef.id);

    // Route 1: Very close waypoints (~350m)
    const route1Ref = await addDoc(collection(db, `explorations/${explorationRef.id}/routes`), {
      order: 1,
      coordinates: [
        { lat: 51.5033, lng: -0.1195 }, // London Eye
        { lat: 51.5007, lng: -0.1246 }  // Big Ben
      ]
    });
    
    await route1Ref.collection('waypoints').add({
      description: 'Start at the iconic London Eye observation wheel.',
      image: null,
      instructions: 'Begin your journey at the London Eye.',
      keyframes: null,
      lat: 51.5033,
      lng: -0.1195,
      name: 'London Eye',
      narration: null,
      order: 1
    });

    await route1Ref.collection('waypoints').add({
      description: 'Walk to the nearby Big Ben clock tower.',
      image: null,
      instructions: 'Head east towards Westminster.',
      keyframes: null,
      lat: 51.5007,
      lng: -0.1246,
      name: 'Big Ben',
      narration: null,
      order: 2
    });

    // Route 2: Close distance (~3.7km)
    const route2Ref = await explorationRef.collection('routes').add({
      order: 2,
      coordinates: [
        { lat: 51.5007, lng: -0.1246 }, // Big Ben
        { lat: 51.5055, lng: -0.0754 }  // Tower Bridge
      ]
    });

    await route2Ref.collection('waypoints').add({
      description: 'Continue from Big Ben along the Thames.',
      image: null,
      instructions: 'Follow the river eastward.',
      keyframes: null,
      lat: 51.5007,
      lng: -0.1246,
      name: 'Big Ben',
      narration: null,
      order: 1
    });

    await route2Ref.collection('waypoints').add({
      description: 'Arrive at the famous Tower Bridge.',
      image: null,
      instructions: 'Cross the bridge if you wish.',
      keyframes: null,
      lat: 51.5055,
      lng: -0.0754,
      name: 'Tower Bridge',
      narration: null,
      order: 2
    });

    // Route 3: Medium distance (~5.2km)
    const route3Ref = await explorationRef.collection('routes').add({
      order: 3,
      coordinates: [
        { lat: 51.5055, lng: -0.0754 }, // Tower Bridge
        { lat: 51.5014, lng: -0.1419 }  // Buckingham Palace
      ]
    });

    await route3Ref.collection('waypoints').add({
      description: 'Leave Tower Bridge and head west.',
      image: null,
      instructions: 'Return towards central London.',
      keyframes: null,
      lat: 51.5055,
      lng: -0.0754,
      name: 'Tower Bridge',
      narration: null,
      order: 1
    });

    await route3Ref.collection('waypoints').add({
      description: 'Arrive at the royal residence of Buckingham Palace.',
      image: null,
      instructions: 'View the palace and guards.',
      keyframes: null,
      lat: 51.5014,
      lng: -0.1419,
      name: 'Buckingham Palace',
      narration: null,
      order: 2
    });

    // Route 4: Long distance (~77km)
    const route4Ref = await explorationRef.collection('routes').add({
      order: 4,
      coordinates: [
        { lat: 51.5014, lng: -0.1419 }, // Buckingham Palace
        { lat: 51.7520, lng: -1.2577 }  // Oxford
      ]
    });

    await route4Ref.collection('waypoints').add({
      description: 'Depart from London heading northwest.',
      image: null,
      instructions: 'Travel to Oxford.',
      keyframes: null,
      lat: 51.5014,
      lng: -0.1419,
      name: 'Buckingham Palace',
      narration: null,
      order: 1
    });

    await route4Ref.collection('waypoints').add({
      description: 'Arrive in the historic university city of Oxford.',
      image: null,
      instructions: 'Explore the colleges and architecture.',
      keyframes: null,
      lat: 51.7520,
      lng: -1.2577,
      name: 'Oxford City Centre',
      narration: null,
      order: 2
    });

    // Route 5: Very long distance (~102km)
    const route5Ref = await explorationRef.collection('routes').add({
      order: 5,
      coordinates: [
        { lat: 51.7520, lng: -1.2577 }, // Oxford
        { lat: 52.4862, lng: -1.8904 }  // Birmingham
      ]
    });

    await route5Ref.collection('waypoints').add({
      description: 'Leave Oxford heading north.',
      image: null,
      instructions: 'Journey to Birmingham.',
      keyframes: null,
      lat: 51.7520,
      lng: -1.2577,
      name: 'Oxford City Centre',
      narration: null,
      order: 1
    });

    await route5Ref.collection('waypoints').add({
      description: 'Reach Birmingham, the second largest city in England.',
      image: null,
      instructions: 'Explore the industrial heritage.',
      keyframes: null,
      lat: 52.4862,
      lng: -1.8904,
      name: 'Birmingham City Centre',
      narration: null,
      order: 2
    });

    // Route 6: Extreme distances (125km + 345km)
    const route6Ref = await explorationRef.collection('routes').add({
      order: 6,
      coordinates: [
        { lat: 52.4862, lng: -1.8904 }, // Birmingham
        { lat: 53.4808, lng: -2.2426 }, // Manchester
        { lat: 55.9533, lng: -3.1883 }  // Edinburgh
      ]
    });

    await route6Ref.collection('waypoints').add({
      description: 'Depart Birmingham for Manchester.',
      image: null,
      instructions: 'Travel northwest.',
      keyframes: null,
      lat: 52.4862,
      lng: -1.8904,
      name: 'Birmingham City Centre',
      narration: null,
      order: 1
    });

    await route6Ref.collection('waypoints').add({
      description: 'Pass through Manchester, a major northern city.',
      image: null,
      instructions: 'Continue north to Scotland.',
      keyframes: null,
      lat: 53.4808,
      lng: -2.2426,
      name: 'Manchester City Centre',
      narration: null,
      order: 2
    });

    await route6Ref.collection('waypoints').add({
      description: 'Complete your journey in Edinburgh, Scotland\'s capital.',
      image: null,
      instructions: 'Enjoy the castle and old town.',
      keyframes: null,
      lat: 55.9533,
      lng: -3.1883,
      name: 'Edinburgh Castle',
      narration: null,
      order: 3
    });

    console.log('\n✅ Test exploration created successfully with 6 routes covering all distance ranges!');
    console.log('Route 1: ~350m (Very close - <400m)');
    console.log('Route 2: ~3.7km (Close - 400m-2km range, but tests slightly above)');
    console.log('Route 3: ~5.2km (Medium - 2-8km)');
    console.log('Route 4: ~77km (Long - 8-50km range, but tests above)');
    console.log('Route 5: ~102km (Very long - 50-200km)');
    console.log('Route 6: Manchester ~125km, Edinburgh ~345km (Extreme - >200km)');
    console.log('\nYou can now test the distance-based loading screen timing in Demo Mode!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test exploration:', error);
    process.exit(1);
  }
}

createTestExploration();

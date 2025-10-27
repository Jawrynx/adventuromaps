// Test Exploration Data for Distance-Based Loading Screen Timing
// Simply run: node testExplorationData.js
// Then manually add to Firestore or use the data structure below

const testExplorationData = {
  // Main exploration document
  exploration: {
    categories: ['Distance Testing', 'Demo Mode', 'Development'],
    description: 'Test exploration covering various distance ranges: very close (<400m), close (400m-2km), medium (2-8km), long (8-50km), very long (50-200km), and extreme (>200km) to test loading screen timing.',
    difficulty: 'Easy',
    estimatedTime: '30 minutes',
    image_url: '',
    keyLocations: ['London Eye', 'Big Ben', 'Tower Bridge', 'Buckingham Palace', 'Oxford', 'Birmingham', 'Manchester', 'Edinburgh'],
    name: 'Distance Range Test Route',
    status: 'published',
    subDescription: 'Tests all distance ranges for cinematic panning transition timing validation.',
    type: 'exploration'
  },
  // Routes with waypoints
  routes: [
    // Route 1: Very close (~350m)
    {
      order: 1,
      coordinates: [
        { lat: 51.5033, lng: -0.1195 },
        { lat: 51.5007, lng: -0.1246 }
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
        { lat: 51.5007, lng: -0.1246 },
        { lat: 51.5055, lng: -0.0754 }
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
        { lat: 51.5055, lng: -0.0754 },
        { lat: 51.5014, lng: -0.1419 }
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
        { lat: 51.5014, lng: -0.1419 },
        { lat: 51.7520, lng: -1.2577 }
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
        { lat: 51.7520, lng: -1.2577 },
        { lat: 52.4862, lng: -1.8904 }
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
        { lat: 52.4862, lng: -1.8904 },
        { lat: 53.4808, lng: -2.2426 },
        { lat: 55.9533, lng: -3.1883 }
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

console.log('\n' + '='.repeat(80));
console.log('  TEST EXPLORATION DATA - Distance Range Testing');
console.log('='.repeat(80));
console.log('\nThis exploration includes 6 routes covering all distance ranges:');
console.log('  • Route 1: ~350m   (Very close - <400m)');
console.log('  • Route 2: ~3.7km  (Close - 400m-2km range)');
console.log('  • Route 3: ~5.2km  (Medium - 2-8km)');
console.log('  • Route 4: ~77km   (Long - 8-50km range)');
console.log('  • Route 5: ~102km  (Very long - 50-200km)');
console.log('  • Route 6: ~125km + ~345km (Extreme - >200km & >1000km)');
console.log('\n' + '='.repeat(80));
console.log('  SETUP INSTRUCTIONS');
console.log('='.repeat(80));
console.log('\n1. Open Firebase Console: https://console.firebase.google.com');
console.log('2. Navigate to: Your Project > Firestore Database');
console.log('3. In the explorations collection, click "Add document"');
console.log('4. Set document ID to "auto-ID"');
console.log('\n5. Add these fields to the main exploration document:');
console.log('   ------------------------------------------------');
console.log('   categories (array): Distance Testing, Demo Mode, Development');
console.log('   createdAt (timestamp): [current timestamp]');
console.log('   description (string): Test exploration covering various distance ranges...');
console.log('   difficulty (string): Easy');
console.log('   estimatedTime (string): 30 minutes');
console.log('   image_url (string): [empty]');
console.log('   keyLocations (array): London Eye, Big Ben, Tower Bridge, etc.');
console.log('   name (string): Distance Range Test Route');
console.log('   publishedAt (timestamp): [current timestamp]');
console.log('   status (string): published');
console.log('   subDescription (string): Tests all distance ranges for timing validation');
console.log('   type (string): exploration');
console.log('\n6. Create a subcollection called "routes" in the exploration document');
console.log('7. For EACH route (6 total), create a document with:');
console.log('   - order (number): 1, 2, 3, 4, 5, or 6');
console.log('   - coordinates (array): lat/lng objects from testExplorationData.routes');
console.log('\n8. For EACH route document, create a "waypoints" subcollection');
console.log('9. Add waypoint documents with fields: description, image, instructions,');
console.log('   keyframes, lat, lng, name, narration, order');
console.log('\n' + '='.repeat(80));
console.log('  QUICK REFERENCE - Route Coordinates');
console.log('='.repeat(80));

testExplorationData.routes.forEach((route, idx) => {
  console.log(`\nRoute ${route.order}: (${route.waypoints.length} waypoints)`);
  route.waypoints.forEach(wp => {
    console.log(`  ${wp.order}. ${wp.name} - lat: ${wp.lat}, lng: ${wp.lng}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('  JSON DATA (for copy/paste if needed)');
console.log('='.repeat(80));
console.log(JSON.stringify(testExplorationData, null, 2));
console.log('\n' + '='.repeat(80));
console.log('  After adding, the exploration should appear in your Explore view!');
console.log('='.repeat(80) + '\n');

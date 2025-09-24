const fs = require('fs');
const proj4 = require('proj4');

// Define the projection for British National Grid (EPSG:27700)
const bngProjection = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs';

const wgs84Projection = 'WGS84';

// Read the GeoJSON file
const geojsonData = JSON.parse(fs.readFileSync('./public/geodata/features.json', 'utf8'));

// Function to convert coordinates
const convertCoordinates = (coordinates) => {
  return coordinates.map(polygon => {
    return polygon.map(ring => {
      return ring.map(point => {
        const [easting, northing] = point;
        const [longitude, latitude] = proj4(bngProjection, wgs84Projection, [easting, northing]);
        return [longitude, latitude];
      });
    });
  });
};

// Loop through features and convert coordinates
const convertedFeatures = geojsonData.features.map(feature => {
  if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates = convertCoordinates(feature.geometry.coordinates);
  } else if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates = feature.geometry.coordinates.map(ring => {
      return ring.map(point => {
        const [easting, northing] = point;
        const [longitude, latitude] = proj4(bngProjection, wgs84Projection, [easting, northing]);
        return [longitude, latitude];
      });
    });
  }
  return feature;
});

const convertedGeoJson = {
  ...geojsonData,
  features: convertedFeatures,
};

fs.writeFileSync('./public/geodata/features_wgs84.json', JSON.stringify(convertedGeoJson, null, 2), 'utf8');

console.log('GeoJSON file converted successfully!');
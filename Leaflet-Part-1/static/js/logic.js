// Fetch the earthquake data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
  .then(response => response.json())
  .then(data => {
    // Initialize the map
    const map = L.map('map').setView([0, 0], 2);

    // Create a tile layer for the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Loop through the earthquake features
    const geojsonLayer = L.geoJSON(data.features, {
      pointToLayer: function (feature, latlng) {
        // Create a circle marker based on feature properties
        const magnitude = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];
        const markerOptions = {
          radius: magnitude * 2,
          fillColor: getColor(depth),
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        return L.circleMarker(latlng, markerOptions);
      },
      onEachFeature: function (feature, layer) {
        // Bind a popup to each layer using feature properties
        const popupContent = `<h3><strong>Location:</strong> ${feature.properties.place}</h3><hr/>
                              <p><strong>Time Of Earthquake:</strong>${new Date(feature.properties.time)}</p>
                              <p><strong>Details:</strong> <a href="${feature.properties.url}" target="_blank">More Info</a><br/></p>
                              <p><strong>Magnitude:</strong> ${feature.properties.mag}<br/></p>
                              <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]}</p>`;
        layer.bindPopup(popupContent);
      }
    });

    // Add the GeoJSON layer to the map
    geojsonLayer.addTo(map);

    // Create a legend
    const legend = L.control({ position: 'topright' });
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const depths = [0, 10, 30, 50, 70, 90];
      const labels = [];

      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i class="depth-legend" style="background:' + getColor(depths[i] + 1) + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }

      return div;
    };
    legend.addTo(map);
  });

// Function to get the color based on depth
function getColor(depth) {
  return depth > 90 ? '#FF0000' :
    depth > 70 ? '#FF4500' :
    depth > 50 ? '#FF8C00' :
    depth > 30 ? '#FFA500' :
    depth > 10 ? '#FFD700' :
    '#FFFF00';
}
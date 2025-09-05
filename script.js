// Weather App Script
// This script fetches weather data from the WeatherAPI and displays it on a map using Leaflet and OpenStreetMap.

let map; // Global map variable

async function getWeather() {
  const userInput = document.getElementById("locationInput").value.trim();
  const location = userInput || "Mumbai"; // default fallback

  const apiKey = "600a1b8e1a8e48889e252514252606";
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=yes`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location not found");

    const data = await response.json();

    const locationData = data.location;
    const currentData = data.current;

    const resultHtml = `
      <h2>Weather Details for ${locationData.name}, ${locationData.region}, ${locationData.country}</h2>
      <p><strong>Local Time:</strong> ${locationData.localtime}</p>
      <p><strong>Latitude:</strong> ${locationData.lat}</p>
      <p><strong>Longitude:</strong> ${locationData.lon}</p>
      <p><strong>Temperature:</strong> ${currentData.temp_c}°C (${currentData.temp_f}°F)</p>
      <p><strong>Condition:</strong> ${currentData.condition.text}</p>
      <img src="${currentData.condition.icon}" alt="Weather Icon" class="weather-icon" />
      <p><strong>Humidity:</strong> ${currentData.humidity}%</p>
      <p><strong>Wind:</strong> ${currentData.wind_kph} kph (${currentData.wind_mph} mph)</p>
      <p><strong>Feels Like:</strong> ${currentData.feelslike_c}°C</p>
      <p><strong>UV Index:</strong> ${currentData.uv}</p>
      <p><strong>Cloud Coverage:</strong> ${currentData.cloud}%</p>
      <p><strong>Air Quality (PM2.5):</strong> ${currentData.air_quality.pm2_5?.toFixed(2) || "N/A"}</p>
    `;

    document.getElementById("weatherResult").innerHTML = resultHtml;
    document.getElementById("weatherSection").style.display = "block";

    // Show location on map
    showMap(locationData.lat, locationData.lon, locationData.name);
    

  } catch (error) {
    document.getElementById("weatherResult").innerHTML = 
      `<p style="color:red;">Error: ${error.message}. Please try again.</p>`;
    document.getElementById("weatherSection").style.display = "none";
  }
}

function showMap(lat, lon, placeName) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  } else {
    map.setView([lat, lon], 11);
  }


  // Clear old markers by removing all layers except tile layer
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`📍 ${placeName}`)
    .openPopup();
}

// Clear screen function
function clearWeather() {
  document.getElementById("locationInput").value = "";
  document.getElementById("weatherResult").innerHTML = "";
  document.getElementById("weatherSection").style.display = "none";
  // Optionally, reset the map view or remove the marker if needed
}

// Attach event to Clear button
document.getElementById("clearBtn").addEventListener("click", clearWeather);

// Enable Enter key to trigger getWeather
document.getElementById("locationInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    getWeather();
  }
});

// Initial call to set default location
getWeather();

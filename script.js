let map;
let marker;

// Toggle dark mode
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Fetch weather
async function getWeather() {
  const location = document.getElementById("locationInput").value.trim() || "Mumbai";
  const apiKey = "8808c369e784420a90061355250509";
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=yes`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();

    const { location: loc, current } = data;

    document.getElementById("weatherResult").innerHTML = `
      <h2>${loc.name}, ${loc.region}, ${loc.country}</h2>
      <p><strong>Local Time:</strong> ${loc.localtime}</p>
      <p><strong>Temperature:</strong> ${current.temp_c}°C</p>
      <p><strong>Condition:</strong> ${current.condition.text}</p>
      <img src="${current.condition.icon}" alt="Weather Icon" class="weather-icon"/>
      <p><strong>Humidity:</strong> ${current.humidity}%</p>
      <p><strong>Wind:</strong> ${current.wind_kph} kph</p>
      <p><strong>Feels Like:</strong> ${current.feelslike_c}°C</p>
      <p><strong>UV Index:</strong> ${current.uv}</p>
      <p><strong>Air Quality (PM2.5):</strong> ${current.air_quality.pm2_5?.toFixed(2) || "N/A"}</p>
    `;

    document.getElementById("weatherSection").classList.remove("hidden");
    showMap(loc.lat, loc.lon, loc.name);

  } catch (error) {
    document.getElementById("weatherResult").innerHTML =
      `<p style="color:red;">❌ ${error.message}. Try again.</p>`;
    document.getElementById("weatherSection").classList.add("hidden");
  }
}

// Show map with Leaflet
function showMap(lat, lon, place) {
  if (!map) {
    map = L.map("map").setView([lat, lon], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  } else {
    map.setView([lat, lon], 11);
    if (marker) map.removeLayer(marker);
  }

  marker = L.marker([lat, lon]).addTo(map).bindPopup(`📍 ${place}`).openPopup();
}

// Clear function
function clearWeather() {
  document.getElementById("locationInput").value = "";
  document.getElementById("weatherResult").innerHTML = "";
  document.getElementById("weatherSection").classList.add("hidden");
}
document.getElementById("clearBtn").addEventListener("click", clearWeather);

// Enter key triggers search
document.getElementById("locationInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    getWeather();
  }
});

// Initial load
getWeather();


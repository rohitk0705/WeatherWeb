let map;
let marker;

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const searchForm = document.getElementById("searchForm");
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");
  const locationInput = document.getElementById("locationInput");
  const apiInput = document.getElementById("apikey");
  const spinner = document.getElementById("spinner");
  const weatherSection = document.getElementById("weatherSection");
  const weatherResult = document.getElementById("weatherResult");

  // Dark mode toggle
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
  });

  // handle form submit (Enter or click)
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    getWeather();
  });

  // clear button
  clearBtn.addEventListener("click", () => {
    locationInput.value = "";
    weatherResult.innerHTML = "";
    weatherSection.classList.add("hidden");
    // optional: keep apikey; if you want to clear it too, uncomment next line:
    // apiInput.value = "";
  });

  // core function
  async function getWeather() {
    const location = (locationInput.value || "").trim() || "Mumbai";
    const apiKey = (apiInput.value || "").trim();

    if (!apiKey) {
      alert("Please enter your WeatherAPI key.");
      return;
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(location)}&aqi=yes`;

    try {
      if (spinner) {
        spinner.style.display = "block";
        spinner.setAttribute("aria-hidden", "false");
      }

      const response = await fetch(url);
      if (!response.ok) {
        // try to read error body for debugging
        const bodyText = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status} ${response.statusText} ${bodyText}`);
      }

      const data = await response.json();
      const { location: loc, current } = data;

      // safe icon URL (WeatherAPI sometimes returns protocol-relative)
      const rawIcon = current?.condition?.icon || "";
      const iconUrl = rawIcon.startsWith("//") ? `https:${rawIcon}` : rawIcon;

      // safe PM2.5
      const pm25 =
        current && current.air_quality && typeof current.air_quality.pm2_5 === "number"
          ? current.air_quality.pm2_5.toFixed(2)
          : "N/A";

      weatherResult.innerHTML = `
        <h2>${escapeHtml(loc.name)}, ${escapeHtml(loc.region)}, ${escapeHtml(loc.country)}</h2>
        <p><strong>Local Time:</strong> ${escapeHtml(loc.localtime)}</p>
        <p><strong>Temperature:</strong> ${escapeHtml(String(current.temp_c))}°C</p>
        <p><strong>Condition:</strong> ${escapeHtml(current.condition.text || "")}</p>
        ${iconUrl ? `<img src="${iconUrl}" alt="Weather Icon" class="weather-icon"/>` : ""}
        <p><strong>Humidity:</strong> ${escapeHtml(String(current.humidity))}%</p>
        <p><strong>Wind:</strong> ${escapeHtml(String(current.wind_kph))} kph</p>
        <p><strong>Feels Like:</strong> ${escapeHtml(String(current.feelslike_c))}°C</p>
        <p><strong>UV Index:</strong> ${escapeHtml(String(current.uv))}</p>
        <p><strong>Air Quality (PM2.5):</strong> ${pm25}</p>
      `;

      weatherSection.classList.remove("hidden");
      showMap(loc.lat, loc.lon, loc.name);

    } catch (err) {
      console.error("getWeather error:", err);
      weatherResult.innerHTML = `<p style="color:red;">❌ ${escapeHtml(err.message || "An error occurred")}</p>`;
      weatherSection.classList.add("hidden");
    } finally {
      if (spinner) {
        spinner.style.display = "none";
        spinner.setAttribute("aria-hidden", "true");
      }
    }
  }

  // show map with Leaflet
  function showMap(lat, lon, place) {
    if (!lat || !lon) return;

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

  // simple HTML-escape helper to avoid injection when showing text
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});

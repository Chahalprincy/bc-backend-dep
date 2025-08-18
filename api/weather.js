// backend/api/weather.js
import express from "express";
// import requireUser from "../middleware/requireUser.js";

const router = express.Router();

// 5-minute in-memory cache
const cache = new Map();
const TTL = 5 * 60 * 1000;

function parseLocation(loc) {
  if (!loc) return null;
  const [latStr, lonStr] = loc.split(",");
  const lat = Number(latStr);
  const lon = Number(lonStr);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

async function fetchOpenMeteo({ lat, lon, units = "imperial" }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,apparent_temperature,weather_code",
    hourly: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    timezone: "auto",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather provider error ${res.status}`);
  return res.json();
}
const DEFAULT_COORDS = { lat: 37.7749, lon: -122.4194 };

// GET /api/weather/me -> weather for the logged-in user's saved coords
router.get("/", async (req, res, next) => {
  try {
    const units = req.query.units === "imperial" ? "imperial" : "metric";
    let coords = parseLocation(req.user?.location);

    if (!coords && req.query.lat && req.query.lon) {
      const lat = Number(req.query.lat);
      const lon = Number(req.query.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) coords = { lat, lon };
    }

    if (!coords) coords = DEFAULT_COORDS;

    const key = `${coords.lat},${coords.lon},${units}`;
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && now - hit.t < TTL) return res.json(hit.data);

     const data = await fetchOpenMeteo({ ...coords, units });
    cache.set(key, { t: now, data });
    res.json(data);
  } catch (e) {
    next(e);
  }
});
export default router;

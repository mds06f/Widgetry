const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../database');

// GET all widgets
router.get('/', (req, res) => {
  try {
    const widgets = db.getAll();
    res.json(widgets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch widgets' });
  }
});

// GET widget by ID
router.get('/:id', (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    res.json(widget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch widget' });
  }
});

// POST create widget
router.post('/', (req, res) => {
  try {
    const { type, name, config } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Widget type is required' });
    }
    const newWidget = db.create({ type, name, config });
    res.status(201).json(newWidget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create widget' });
  }
});

// PUT update widget
router.put('/:id', (req, res) => {
  try {
    const { name, config } = req.body;
    const updated = db.update(req.params.id, { name, config });
    if (!updated) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update widget' });
  }
});

// DELETE widget
router.delete('/:id', (req, res) => {
  try {
    const success = db.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    res.json({ message: 'Widget deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete widget' });
  }
});

// GET weather proxy endpoint
router.get('/proxy/weather', async (req, res) => {
  const city = req.query.city || 'San Francisco';
  try {
    // 1. Geocode city name to lat/long using Open-Meteo Geocoding API
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geocodeRes = await axios.get(geocodeUrl);
    
    if (!geocodeRes.data.results || geocodeRes.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { latitude, longitude, name, country } = geocodeRes.data.results[0];

    // 2. Fetch current weather conditions
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherRes = await axios.get(weatherUrl);

    if (!weatherRes.data.current_weather) {
      return res.status(500).json({ error: 'Failed to fetch weather conditions' });
    }

    const { temperature, weathercode } = weatherRes.data.current_weather;

    // 3. Map weather codes to friendly descriptions
    // Reference: WMO weather interpretation codes
    const weatherCodeMap = {
      0: { condition: 'Clear Sky', icon: 'Sun' },
      1: { condition: 'Mainly Clear', icon: 'CloudSun' },
      2: { condition: 'Partly Cloudy', icon: 'CloudSun' },
      3: { condition: 'Overcast', icon: 'Cloud' },
      45: { condition: 'Foggy', icon: 'CloudFog' },
      48: { condition: 'Depositing Rime Fog', icon: 'CloudFog' },
      51: { condition: 'Light Drizzle', icon: 'CloudDrizzle' },
      53: { condition: 'Moderate Drizzle', icon: 'CloudDrizzle' },
      55: { condition: 'Dense Drizzle', icon: 'CloudDrizzle' },
      61: { condition: 'Slight Rain', icon: 'CloudRain' },
      63: { condition: 'Moderate Rain', icon: 'CloudRain' },
      65: { condition: 'Heavy Rain', icon: 'CloudRain' },
      71: { condition: 'Slight Snowfall', icon: 'CloudSnow' },
      73: { condition: 'Moderate Snowfall', icon: 'CloudSnow' },
      75: { condition: 'Heavy Snowfall', icon: 'CloudSnow' },
      80: { condition: 'Slight Rain Showers', icon: 'CloudRain' },
      81: { condition: 'Moderate Rain Showers', icon: 'CloudRain' },
      82: { condition: 'Violent Rain Showers', icon: 'CloudRain' },
      95: { condition: 'Thunderstorm', icon: 'CloudLightning' }
    };

    const details = weatherCodeMap[weathercode] || { condition: 'Moderate Weather', icon: 'Cloud' };

    res.json({
      city: name,
      country: country || '',
      temperature,
      condition: details.condition,
      icon: details.icon,
      latitude,
      longitude
    });

  } catch (err) {
    console.error('Weather Proxy Error:', err.message);
    res.status(500).json({ error: 'Weather service currently unavailable' });
  }
});

module.exports = router;

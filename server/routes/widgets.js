const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_widgetry_key';

// Helper to get optional user from request headers
function getOptionalUser(req) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return null;
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') return null;
  try {
    return jwt.verify(tokenParts[1], JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// GET all widgets (optionally filtered by user)
router.get('/', (req, res) => {
  try {
    const user = getOptionalUser(req);
    const widgets = db.getAll();
    
    if (user) {
      // Return user's widgets and anonymous widgets
      const userWidgets = widgets.filter(w => w.userId === user.id || !w.userId);
      res.json(userWidgets);
    } else {
      // Return only anonymous widgets
      const anonymousWidgets = widgets.filter(w => !w.userId);
      res.json(anonymousWidgets);
    }
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
    
    // Anyone can read anonymous widgets, but private ones require ownership check
    if (widget.userId) {
      const user = getOptionalUser(req);
      if (!user || user.id !== widget.userId) {
        return res.status(403).json({ error: 'Access denied: private widget' });
      }
    }
    
    res.json(widget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch widget' });
  }
});

// POST create widget (can be associated with user)
router.post('/', (req, res) => {
  try {
    const { type, name, config } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Widget type is required' });
    }
    
    const user = getOptionalUser(req);
    const userId = user ? user.id : null;
    
    const newWidget = db.create({ type, name, config, userId });
    res.status(201).json(newWidget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create widget' });
  }
});

// PUT update widget
router.put('/:id', (req, res) => {
  try {
    const { name, config } = req.body;
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    // Check ownership if private
    if (widget.userId) {
      const user = getOptionalUser(req);
      if (!user || user.id !== widget.userId) {
        return res.status(403).json({ error: 'Access denied: private widget' });
      }
    }

    const updated = db.update(req.params.id, { name, config });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update widget' });
  }
});

// DELETE widget
router.delete('/:id', (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    // Check ownership if private
    if (widget.userId) {
      const user = getOptionalUser(req);
      if (!user || user.id !== widget.userId) {
        return res.status(403).json({ error: 'Access denied: private widget' });
      }
    }

    db.delete(req.params.id);
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

// POST webhook data update
router.post('/:id/webhook', (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    const { token } = req.query;
    if (!token || token !== widget.config.webhookToken) {
      return res.status(403).json({ error: 'Invalid webhook token' });
    }

    // Merge incoming JSON payload directly into widget config
    const updatedConfig = {
      ...widget.config,
      ...req.body
    };

    const updated = db.update(req.params.id, { config: updatedConfig });

    // Emit live WebSocket update to the widget edit room
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('config-updated', { config: updatedConfig });
    }

    res.json({
      message: 'Webhook received and widget updated successfully',
      config: updated.config
    });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    res.status(500).json({ error: 'Failed to process webhook data' });
  }
});

module.exports = router;

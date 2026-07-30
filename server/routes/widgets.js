const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../database');
const analyticsDb = require('../database_analytics');
const { apiCache } = require('../middleware/cache');

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

    let filteredWidgets = [];
    if (user) {
      // Return user's widgets and anonymous widgets
      filteredWidgets = widgets.filter(
        (w) => w.userId === user.id || !w.userId,
      );
    } else {
      // Return only anonymous widgets
      filteredWidgets = widgets.filter((w) => !w.userId);
    }

    // Attach views analytics count
    const result = filteredWidgets.map((w) => {
      const stats = analyticsDb.getAnalytics(w.id);
      return {
        ...w,
        views: stats.totalViews,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch widgets' });
  }
});

// POST /api/widgets/reorder - Update ordering of widgets
router.post('/reorder', (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }
    const widgets = db.getAll();
    const updated = widgets.map((w) => {
      const idx = orderedIds.indexOf(w.id);
      if (idx !== -1) {
        return { ...w, position: idx };
      }
      return w;
    });
    db.saveAll(updated);
    res.json({ success: true, message: 'Widget order updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder widgets' });
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

// GET widget CSP directive status and header configuration
router.get('/:id/csp', (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    const csp =
      widget.config?.cspDirective ||
      "default-src 'self' 'unsafe-inline' https:;";
    res.setHeader('Content-Security-Policy', csp);
    res.json({ id: widget.id, cspDirective: csp, status: 'enforced' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch CSP configuration' });
  }
});

// POST trigger outbound webhook to custom target URL
router.post('/:id/trigger-webhook', async (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    const targetUrl = widget.config?.outboundWebhookUrl || req.body?.webhookUrl;
    if (!targetUrl) {
      return res
        .status(400)
        .json({ error: 'No outbound webhook URL configured' });
    }

    const payload = {
      event: req.body?.event || 'widget_event',
      widgetId: widget.id,
      widgetName: widget.name,
      timestamp: new Date().toISOString(),
      data: req.body?.data || {},
    };

    try {
      await axios.post(targetUrl, payload, { timeout: 5000 });
      res.json({ success: true, deliveredTo: targetUrl, payload });
    } catch (err) {
      res
        .status(502)
        .json({
          error: 'Failed to deliver webhook payload',
          details: err.message,
        });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error handling outbound webhook' });
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

// GET weather proxy endpoint (cached for 5 minutes)
router.get('/proxy/weather', apiCache(5 * 60 * 1000), async (req, res) => {
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
      return res
        .status(500)
        .json({ error: 'Failed to fetch weather conditions' });
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
      95: { condition: 'Thunderstorm', icon: 'CloudLightning' },
    };

    const details = weatherCodeMap[weathercode] || {
      condition: 'Moderate Weather',
      icon: 'Cloud',
    };

    res.json({
      city: name,
      country: country || '',
      temperature,
      condition: details.condition,
      icon: details.icon,
      latitude,
      longitude,
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
      ...req.body,
    };

    const updated = db.update(req.params.id, { config: updatedConfig });

    // Emit live WebSocket update to the widget edit room
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('config-updated', { config: updatedConfig });
    }

    res.json({
      message: 'Webhook received and widget updated successfully',
      config: updated.config,
    });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    res.status(500).json({ error: 'Failed to process webhook data' });
  }
});

// GET export widget bundle
router.get('/:id/export', (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    // 1. Resolve widget type React view file path
    const viewFilePath = path.join(
      __dirname,
      `../../client/src/widgets/${widget.type}/${widget.type}WidgetView.jsx`,
    );
    if (!fs.existsSync(viewFilePath)) {
      return res.status(500).json({
        error: `Widget view for type '${widget.type}' not found on server`,
      });
    }

    let viewCode = fs.readFileSync(viewFilePath, 'utf8');

    // 2. Transpile/clean React JSX code for standard Babel CDN compile in index.html
    // Remove imports
    viewCode = viewCode.replace(/import\s+.*?;/g, '');
    // Strip "export default" to let Babel resolve components globally
    viewCode = viewCode.replace(
      /export\s+default\s+function\s+(\w+)/g,
      'function $1',
    );

    // 3. Assemble self-contained standalone HTML bundle
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${widget.name || 'Widgetry Widget'}</title>
  
  <!-- Premium Outfit Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">
  
  <!-- React & ReactDOM CDN -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  
  <!-- Babel standalone compiler -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }
    html, body, #root {
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

    // Preserved GRADIENTS map
    const GRADIENTS = {
      royal:     'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      ocean:     'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      arctic:    'linear-gradient(135deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)',
      midnight:  'linear-gradient(135deg, #0d0d2b 0%, #1a1a5e 50%, #3d348b 100%)',
      cosmic:    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      nebula:    'linear-gradient(135deg, #3d0366 0%, #c6007e 100%)',
      aurora:    'linear-gradient(135deg, #007991 0%, #78ffd6 100%)',
      lavender:  'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
      sunset:    'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
      ember:     'linear-gradient(135deg, #c31432 0%, #240b36 100%)',
      peach:     'linear-gradient(135deg, #ed4264 0%, #ffedbc 100%)',
      gold:      'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      forest:    'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      emerald:   'linear-gradient(135deg, #0f9b58 0%, #00bf8f 100%)',
      lime:      'linear-gradient(135deg, #acb6e5 0%, #86fde8 100%)',
      neon:      'linear-gradient(135deg, #0575e6 0%, #00f260 100%)',
      synthwave: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
      cyberpunk: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
      darkness:  'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
      obsidian:  'linear-gradient(135deg, #1c1c1c 0%, #3d3d3d 100%)'
    };

    // Configuration object
    const widgetConfig = ${JSON.stringify(widget.config, null, 2)};

    // Component source
    ${viewCode}

    // Dynamic React mount
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);

    const ComponentToRender = 
      (typeof ClockWidgetView !== 'undefined' && ClockWidgetView) ||
      (typeof QuoteWidgetView !== 'undefined' && QuoteWidgetView) ||
      (typeof WeatherWidgetView !== 'undefined' && WeatherWidgetView) ||
      (typeof CountdownWidgetView !== 'undefined' && CountdownWidgetView) ||
      (typeof TodoWidgetView !== 'undefined' && TodoWidgetView) ||
      (typeof GithubStatsWidgetView !== 'undefined' && GithubStatsWidgetView) ||
      (typeof CryptoTickerWidgetView !== 'undefined' && CryptoTickerWidgetView) ||
      (typeof AnalogClockWidgetView !== 'undefined' && AnalogClockWidgetView) ||
      (typeof TriviaWidgetView !== 'undefined' && TriviaWidgetView) ||
      (typeof PomodoroWidgetView !== 'undefined' && PomodoroWidgetView) ||
      (typeof SpotifyWidgetView !== 'undefined' && SpotifyWidgetView);

    if (ComponentToRender) {
      root.render(<ComponentToRender config={widgetConfig} />);
    } else {
      root.render(<div>Error loading widget component.</div>);
    }
  </script>
</body>
</html>`;

    // 4. Create ZIP bundle
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    zip.addFile('index.html', Buffer.from(htmlContent, 'utf-8'));

    const zipBuffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${widget.type}-widget-${widget.id}.zip`,
    );
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);
  } catch (err) {
    console.error('Export Error:', err.message);
    res.status(500).json({ error: 'Failed to export widget' });
  }
});

// POST track widget impression
router.post('/:id/track', (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    // Get referrer domain from headers
    const rawReferrer = req.headers.referer || req.headers.referrer || null;
    analyticsDb.recordHit(req.params.id, rawReferrer);

    res.json({ message: 'Impression tracked successfully' });
  } catch (err) {
    console.error('Tracking Error:', err.message);
    res.status(500).json({ error: 'Failed to track widget impression' });
  }
});

// GET widget analytics report
router.get('/:id/analytics', (req, res) => {
  try {
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    // Perform widget ownership verification if user-auth is enabled on private widgets
    if (widget.userId) {
      const user = getOptionalUser(req);
      if (!user || user.id !== widget.userId) {
        return res
          .status(403)
          .json({ error: 'Access denied: private analytics' });
      }
    }

    const report = analyticsDb.getAnalytics(req.params.id);
    res.json(report);
  } catch (err) {
    console.error('Analytics Fetch Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch widget analytics' });
  }
});

// POST share widget across team / organization scope
router.post('/:id/share-org', (req, res) => {
  try {
    const { orgId, accessLevel = 'view' } = req.body;
    const widget = db.getById(req.params.id);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    const updatedConfig = {
      ...(widget.config || {}),
      sharedOrgId: orgId,
      orgAccessLevel: accessLevel,
    };
    const updated = db.update(req.params.id, { config: updatedConfig });
    res.json({
      message: 'Widget successfully shared with organization',
      widget: updated,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to share widget with organization' });
  }
});

module.exports = router;

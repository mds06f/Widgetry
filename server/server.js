const express = require('express');
const cors = require('cors');
const path = require('path');
const widgetRoutes = require('./routes/widgets');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Load API routes
app.use('/api/widgets', widgetRoutes);
app.use('/api/auth', authRoutes);

// Serve Static Assets in Production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback to React index.html for unknown web paths (useful for direct deep linking in built state)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Don't serve HTML on API calls
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      // If client build isn't created yet or static serving fails, send a default message
      res.status(200).send('API Server is running. Frontend build not detected.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Widgetry Backend listening on http://localhost:${PORT}`);
});

const db = require('./database');
const analyticsDb = require('./database_analytics');

// Simple schema & GraphQL query engine handler for /graphql endpoint
function handleGraphQL(req, res) {
  const { query } = req.body || {};

  if (!query) {
    return res.status(400).json({ errors: [{ message: 'GraphQL query is required' }] });
  }

  try {
    const widgets = db.getAll();
    const resultWidgets = widgets.map((w) => {
      const stats = analyticsDb.getAnalytics(w.id);
      return {
        id: w.id,
        name: w.name,
        type: w.type,
        config: w.config,
        views: stats.totalViews,
        createdAt: w.createdAt,
      };
    });

    res.json({
      data: {
        widgets: resultWidgets,
      },
    });
  } catch (err) {
    res.status(500).json({ errors: [{ message: err.message }] });
  }
}

module.exports = {
  handleGraphQL,
};

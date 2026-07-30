// Simple in-memory proxy response cache middleware
const cacheStore = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function apiCache(ttlMs = DEFAULT_TTL_MS) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = req.originalUrl || req.url;
    const cached = cacheStore.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Intercept json response to populate cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheStore.set(cacheKey, {
          data: body,
          expiresAt: Date.now() + ttlMs,
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

function clearCache() {
  cacheStore.clear();
}

module.exports = {
  apiCache,
  clearCache,
};

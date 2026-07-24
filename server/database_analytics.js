const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, 'hits.json');

function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function getAll() {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading hits database file:', err);
    return [];
  }
}

function saveAll(hits) {
  initDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(hits, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to hits database file:', err);
    return false;
  }
}

function recordHit(widgetId, rawReferrer) {
  const hits = getAll();

  // Clean referrer to domain name
  let referrer = 'Direct / Unknown';
  if (rawReferrer && rawReferrer !== 'null') {
    try {
      const url = new URL(rawReferrer);
      referrer = url.hostname;
    } catch {
      referrer = rawReferrer;
    }
  }

  const newHit = {
    id: uuidv4(),
    widgetId,
    referrer,
    timestamp: new Date().toISOString(),
  };

  hits.push(newHit);
  saveAll(hits);
  return newHit;
}

function getAnalytics(widgetId) {
  const hits = getAll();
  const widgetHits = hits.filter((h) => h.widgetId === widgetId);

  const totalViews = widgetHits.length;

  // Aggregate referrers
  const referrerCounts = {};
  widgetHits.forEach((hit) => {
    referrerCounts[hit.referrer] = (referrerCounts[hit.referrer] || 0) + 1;
  });

  // Convert to sorted array
  const referrersList = Object.keys(referrerCounts)
    .map((domain) => ({
      domain,
      count: referrerCounts[domain],
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalViews,
    referrers: referrersList,
  };
}

module.exports = {
  recordHit,
  getAnalytics,
};

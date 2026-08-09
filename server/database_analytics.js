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

function getDetailedAnalytics(widgetId) {
  const stats = getAnalytics(widgetId);
  const hits = getAll().filter((h) => h.widgetId === widgetId);
  const now = new Date();

  // 1. Hourly Breakdown (past 24 hours, grouped by hour)
  const hourlyBreakdown = {};
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i);
    const hourStr = `${String(d.getHours()).padStart(2, '0')}:00`;
    hourlyBreakdown[hourStr] = 0;
  }

  // 2. Daily Breakdown (past 7 days, grouped by day)
  const dailyBreakdown = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyBreakdown[dateStr] = 0;
  }

  // 3. Weekly Breakdown (past 4 weeks, grouped by week)
  const weeklyBreakdown = {};
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const dateStr = d.toISOString().split('T')[0];
    weeklyBreakdown[dateStr] = 0;
  }

  hits.forEach((h) => {
    if (!h.timestamp) return;
    const hitDate = new Date(h.timestamp);
    const timeDiffMs = now - hitDate;

    // Hourly matching (within past 24 hours)
    if (timeDiffMs <= 24 * 60 * 60 * 1000) {
      const hourStr = `${String(hitDate.getHours()).padStart(2, '0')}:00`;
      if (hourlyBreakdown[hourStr] !== undefined) {
        hourlyBreakdown[hourStr]++;
      }
    }

    // Daily matching (within past 7 days)
    const dateStr = h.timestamp.split('T')[0];
    if (dailyBreakdown[dateStr] !== undefined) {
      dailyBreakdown[dateStr]++;
    }

    // Weekly matching (within past 28 days)
    const weeksAgo = Math.floor(timeDiffMs / (7 * 24 * 60 * 60 * 1000));
    if (weeksAgo >= 0 && weeksAgo < 4) {
      const weekKeys = Object.keys(weeklyBreakdown);
      const key = weekKeys[3 - weeksAgo];
      if (key && weeklyBreakdown[key] !== undefined) {
        weeklyBreakdown[key]++;
      }
    }
  });

  return {
    totalViews: stats.totalViews,
    topReferrer: stats.referrers.length > 0 ? stats.referrers[0].domain : 'None',
    referrers: stats.referrers,
    hourlyBreakdown: Object.keys(hourlyBreakdown).map((hour) => ({
      label: hour,
      views: hourlyBreakdown[hour],
    })),
    dailyBreakdown: Object.keys(dailyBreakdown).map((date) => ({
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      views: dailyBreakdown[date],
    })),
    weeklyBreakdown: Object.keys(weeklyBreakdown).map((week, idx) => ({
      label: `Wk ${idx + 1}`,
      views: weeklyBreakdown[week],
    })),
  };
}

module.exports = {
  recordHit,
  getAnalytics,
  getDetailedAnalytics,
};

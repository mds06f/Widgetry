import React from 'react';

export default function RSSFeedWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="config-group">
      <h3>RSS Feed Settings</h3>

      <div className="config-field">
        <label>Feed URL</label>
        <input
          type="text"
          value={config.feedUrl || ''}
          onChange={(e) => handleUpdate('feedUrl', e.target.value)}
          placeholder="https://news.ycombinator.com/rss"
        />
      </div>

      <div className="config-field">
        <label>Heading Size</label>
        <select
          value={config.headerSize || '1rem'}
          onChange={(e) => handleUpdate('headerSize', e.target.value)}
        >
          <option value="0.85rem">Small</option>
          <option value="1rem">Medium</option>
          <option value="1.2rem">Large</option>
        </select>
      </div>

      <div className="config-field">
        <label>Background Style</label>
        <select
          value={config.backgroundStyle || 'solid'}
          onChange={(e) => handleUpdate('backgroundStyle', e.target.value)}
        >
          <option value="solid">Solid Color</option>
          <option value="gradient">Gradient Presets</option>
        </select>
      </div>
    </div>
  );
}

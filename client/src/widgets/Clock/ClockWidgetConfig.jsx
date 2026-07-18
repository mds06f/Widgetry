import React from 'react';

export default function ClockWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="config-group">
      <h3>Clock Configuration</h3>

      <div className="config-field">
        <label>Time Format</label>
        <select
          value={config.timeFormat || '12'}
          onChange={(e) => handleUpdate('timeFormat', e.target.value)}
        >
          <option value="12">12-Hour Clock (AM/PM)</option>
          <option value="24">24-Hour Clock</option>
        </select>
      </div>

      <div className="config-field toggle-field">
        <label>Show Seconds</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showSeconds !== false}
            onChange={(e) => handleUpdate('showSeconds', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field">
        <label>Font Size</label>
        <select
          value={config.fontSize || '36px'}
          onChange={(e) => handleUpdate('fontSize', e.target.value)}
        >
          <option value="24px">Small (24px)</option>
          <option value="36px">Medium (36px)</option>
          <option value="48px">Large (48px)</option>
          <option value="64px">Extra Large (64px)</option>
        </select>
      </div>

      <div className="config-field">
        <label>Font Style</label>
        <select
          value={config.fontFamily || 'Outfit'}
          onChange={(e) => handleUpdate('fontFamily', e.target.value)}
        >
          <option value="Outfit">Modern Sans (Outfit)</option>
          <option value="monospace">Digital Coding (Monospace)</option>
        </select>
      </div>

      <div className="config-row">
        <div className="config-field">
          <label>Text Color</label>
          <input
            type="color"
            value={config.textColor || '#ffffff'}
            onChange={(e) => handleUpdate('textColor', e.target.value)}
          />
        </div>
        <div className="config-field">
          <label>Background</label>
          <input
            type="color"
            value={config.backgroundColor === 'transparent' ? '#000000' : config.backgroundColor}
            onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
          />
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '0.2rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
            onClick={() => handleUpdate('backgroundColor', 'transparent')}
          >
            Clear Transparent
          </button>
        </div>
      </div>

      <div className="config-field">
        <label>Background Image URL</label>
        <input
          type="text"
          value={config.backgroundImageUrl || ''}
          onChange={(e) => handleUpdate('backgroundImageUrl', e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
        />
      </div>
    </div>
  );
}

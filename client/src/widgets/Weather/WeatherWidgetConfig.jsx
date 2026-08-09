import React, { useState, useEffect } from 'react';
import { GRADIENTS } from '../index';

export default function WeatherWidgetConfig({ config, onChange }) {
  const [localCity, setLocalCity] = useState(config.city || 'Paris');

  // Sync state if config.city changes externally (e.g. from defaults)
  useEffect(() => {
    setLocalCity(config.city || 'Paris');
  }, [config.city]);

  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  // Wait for user to stop typing before trigger API updates to avoid spamming the backend
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (localCity.trim()) {
        handleUpdate('city', localCity.trim());
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [localCity]);

  return (
    <div className="config-group">
      <h3>Weather Configuration</h3>

      <div className="config-field">
        <label>Search City</label>
        <input
          type="text"
          value={localCity}
          onChange={(e) => setLocalCity(e.target.value)}
          placeholder="e.g. New York, Tokyo"
        />
      </div>

      <div className="config-field">
        <label>Multi-City Slideshow (comma separated)</label>
        <input
          type="text"
          className="input"
          value={config.citiesList || ''}
          onChange={(e) => handleUpdate('citiesList', e.target.value)}
          placeholder="e.g. Paris, London, Tokyo"
        />
      </div>

      <div className="config-field toggle-field">
        <label>Enable Multi-City Slideshow</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.enableSlideshow === true}
            onChange={(e) => handleUpdate('enableSlideshow', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field">
        <label>Temperature Unit</label>
        <select
          value={config.unit || 'C'}
          onChange={(e) => handleUpdate('unit', e.target.value)}
        >
          <option value="C">Celsius (°C)</option>
          <option value="F">Fahrenheit (°F)</option>
        </select>
      </div>

      <div className="config-field toggle-field">
        <label>Show Detailed Metrics</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showDetails === true}
            onChange={(e) => handleUpdate('showDetails', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {config.showDetails && (
        <div style={{ marginLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <div className="config-field toggle-field" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem' }}>Show Humidity</label>
            <label className="toggle-switch" style={{ transform: 'scale(0.85)' }}>
              <input
                type="checkbox"
                checked={config.showHumidity !== false}
                onChange={(e) => handleUpdate('showHumidity', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="config-field toggle-field" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem' }}>Show Wind Speed</label>
            <label className="toggle-switch" style={{ transform: 'scale(0.85)' }}>
              <input
                type="checkbox"
                checked={config.showWindSpeed !== false}
                onChange={(e) => handleUpdate('showWindSpeed', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      )}

      <div className="config-field">
        <label>Background Style</label>
        <select
          value={config.backgroundStyle || 'gradient'}
          onChange={(e) => handleUpdate('backgroundStyle', e.target.value)}
        >
          <option value="gradient">Gradient Presets</option>
          <option value="solid">Solid Background Color</option>
        </select>
      </div>

      {config.backgroundStyle === 'solid' ? (
        <div className="config-row">
          <div className="config-field">
            <label>Background Color</label>
            <input
              type="color"
              value={config.backgroundColor || '#131a30'}
              onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Text Color</label>
            <input
              type="color"
              value={config.textColor || '#ffffff'}
              onChange={(e) => handleUpdate('textColor', e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="config-field">
          <label>Gradient Theme</label>
          <div className="gradient-picker">
            {Object.keys(GRADIENTS).map((key) => (
              <div
                key={key}
                className={`gradient-option ${config.gradientName === key ? 'active' : ''}`}
                style={{ background: GRADIENTS[key] }}
                onClick={() => handleUpdate('gradientName', key)}
                title={key}
              />
            ))}
          </div>
        </div>
      )}

      <div className="config-field">
        <label>Background Image URL</label>
        <input
          type="text"
          value={config.backgroundImageUrl || ''}
          onChange={(e) => handleUpdate('backgroundImageUrl', e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
        />
      </div>

      <div className="config-field">
        <label>Card Corner Rounding</label>
        <select
          value={config.borderRadius || '12px'}
          onChange={(e) => handleUpdate('borderRadius', e.target.value)}
        >
          <option value="0px">Sharp Corners (0px)</option>
          <option value="6px">Subtle (6px)</option>
          <option value="12px">Rounded (12px)</option>
          <option value="24px">Extra Rounded (24px)</option>
        </select>
      </div>

      <div className="config-field">
        <label>Custom CSS</label>
        <textarea
          value={config.customCSS || ''}
          onChange={(e) => handleUpdate('customCSS', e.target.value)}
          placeholder={`/* Override any widget styles */\ndiv {\n  border: 2px solid rgba(255,255,255,0.2);\n  backdrop-filter: blur(8px);\n}`}
          rows={6}
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

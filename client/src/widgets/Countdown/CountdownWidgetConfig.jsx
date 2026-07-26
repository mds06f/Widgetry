import React from 'react';
import { GRADIENTS } from '../index';

export default function CountdownWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-group">
      <h3>Countdown Settings</h3>

      <div className="config-field">
        <label>Event Label</label>
        <input
          type="text"
          value={config.label || ''}
          onChange={(e) => handleUpdate('label', e.target.value)}
          placeholder="e.g. New Year, Product Launch…"
        />
      </div>

      <div className="config-field">
        <label>Target Date & Time</label>
        <input
          type="datetime-local"
          value={config.targetDate || ''}
          onChange={(e) => handleUpdate('targetDate', e.target.value)}
        />
      </div>

      <div className="config-field">
        <label>Target Reached Message</label>
        <input
          type="text"
          value={config.completionMessage || ''}
          onChange={(e) => handleUpdate('completionMessage', e.target.value)}
          placeholder="e.g. 🎉 Event Has Arrived!"
        />
      </div>

      <h3 style={{ marginTop: '0.5rem' }}>Display Units</h3>

      <div className="config-field toggle-field">
        <label>Show Days</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showDays !== false}
            onChange={(e) => handleUpdate('showDays', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field toggle-field">
        <label>Show Hours</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showHours !== false}
            onChange={(e) => handleUpdate('showHours', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field toggle-field">
        <label>Show Minutes</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showMinutes !== false}
            onChange={(e) => handleUpdate('showMinutes', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
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

      <h3 style={{ marginTop: '0.5rem' }}>Appearance</h3>

      <div className="config-row">
        <div className="config-field">
          <label>Text Color</label>
          <input
            type="color"
            value={config.textColor || '#ffffff'}
            onChange={(e) => handleUpdate('textColor', e.target.value)}
          />
        </div>
      </div>

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
        <div className="config-field">
          <label>Background Color</label>
          <input
            type="color"
            value={config.backgroundColor || '#1b2542'}
            onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
          />
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
          placeholder={`/* Override any widget styles */\ndiv {\n  letter-spacing: 0.05em;\n  text-shadow: 0 2px 12px rgba(0,0,0,0.4);\n}`}
          rows={6}
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

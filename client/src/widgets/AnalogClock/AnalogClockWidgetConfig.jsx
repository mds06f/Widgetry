import React from 'react';
import { GRADIENTS } from '../index';

export default function AnalogClockWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="config-group">
      <h3>Analog Clock Settings</h3>

      <div className="config-row">
        <div className="config-field">
          <label>Hour Hand Color</label>
          <input
            type="color"
            value={config.hourHandColor || '#ffffff'}
            onChange={(e) => handleUpdate('hourHandColor', e.target.value)}
          />
        </div>
        <div className="config-field">
          <label>Minute Hand Color</label>
          <input
            type="color"
            value={config.minuteHandColor || '#ffffff'}
            onChange={(e) => handleUpdate('minuteHandColor', e.target.value)}
          />
        </div>
      </div>

      <div className="config-row">
        <div className="config-field">
          <label>Second Hand Color</label>
          <input
            type="color"
            value={config.secondHandColor || '#ff4d4d'}
            onChange={(e) => handleUpdate('secondHandColor', e.target.value)}
          />
        </div>
        <div className="config-field">
          <label>Dial / Face Color</label>
          <input
            type="color"
            value={config.faceColor || 'rgba(0,0,0,0.2)'}
            onChange={(e) => handleUpdate('faceColor', e.target.value)}
          />
        </div>
      </div>

      <div className="config-field toggle-field">
        <label>Show Numbers (1-12)</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showNumbers !== false}
            onChange={(e) => handleUpdate('showNumbers', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field toggle-field">
        <label>Show Ticks</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showTicks !== false}
            onChange={(e) => handleUpdate('showTicks', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
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
        <div className="config-row">
          <div className="config-field">
            <label>Background Color</label>
            <input
              type="color"
              value={config.backgroundColor || '#1b2542'}
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
          placeholder={`/* Override any widget styles */\n.clock-center-dot {\n  fill: gold;\n}`}
          rows={6}
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

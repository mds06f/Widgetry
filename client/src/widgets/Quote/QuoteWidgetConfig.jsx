import React from 'react';
import { GRADIENTS } from '../index';

export default function QuoteWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Quote Settings</h3>

      <div className="config-field">
        <label>Quote Category</label>
        <select
          value={config.category || 'motivational'}
          onChange={(e) => handleUpdate('category', e.target.value)}
        >
          <option value="motivational">🏆 Motivational</option>
          <option value="developer">💻 Software Engineering</option>
          <option value="design">🎨 Art & Design</option>
        </select>
      </div>

      <div className="config-field">
        <label>Text Alignment</label>
        <select
          value={config.textAlign || 'center'}
          onChange={(e) => handleUpdate('textAlign', e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div style={{ border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Text Shadow Gradient</h4>
        <div className="config-row">
          <div className="config-field">
            <label>Offset X ({config.shadowOffsetX !== undefined ? config.shadowOffsetX : 2}px)</label>
            <input
              type="range"
              min="-15"
              max="15"
              value={config.shadowOffsetX !== undefined ? config.shadowOffsetX : 2}
              onChange={(e) => handleUpdate('shadowOffsetX', parseInt(e.target.value))}
            />
          </div>
          <div className="config-field">
            <label>Offset Y ({config.shadowOffsetY !== undefined ? config.shadowOffsetY : 2}px)</label>
            <input
              type="range"
              min="-15"
              max="15"
              value={config.shadowOffsetY !== undefined ? config.shadowOffsetY : 2}
              onChange={(e) => handleUpdate('shadowOffsetY', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="config-field">
          <label>Blur ({config.shadowBlur !== undefined ? config.shadowBlur : 4}px)</label>
          <input
            type="range"
            min="0"
            max="20"
            value={config.shadowBlur !== undefined ? config.shadowBlur : 4}
            onChange={(e) => handleUpdate('shadowBlur', parseInt(e.target.value))}
          />
        </div>

        <div className="config-field">
          <label>Shadow Gradient Theme</label>
          <select
            value={config.shadowGradient || 'none'}
            onChange={(e) => handleUpdate('shadowGradient', e.target.value)}
          >
            <option value="none">None (No Gradient Shadow)</option>
            {Object.keys(GRADIENTS).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="config-field toggle-field">
        <label>Show Author</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showAuthor !== false}
            onChange={(e) => handleUpdate('showAuthor', e.target.checked)}
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
          placeholder={`/* Override any widget styles */\ndiv {\n  font-style: italic;\n  backdrop-filter: blur(10px);\n}`}
          rows={6}
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

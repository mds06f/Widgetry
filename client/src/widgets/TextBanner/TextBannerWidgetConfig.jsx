import React from 'react';

export default function TextBannerWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Text Banner Settings</h3>

      <div className="config-field">
        <label>Banner Text</label>
        <input
          type="text"
          value={config.text !== undefined ? config.text : 'Welcome to Widgetry!'}
          onChange={(e) => handleUpdate('text', e.target.value)}
          placeholder="Enter banner text here..."
        />
      </div>

      <div className="config-field">
        <label>Font Size</label>
        <select
          value={config.fontSize || '24px'}
          onChange={(e) => handleUpdate('fontSize', e.target.value)}
        >
          <option value="16px">Small (16px)</option>
          <option value="20px">Medium (20px)</option>
          <option value="24px">Large (24px)</option>
          <option value="32px">Extra Large (32px)</option>
          <option value="48px">Huge (48px)</option>
        </select>
      </div>

      <div className="config-field">
        <label>Font Weight</label>
        <select
          value={config.fontWeight || 'bold'}
          onChange={(e) => handleUpdate('fontWeight', e.target.value)}
        >
          <option value="300">Light</option>
          <option value="normal">Normal</option>
          <option value="600">Semi-Bold</option>
          <option value="bold">Bold</option>
          <option value="800">Extra Bold</option>
        </select>
      </div>

      <div className="config-field">
        <label>Text Alignment</label>
        <select
          value={config.alignment || 'center'}
          onChange={(e) => handleUpdate('alignment', e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div className="config-field">
        <label>Letter Spacing</label>
        <select
          value={config.letterSpacing || 'normal'}
          onChange={(e) => handleUpdate('letterSpacing', e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="0.05em">Slightly Tracked</option>
          <option value="0.1em">Wide</option>
          <option value="0.2em">Extra Wide</option>
        </select>
      </div>

      <div className="config-field">
        <label>Font Family</label>
        <select
          value={config.fontFamily || 'Outfit'}
          onChange={(e) => handleUpdate('fontFamily', e.target.value)}
        >
          <option value="Outfit">Outfit</option>
          <option value="Roboto">Roboto</option>
          <option value="Inter">Inter</option>
          <option value="Poppins">Poppins</option>
          <option value="Montserrat">Montserrat</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>
    </div>
  );
}

import React from 'react';

export default function WhiteboardWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Whiteboard Configuration</h3>

      <div className="config-field">
        <label>Default Brush Color</label>
        <input
          type="color"
          value={config.brushColor || '#6366f1'}
          onChange={(e) => handleUpdate('brushColor', e.target.value)}
        />
      </div>

      <div className="config-field">
        <label>Default Brush Size (px)</label>
        <input
          type="number"
          className="input"
          value={config.brushSize || 4}
          onChange={(e) => handleUpdate('brushSize', Number(e.target.value))}
        />
      </div>

      <div className="config-field">
        <label>Canvas Background</label>
        <input
          type="color"
          value={config.backgroundColor || '#0f172a'}
          onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
        />
      </div>
    </div>
  );
}

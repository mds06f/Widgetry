import React from 'react';

export default function PollWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Poll Configuration</h3>

      <div className="config-field">
        <label>Poll Question Title</label>
        <input
          type="text"
          className="input"
          value={config.question || 'What is your favorite frontend framework?'}
          onChange={(e) => handleUpdate('question', e.target.value)}
        />
      </div>

      <div className="config-field">
        <label>Poll Options (comma separated)</label>
        <input
          type="text"
          className="input"
          value={config.optionsString || 'React, Vue, Svelte, Angular'}
          onChange={(e) => handleUpdate('optionsString', e.target.value)}
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

      <div className="config-field">
        <label>Background Style</label>
        <select
          value={config.backgroundStyle || 'gradient'}
          onChange={(e) => handleUpdate('backgroundStyle', e.target.value)}
        >
          <option value="solid">Solid Color</option>
          <option value="gradient">Gradient Preset</option>
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
          <label>Gradient Preset</label>
          <select
            value={config.gradientName || 'cosmic'}
            onChange={(e) => handleUpdate('gradientName', e.target.value)}
          >
            <option value="cosmic">Cosmic</option>
            <option value="royal">Royal</option>
            <option value="darkness">Darkness</option>
          </select>
        </div>
      )}
    </div>
  );
}

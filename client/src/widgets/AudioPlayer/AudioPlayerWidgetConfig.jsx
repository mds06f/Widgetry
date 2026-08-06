import React from 'react';

export default function AudioPlayerWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Audio Player Settings</h3>

      <div className="config-field">
        <label>Audio Source URL</label>
        <input
          type="text"
          value={config.audioUrl || ''}
          onChange={(e) => handleUpdate('audioUrl', e.target.value)}
          placeholder="e.g. https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        />
      </div>

      <div className="config-field">
        <label>Track Title</label>
        <input
          type="text"
          value={config.title !== undefined ? config.title : 'Sample Track'}
          onChange={(e) => handleUpdate('title', e.target.value)}
        />
      </div>

      <div className="config-field">
        <label>Artist Name</label>
        <input
          type="text"
          value={config.artist !== undefined ? config.artist : 'Royalty Free'}
          onChange={(e) => handleUpdate('artist', e.target.value)}
        />
      </div>

      <div className="config-field toggle-field">
        <label>Loop Playback</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.loop === true}
            onChange={(e) => handleUpdate('loop', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field toggle-field">
        <label>Autoplay</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.autoplay === true}
            onChange={(e) => handleUpdate('autoplay', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
}

import React from "react";
import { GRADIENTS } from "../index";

export default function SpotifyWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Spotify Configuration</h3>

      <div className="config-field">
        <label>Select Track Preset</label>
        <select
          value={config.trackPreset || "resonance"}
          onChange={(e) => handleUpdate("trackPreset", e.target.value)}
        >
          <option value="resonance">🌌 HOME - Resonance</option>
          <option value="midnight">🌆 M83 - Midnight City</option>
          <option value="getlucky">🕺 Daft Punk - Get Lucky</option>
          <option value="strobe">⚡ Deadmau5 - Strobe</option>
          <option value="custom">✏️ Custom Song details...</option>
        </select>
      </div>

      {config.trackPreset === "custom" && (
        <div
          style={{
            borderLeft: "2px solid var(--accent-primary)",
            paddingLeft: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginTop: "0.25rem",
            marginBottom: "0.5rem",
          }}
        >
          <div className="config-field">
            <label>Song Title</label>
            <input
              type="text"
              value={config.customTitle || ""}
              onChange={(e) => handleUpdate("customTitle", e.target.value)}
              placeholder="e.g. Blinding Lights"
            />
          </div>
          <div className="config-field">
            <label>Artist Name</label>
            <input
              type="text"
              value={config.customArtist || ""}
              onChange={(e) => handleUpdate("customArtist", e.target.value)}
              placeholder="e.g. The Weeknd"
            />
          </div>
          <div className="config-field">
            <label>Album Name</label>
            <input
              type="text"
              value={config.customAlbum || ""}
              onChange={(e) => handleUpdate("customAlbum", e.target.value)}
              placeholder="e.g. After Hours"
            />
          </div>
          <div className="config-field">
            <label>Cover Art URL</label>
            <input
              type="text"
              value={config.customCoverUrl || ""}
              onChange={(e) => handleUpdate("customCoverUrl", e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
          <div className="config-field">
            <label>Duration (in seconds)</label>
            <input
              type="number"
              value={config.customDuration || 180}
              onChange={(e) => handleUpdate("customDuration", e.target.value)}
              placeholder="180"
              min="10"
              max="3600"
            />
          </div>
        </div>
      )}

      <div className="config-field toggle-field">
        <label>Show Animated Equalizer</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showVisualizer !== false}
            onChange={(e) => handleUpdate("showVisualizer", e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field">
        <label>Background Style</label>
        <select
          value={config.backgroundStyle || "gradient"}
          onChange={(e) => handleUpdate("backgroundStyle", e.target.value)}
        >
          <option value="gradient">Gradient Presets</option>
          <option value="solid">Solid Background Color</option>
        </select>
      </div>

      {config.backgroundStyle === "solid" ? (
        <div className="config-row">
          <div className="config-field">
            <label>Background Color</label>
            <input
              type="color"
              value={config.backgroundColor || "#1b2542"}
              onChange={(e) => handleUpdate("backgroundColor", e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Text Color</label>
            <input
              type="color"
              value={config.textColor || "#ffffff"}
              onChange={(e) => handleUpdate("textColor", e.target.value)}
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
                className={`gradient-option ${config.gradientName === key ? "active" : ""}`}
                style={{ background: GRADIENTS[key] }}
                onClick={() => handleUpdate("gradientName", key)}
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
          value={config.backgroundImageUrl || ""}
          onChange={(e) => handleUpdate("backgroundImageUrl", e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
        />
      </div>

      <div className="config-field">
        <label>Card Corner Rounding</label>
        <select
          value={config.borderRadius || "12px"}
          onChange={(e) => handleUpdate("borderRadius", e.target.value)}
        >
          <option value="0px">Sharp Corners (0px)</option>
          <option value="6px">Subtle (6px)</option>
          <option value="12px">Rounded (12px)</option>
          <option value="24px">Extra Rounded (24px)</option>
        </select>
      </div>

      <div className="config-field toggle-field">
        <label>Show Playback Controls</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.showPlaybackControls !== false}
            onChange={(e) =>
              handleUpdate("showPlaybackControls", e.target.checked)
            }
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="config-field">
        <label>Custom CSS</label>
        <textarea
          value={config.customCSS || ""}
          onChange={(e) => handleUpdate("customCSS", e.target.value)}
          placeholder={`/* Scope styles to this spotify widget */\nimg {\n  border: 2px solid #1DB954 !important;\n}`}
          rows={6}
        />
        <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

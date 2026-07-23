import React from "react";
import { GRADIENTS } from "../index";

export default function TriviaWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Trivia & Jokes Settings</h3>

      <div className="config-field">
        <label>Category</label>
        <select
          value={config.category || "dad-jokes"}
          onChange={(e) => handleUpdate("category", e.target.value)}
        >
          <option value="dad-jokes">👨 Dad Jokes</option>
          <option value="programming">💻 Programming Jokes</option>
          <option value="general">🧠 General Trivia</option>
        </select>
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

      <div className="config-field">
        <label>Custom CSS</label>
        <textarea
          value={config.customCSS || ""}
          onChange={(e) => handleUpdate("customCSS", e.target.value)}
          placeholder={`/* Override any widget styles */\n.trivia-text {\n  font-size: 1.2rem;\n  font-style: italic;\n}`}
          rows={6}
        />
        <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

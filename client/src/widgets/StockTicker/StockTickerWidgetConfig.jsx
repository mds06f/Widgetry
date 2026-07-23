import React from "react";

export default function StockTickerWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Stock Ticker Configuration</h3>

      <div className="config-field">
        <label>Stock Symbol</label>
        <input
          type="text"
          className="input"
          value={config.symbol || "AAPL"}
          onChange={(e) => handleUpdate("symbol", e.target.value.toUpperCase())}
          placeholder="e.g. AAPL, GOOGL, TSLA"
        />
      </div>

      <div className="config-field">
        <label>Company Name</label>
        <input
          type="text"
          className="input"
          value={config.companyName || "Apple Inc."}
          onChange={(e) => handleUpdate("companyName", e.target.value)}
          placeholder="e.g. Apple Inc."
        />
      </div>

      <div className="config-field">
        <label>Initial Price ($)</label>
        <input
          type="number"
          step="0.01"
          className="input"
          value={config.basePrice || "185.50"}
          onChange={(e) => handleUpdate("basePrice", e.target.value)}
        />
      </div>

      <div className="config-field">
        <label>Change Percentage (%)</label>
        <input
          type="text"
          className="input"
          value={config.changePercent || "+2.45%"}
          onChange={(e) => handleUpdate("changePercent", e.target.value)}
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

      <div className="config-field">
        <label>Background Style</label>
        <select
          value={config.backgroundStyle || "gradient"}
          onChange={(e) => handleUpdate("backgroundStyle", e.target.value)}
        >
          <option value="solid">Solid Color</option>
          <option value="gradient">Gradient Preset</option>
        </select>
      </div>

      {config.backgroundStyle === "solid" ? (
        <div className="config-field">
          <label>Background Color</label>
          <input
            type="color"
            value={config.backgroundColor || "#1b2542"}
            onChange={(e) => handleUpdate("backgroundColor", e.target.value)}
          />
        </div>
      ) : (
        <div className="config-field">
          <label>Gradient Preset</label>
          <select
            value={config.gradientName || "darkness"}
            onChange={(e) => handleUpdate("gradientName", e.target.value)}
          >
            <option value="darkness">Darkness</option>
            <option value="obsidian">Obsidian</option>
            <option value="cosmic">Cosmic</option>
            <option value="emerald">Emerald</option>
          </select>
        </div>
      )}
    </div>
  );
}

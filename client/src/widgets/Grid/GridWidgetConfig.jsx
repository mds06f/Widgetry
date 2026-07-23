import React, { useState, useEffect } from "react";
import { GRADIENTS } from "../index";
import { Trash2, Plus } from "lucide-react";

export default function GridWidgetConfig({ config, onChange, token }) {
  const [availableWidgets, setAvailableWidgets] = useState([]);

  useEffect(() => {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    fetch("/api/widgets", { headers })
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        // Exclude grid widgets to prevent infinite recursion loop
        setAvailableWidgets(data.filter((w) => w.type !== "grid"));
      })
      .catch((err) => console.error("Error loading widgets for grid:", err));
  }, [token]);

  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const addItemSlot = () => {
    const items = config.items || [];
    handleUpdate("items", [
      ...items,
      { id: Date.now().toString(), widgetId: "" },
    ]);
  };

  const removeItemSlot = (id) => {
    const items = config.items || [];
    handleUpdate(
      "items",
      items.filter((item) => item.id !== id),
    );
  };

  const updateItemWidget = (id, widgetId) => {
    const items = config.items || [];
    handleUpdate(
      "items",
      items.map((item) => (item.id === id ? { ...item, widgetId } : item)),
    );
  };

  const gridItems = config.items || [];

  return (
    <div className="config-group">
      <h3>Grid Layout Settings</h3>

      <div className="config-field">
        <label>Grid Columns</label>
        <select
          value={config.columns || "2"}
          onChange={(e) => handleUpdate("columns", e.target.value)}
        >
          <option value="1">1 Column</option>
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </select>
      </div>

      <div className="config-field">
        <label>Grid Gap</label>
        <select
          value={config.gap || "16px"}
          onChange={(e) => handleUpdate("gap", e.target.value)}
        >
          <option value="8px">Small (8px)</option>
          <option value="16px">Medium (16px)</option>
          <option value="24px">Large (24px)</option>
        </select>
      </div>

      <div
        className="config-field"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <label style={{ margin: 0 }}>Widget Slots</label>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
            onClick={addItemSlot}
          >
            <Plus size={12} />
            <span>Add Slot</span>
          </button>
        </div>

        {gridItems.length === 0 ? (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              margin: "0.5rem 0 0",
            }}
          >
            No slots added. Add slots to embed widgets.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {gridItems.map((item, idx) => (
              <div
                key={item.id}
                style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}
              >
                <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                  #{idx + 1}
                </span>
                <select
                  value={item.widgetId}
                  onChange={(e) => updateItemWidget(item.id, e.target.value)}
                  style={{ flex: 1, padding: "0.35rem" }}
                >
                  <option value="">-- Select Widget --</option>
                  {availableWidgets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.type})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: "0.35rem" }}
                  onClick={() => removeItemSlot(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
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
          placeholder={`/* Style the grid layout */\n.grid-container {\n  border: 1px solid rgba(255,255,255,0.1);\n}`}
          rows={6}
        />
      </div>
    </div>
  );
}

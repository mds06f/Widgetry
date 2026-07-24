import React from 'react';

export default function CustomScriptWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Custom Script Configuration</h3>

      <div className="config-field">
        <label>HTML Markup</label>
        <textarea
          rows={4}
          value={
            config.htmlCode ||
            "<div class='custom-card'>Hello Custom Widget!</div>"
          }
          onChange={(e) => handleUpdate('htmlCode', e.target.value)}
          placeholder="<div>...</div>"
        />
      </div>

      <div className="config-field">
        <label>CSS Styling</label>
        <textarea
          rows={4}
          value={
            config.cssCode ||
            '.custom-card {\n  color: #6366f1;\n  font-weight: bold;\n}'
          }
          onChange={(e) => handleUpdate('cssCode', e.target.value)}
          placeholder=".custom-card { ... }"
        />
      </div>

      <div className="config-field">
        <label>JavaScript Logic</label>
        <textarea
          rows={4}
          value={config.jsCode || '// Custom JS logic'}
          onChange={(e) => handleUpdate('jsCode', e.target.value)}
          placeholder="console.log('Widget loaded');"
        />
      </div>
    </div>
  );
}

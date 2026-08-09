import React from 'react';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (GMT)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
];

export default function WorldClockWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="config-group">
      <h3>World Clock Settings</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Clock 1 */}
        <div style={{ border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
          <h4>Clock 1 (Primary)</h4>
          <div className="config-field">
            <label>Label</label>
            <input
              type="text"
              value={config.label1 !== undefined ? config.label1 : 'New York'}
              onChange={(e) => handleUpdate('label1', e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Timezone</label>
            <select
              value={config.tz1 || 'America/New_York'}
              onChange={(e) => handleUpdate('tz1', e.target.value)}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clock 2 */}
        <div style={{ border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
          <h4>Clock 2</h4>
          <div className="config-field">
            <label>Label</label>
            <input
              type="text"
              value={config.label2 !== undefined ? config.label2 : 'London'}
              onChange={(e) => handleUpdate('label2', e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Timezone</label>
            <select
              value={config.tz2 || 'Europe/London'}
              onChange={(e) => handleUpdate('tz2', e.target.value)}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clock 3 */}
        <div style={{ border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
          <h4>Clock 3</h4>
          <div className="config-field">
            <label>Label</label>
            <input
              type="text"
              value={config.label3 !== undefined ? config.label3 : 'Tokyo'}
              onChange={(e) => handleUpdate('label3', e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Timezone</label>
            <select
              value={config.tz3 || 'Asia/Tokyo'}
              onChange={(e) => handleUpdate('tz3', e.target.value)}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

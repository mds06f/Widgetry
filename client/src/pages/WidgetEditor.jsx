import React, { useState, useEffect, useRef } from 'react';
import { widgetRegistry } from '../widgets';
import * as LucideIcons from 'lucide-react';
import { io } from 'socket.io-client';

export default function WidgetEditor({
  navigate,
  initialId,
  initialType,
  isNew,
  token,
  user,
}) {
  const [widgetType, setWidgetType] = useState(initialType || 'clock');
  const [widgetName, setWidgetName] = useState('');
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [widgetId, setWidgetId] = useState(initialId || null);
  const [copied, setCopied] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const socketRef = useRef(null);

  const fetchAnalytics = async () => {
    if (!widgetId) return;
    setLoadingAnalytics(true);
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/widgets/${widgetId}/analytics`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateWebhookToken = () => {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  // Load existing widget data if editing
  useEffect(() => {
    if (!isNew && initialId) {
      fetchWidget(initialId);
    } else if (isNew && initialType) {
      const typeDetails = widgetRegistry[initialType];
      if (typeDetails) {
        setWidgetType(initialType);
        setWidgetName(`New ${typeDetails.name}`);
        setConfig({
          ...(typeDetails.defaultConfig || {}),
          webhookToken: generateWebhookToken(),
        });
      } else {
        // Fallback if invalid type
        navigate('/');
      }
    }
  }, [initialId, initialType, isNew, token]);

  // Handle Socket.io collaboration connection
  useEffect(() => {
    if (widgetId) {
      const socketUrl = window.location.origin.includes('5173')
        ? 'http://localhost:5001'
        : window.location.origin;

      const socket = io(socketUrl);
      socketRef.current = socket;

      socket.emit('join-widget', widgetId);

      socket.on('config-updated', ({ name, config }) => {
        if (name !== undefined) setWidgetName(name);
        if (config !== undefined) setConfig(config);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [widgetId]);

  const fetchWidget = async (id) => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/widgets/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWidgetId(data.id);
        setWidgetType(data.type);
        setWidgetName(data.name);

        let loadedConfig = data.config || {};
        if (!loadedConfig.webhookToken) {
          loadedConfig = {
            ...loadedConfig,
            webhookToken: generateWebhookToken(),
          };
        }
        setConfig(loadedConfig);
      } else {
        alert('Widget not found');
        navigate('/');
      }
    } catch (err) {
      console.error('Error fetching widget:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        type: widgetType,
        name: widgetName,
        config,
      };

      const url = isNew ? '/api/widgets' : `/api/widgets/${widgetId}`;
      const method = isNew ? 'POST' : 'PUT';

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        // If it was a new widget, transition to edit route with new ID
        if (isNew) {
          window.history.pushState({}, '', `/edit/${data.id}`);
          // Trigger popstate so App.jsx handles the route state change silently without refreshing
          window.dispatchEvent(new Event('navigate'));
        } else {
          alert('Widget saved successfully!');
        }
      } else {
        alert('Failed to save widget');
      }
    } catch (err) {
      console.error('Error saving widget:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
    if (socketRef.current && widgetId) {
      socketRef.current.emit('edit-config', { widgetId, config: newConfig });
    }
  };

  const handleNameChange = (newName) => {
    setWidgetName(newName);
    if (socketRef.current && widgetId) {
      socketRef.current.emit('edit-config', { widgetId, name: newName });
    }
  };

  const getEmbedCode = () => {
    if (isNew || !widgetId) {
      return '<!-- Save your widget first to generate your embed code! -->';
    }
    return `<iframe src="${window.location.origin}/widget/render/${widgetId}" width="100%" height="200" style="border:none;border-radius:12px;" scrolling="no"></iframe>`;
  };

  const handleCopyCode = () => {
    if (isNew || !widgetId) return;
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem',
          color: 'var(--text-secondary)',
        }}
      >
        <p>Loading widget editor...</p>
      </div>
    );
  }

  const typeDetails = widgetRegistry[widgetType];
  if (!typeDetails) {
    return (
      <div style={{ padding: '2rem' }}>Widget type details not found.</div>
    );
  }

  // Resolve config and render views
  const ConfigComponent = typeDetails.config;
  const ViewComponent = typeDetails.view;

  return (
    <div className="editor-layout" style={{ margin: '-2rem' }}>
      {/* Sidebar Controls */}
      <aside className="editor-sidebar">
        <div>
          <button
            className="btn btn-secondary"
            style={{
              marginBottom: '0.75rem',
              width: '100%',
              justifyContent: 'flex-start',
            }}
            onClick={() => navigate('/')}
          >
            <LucideIcons.ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          {!isNew && widgetId && (
            <button
              className="btn btn-secondary"
              style={{
                marginBottom: '1.5rem',
                width: '100%',
                justifyContent: 'flex-start',
                gap: '0.4rem',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                background: 'rgba(99, 102, 241, 0.05)',
              }}
              onClick={() => {
                setIsAnalyticsOpen(true);
                fetchAnalytics();
              }}
            >
              <LucideIcons.BarChart3 size={16} style={{ color: '#818cf8' }} />
              <span style={{ color: '#818cf8', fontWeight: '600' }}>
                View Analytics
              </span>
            </button>
          )}

          <div className="config-group">
            <h3>Basic Info</h3>
            <div className="config-field">
              <label>Widget Name</label>
              <input
                type="text"
                value={widgetName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Custom Widget"
              />
            </div>
            <div className="config-field">
              <label>Hover Tooltip Text</label>
              <input
                type="text"
                value={config.tooltipText || ''}
                onChange={(e) => handleConfigChange({ ...config, tooltipText: e.target.value })}
                placeholder="Tooltip text shown on hover"
              />
            </div>
          </div>

          <div className="config-group">
            <h3>Border & Frame</h3>
            <div className="config-row">
              <div className="config-field">
                <label>Border Style</label>
                <select
                  value={config.borderStyle || 'none'}
                  onChange={(e) => handleConfigChange({ ...config, borderStyle: e.target.value })}
                >
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
              <div className="config-field">
                <label>Border Width</label>
                <select
                  value={config.borderWidth || '0px'}
                  onChange={(e) => handleConfigChange({ ...config, borderWidth: e.target.value })}
                >
                  <option value="0px">None (0px)</option>
                  <option value="1px">Thin (1px)</option>
                  <option value="2px">Medium (2px)</option>
                  <option value="4px">Thick (4px)</option>
                  <option value="8px">Extra Thick (8px)</option>
                </select>
              </div>
            </div>
            {config.borderStyle && config.borderStyle !== 'none' && (
              <div className="config-field">
                <label>Border Color</label>
                <input
                  type="color"
                  value={config.borderColor || '#ffffff'}
                  onChange={(e) => handleConfigChange({ ...config, borderColor: e.target.value })}
                />
              </div>
            )}
            <div className="config-field">
              <label>Widget Opacity ({Math.round((config.opacity !== undefined ? config.opacity : 1) * 100)}%)</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.opacity !== undefined ? config.opacity : 1.0}
                onChange={(e) => handleConfigChange({ ...config, opacity: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>
            <div className="config-field toggle-field">
              <label>Enable Border Glow</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.glowEnable === true}
                  onChange={(e) => handleConfigChange({ ...config, glowEnable: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
            {config.glowEnable && (
              <div className="config-row">
                <div className="config-field">
                  <label>Glow Color</label>
                  <input
                    type="color"
                    value={config.glowColor || '#6366f1'}
                    onChange={(e) => handleConfigChange({ ...config, glowColor: e.target.value })}
                  />
                </div>
                <div className="config-field">
                  <label>Glow Blur ({config.glowBlur || '10px'})</label>
                  <select
                    value={config.glowBlur || '10px'}
                    onChange={(e) => handleConfigChange({ ...config, glowBlur: e.target.value })}
                  >
                    <option value="5px">Subtle (5px)</option>
                    <option value="10px">Medium (10px)</option>
                    <option value="20px">Strong (20px)</option>
                    <option value="30px">Intense (30px)</option>
                    <option value="40px">Extra Intense (40px)</option>
                  </select>
                </div>
              </div>
            )}
            <div className="config-field toggle-field">
              <label>Custom Scrollbar</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.customScrollbar === true}
                  onChange={(e) => handleConfigChange({ ...config, customScrollbar: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic widget config fields */}
        <ConfigComponent
          config={config}
          onChange={handleConfigChange}
          token={token}
        />

        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all configurations to defaults?')) {
                handleConfigChange(typeDetails.defaultConfig || {});
              }
            }}
            type="button"
          >
            Reset Defaults
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, justifyContent: 'center' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Widget'}
          </button>
        </div>
      </aside>

      {/* Main Preview canvas */}
      <main className="editor-main">
        <div className="preview-container">
          <div className="preview-title">Live Interactive Preview</div>
          <div className="preview-frame-wrapper">
            <div
              className={config.customScrollbar ? 'custom-scrollbar' : ''}
              style={{
                width: '100%',
                height: '200px',
                overflow: 'hidden',
                borderRadius: config.borderRadius || '12px',
                border: config.borderWidth && config.borderWidth !== '0px' && config.borderStyle && config.borderStyle !== 'none'
                  ? `${config.borderWidth} ${config.borderStyle} ${config.borderColor || 'transparent'}`
                  : 'none',
                opacity: config.opacity !== undefined ? config.opacity : 1.0,
                boxShadow: config.glowEnable
                  ? `0 0 ${config.glowBlur || '10px'} ${config.glowColor || '#6366f1'}`
                  : 'none',
              }}
              title={config.tooltipText || ''}
            >
              {/* Render the View component live with current config state */}
              <ViewComponent config={config} />
            </div>
          </div>

          {/* Embed Code Panel */}
          <div className="embed-box">
            <div className="embed-header">
              <h4>Get Embed Link</h4>
              {!isNew && widgetId && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <>
                        <LucideIcons.Check
                          size={14}
                          style={{ color: 'var(--success)' }}
                        />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <LucideIcons.Copy size={14} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                    onClick={() => {
                      window.open(`/api/widgets/${widgetId}/export`, '_blank');
                    }}
                    title="Export stand-alone HTML package"
                  >
                    <LucideIcons.Download size={14} />
                    <span>Export ZIP</span>
                  </button>
                </div>
              )}
            </div>
            <pre className="embed-code">
              <code>{getEmbedCode()}</code>
            </pre>
            {isNew && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                * Save this widget to generate a deployable embed code.
              </p>
            )}
          </div>

          {/* Webhooks Integration Panel */}
          <div className="embed-box" style={{ marginTop: '1.5rem' }}>
            <div className="embed-header">
              <h4>Webhook Integration</h4>
              {!isNew && widgetId && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    const url = `${window.location.origin}/api/widgets/${widgetId}/webhook?token=${config.webhookToken}`;
                    navigator.clipboard.writeText(url);
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 2000);
                  }}
                >
                  <LucideIcons.Copy size={14} />
                  <span>Copy URL</span>
                </button>
              )}
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                margin: '0.5rem 0',
              }}
            >
              Update this widget's configuration in real-time by sending a POST
              request.
            </p>
            {!isNew && widgetId ? (
              <>
                <pre
                  className="embed-code"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                >
                  <code>{`${window.location.origin}/api/widgets/${widgetId}/webhook?token=${config.webhookToken}`}</code>
                </pre>
                <h5
                  style={{
                    margin: '0.75rem 0 0.25rem 0',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                  }}
                >
                  Sample payload (curl)
                </h5>
                <pre
                  className="embed-code"
                  style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}
                >
                  <code>{`curl -X POST "${window.location.origin}/api/widgets/${widgetId}/webhook?token=${config.webhookToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"textColor": "#ff007f"}'`}</code>
                </pre>
              </>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                * Save this widget to generate a secure webhook integration URL.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Analytics Modal overlay */}
      {isAnalyticsOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAnalyticsOpen(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '500px',
              background: 'rgba(30, 41, 59, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <div
              className="modal-header"
              style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <LucideIcons.BarChart3 size={24} style={{ color: '#6366f1' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  Widget Analytics
                </h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setIsAnalyticsOpen(false)}
                style={{ color: 'var(--text-muted)' }}
              >
                <LucideIcons.X size={20} />
              </button>
            </div>

            {loadingAnalytics ? (
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  padding: '2rem 0',
                }}
              >
                Loading analytics data...
              </p>
            ) : !analyticsData || analyticsData.totalViews === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem 0',
                  color: 'var(--text-secondary)',
                }}
              >
                <p style={{ fontSize: '2.5rem', margin: 0 }}>📊</p>
                <h3
                  style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '1.1rem' }}
                >
                  No data collected yet
                </h3>
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    maxWidth: '320px',
                    margin: '0 auto',
                  }}
                >
                  Embed your widget on websites. Once people view your widget,
                  referrers and views will show up here!
                </p>
              </div>
            ) : (
              <div>
                {/* Stats summary */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '1rem',
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Total Views
                    </div>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: '#fff',
                        marginTop: '0.25rem',
                      }}
                    >
                      {analyticsData.totalViews}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '1rem',
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Referrers
                    </div>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: '#fff',
                        marginTop: '0.25rem',
                      }}
                    >
                      {analyticsData.referrers.length}
                    </div>
                  </div>
                </div>

                {/* Referrers breakdown */}
                <h4
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Top Referrer Domains
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem',
                  }}
                >
                  {analyticsData.referrers.map((ref) => {
                    const pct = Math.round(
                      (ref.count / analyticsData.totalViews) * 100,
                    );
                    return (
                      <div
                        key={ref.domain}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifycontent: 'space-between',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span
                            style={{
                              color: '#fff',
                              fontWeight: '500',
                              wordBreak: 'break-all',
                            }}
                          >
                            {ref.domain}
                          </span>
                          <span
                            style={{
                              color: 'var(--text-secondary)',
                              marginLeft: 'auto',
                            }}
                          >
                            {ref.count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: '#6366f1',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {copied && (
        <div
          className="toast-animation"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(16, 185, 129, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          <LucideIcons.CheckCircle2 size={16} />
          <span>Embed code copied to clipboard!</span>
        </div>
      )}

      {copiedWebhook && (
        <div
          className="toast-animation"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(16, 185, 129, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          <LucideIcons.CheckCircle2 size={16} />
          <span>Webhook URL copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}

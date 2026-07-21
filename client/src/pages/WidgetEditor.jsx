import React, { useState, useEffect, useRef } from 'react';
import { widgetRegistry } from '../widgets';
import * as LucideIcons from 'lucide-react';
import { io } from 'socket.io-client';

export default function WidgetEditor({ navigate, initialId, initialType, isNew, token, user }) {
  const [widgetType, setWidgetType] = useState(initialType || 'clock');
  const [widgetName, setWidgetName] = useState('');
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [widgetId, setWidgetId] = useState(initialId || null);
  const [copied, setCopied] = useState(false);
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
      const res = await fetch(`/api/widgets/${widgetId}/analytics`, { headers });
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
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
          webhookToken: generateWebhookToken()
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
          loadedConfig = { ...loadedConfig, webhookToken: generateWebhookToken() };
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
        config
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
        body: JSON.stringify(payload)
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
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <p>Loading widget editor...</p>
      </div>
    );
  }

  const typeDetails = widgetRegistry[widgetType];
  if (!typeDetails) {
    return <div style={{ padding: '2rem' }}>Widget type details not found.</div>;
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
            style={{ marginBottom: '0.75rem', width: '100%', justifyContent: 'flex-start' }}
            onClick={() => navigate('/')}
          >
            <LucideIcons.ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          {!isNew && widgetId && (
            <button 
              className="btn btn-secondary" 
              style={{ marginBottom: '1.5rem', width: '100%', justifyContent: 'flex-start', gap: '0.4rem', border: '1px solid rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.05)' }}
              onClick={() => {
                setIsAnalyticsOpen(true);
                fetchAnalytics();
              }}
            >
              <LucideIcons.BarChart3 size={16} style={{ color: '#818cf8' }} />
              <span style={{ color: '#818cf8', fontWeight: '600' }}>View Analytics</span>
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
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
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
              style={{ 
                width: '100%', 
                height: '200px', 
                overflow: 'hidden', 
                borderRadius: config.borderRadius || '12px',
                border: config.borderWidth ? `${config.borderWidth} solid ${config.borderColor}` : 'none'
              }}
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
                        <LucideIcons.Check size={14} style={{ color: 'var(--success)' }} />
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
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
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
                    alert('Webhook URL copied!');
                  }}
                >
                  <LucideIcons.Copy size={14} />
                  <span>Copy URL</span>
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
              Update this widget's configuration in real-time by sending a POST request.
            </p>
            {!isNew && widgetId ? (
              <>
                <pre className="embed-code" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  <code>{`${window.location.origin}/api/widgets/${widgetId}/webhook?token=${config.webhookToken}`}</code>
                </pre>
                <h5 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 'bold' }}>Sample payload (curl)</h5>
                <pre className="embed-code" style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
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
        <div className="modal-overlay" onClick={() => setIsAnalyticsOpen(false)}>
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
              padding: '2rem'
            }}
          >
            <div className="modal-header" style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LucideIcons.BarChart3 size={24} style={{ color: '#6366f1' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Widget Analytics</h2>
              </div>
              <button className="modal-close" onClick={() => setIsAnalyticsOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <LucideIcons.X size={20} />
              </button>
            </div>

            {loadingAnalytics ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                Loading analytics data...
              </p>
            ) : !analyticsData || analyticsData.totalViews === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '2.5rem', margin: 0 }}>📊</p>
                <h3 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '1.1rem' }}>No data collected yet</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
                  Embed your widget on websites. Once people view your widget, referrers and views will show up here!
                </p>
              </div>
            ) : (
              <div>
                {/* Stats summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Views</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginTop: '0.25rem' }}>{analyticsData.totalViews}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referrers</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginTop: '0.25rem' }}>{analyticsData.referrers.length}</div>
                  </div>
                </div>

                {/* Referrers breakdown */}
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Top Referrer Domains</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {analyticsData.referrers.map((ref) => {
                    const pct = Math.round((ref.count / analyticsData.totalViews) * 100);
                    return (
                      <div key={ref.domain} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: '#fff', fontWeight: '500', wordBreak: 'break-all' }}>{ref.domain}</span>
                          <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>{ref.count} ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#6366f1', borderRadius: '3px' }} />
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
    </div>
  );
}

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

  const socketRef = useRef(null);

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
            style={{ marginBottom: '1.5rem', width: '100%', justifyContent: 'flex-start' }}
            onClick={() => navigate('/')}
          >
            <LucideIcons.ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

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
    </div>
  );
}

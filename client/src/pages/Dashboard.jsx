import React, { useState, useEffect } from 'react';
import { widgetRegistry } from '../widgets';
import * as LucideIcons from 'lucide-react';

export default function Dashboard({ navigate }) {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch widgets on load
  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      const res = await fetch('/api/widgets');
      if (res.ok) {
        const data = await res.json();
        setWidgets(data);
      }
    } catch (err) {
      console.error('Error fetching widgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    if (!confirm('Are you sure you want to delete this widget?')) return;

    try {
      const res = await fetch(`/api/widgets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWidgets(widgets.filter(w => w.id !== id));
      }
    } catch (err) {
      console.error('Error deleting widget:', err);
    }
  };

  const copyEmbedCode = (id, e) => {
    e.stopPropagation();
    const embedCode = `<iframe src="${window.location.origin}/widget/render/${id}" width="100%" height="200" style="border:none;border-radius:12px;" scrolling="no"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render Lucide icons dynamically
  const renderIcon = (iconName, size = 24) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.Layers;
    return <IconComponent size={size} />;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>My Widgets</h1>
          <p>Create, customize, and embed lightweight widgets anywhere.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <LucideIcons.Plus size={18} />
          <span>New Widget</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <p>Loading your dashboard...</p>
        </div>
      ) : widgets.length === 0 ? (
        // Empty State
        <div className="card" style={{ 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          borderStyle: 'dashed'
        }}>
          <div className="card-icon-wrapper" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <LucideIcons.Layers size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No widgets created yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
            Get started by building your first widget! Customize it with colors, data sources, and styles.
          </p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <LucideIcons.Plus size={18} />
            <span>Create First Widget</span>
          </button>
        </div>
      ) : (
        // Widgets Grid
        <div className="grid">
          {widgets.map((widget) => {
            const registryItem = widgetRegistry[widget.type] || {
              name: 'Unknown Widget',
              icon: 'HelpCircle',
              description: ''
            };
            
            return (
              <div 
                key={widget.id} 
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/edit/${widget.id}`)}
              >
                <div>
                  <div className="card-header">
                    <div className="card-icon-wrapper">
                      {renderIcon(registryItem.icon)}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem' }}
                        onClick={(e) => copyEmbedCode(widget.id, e)}
                        title="Copy Embed Code"
                      >
                        {copiedId === widget.id ? (
                          <LucideIcons.Check size={16} style={{ color: 'var(--success)' }} />
                        ) : (
                          <LucideIcons.Code size={16} />
                        )}
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem' }}
                        onClick={(e) => handleDelete(widget.id, e)}
                        title="Delete Widget"
                      >
                        <LucideIcons.Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Widget Thumbnail Preview */}
                  <div style={{
                    width: '100%',
                    height: '120px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    position: 'relative'
                  }}>
                    <iframe 
                      src={`/widget/render/${widget.id}`} 
                      title={widget.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        pointerEvents: 'none'
                      }}
                      scrolling="no"
                    />
                  </div>

                  <div>
                    <h3 className="card-title">{widget.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Type: {registryItem.name}
                    </p>
                    <p className="card-desc">
                      {registryItem.description}
                    </p>
                  </div>
                </div>

                <div className="card-actions" style={{ width: '100%' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/widget/render/${widget.id}`, '_blank');
                    }}
                  >
                    <LucideIcons.ExternalLink size={14} />
                    <span>Live Preview</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Select Widget Type Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Widget Type</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <LucideIcons.X size={20} />
              </button>
            </div>
            <div className="widget-selector-grid">
              {Object.keys(widgetRegistry).map((type) => {
                const item = widgetRegistry[type];
                return (
                  <div 
                    key={type} 
                    className="selector-option"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate(`/create/${type}`);
                    }}
                  >
                    <div className="card-icon-wrapper" style={{ color: 'var(--accent-primary)' }}>
                      {renderIcon(item.icon, 24)}
                    </div>
                    <div className="selector-info">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

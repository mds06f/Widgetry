import React, { useState, useEffect } from 'react';
import { widgetRegistry } from '../widgets';
import * as LucideIcons from 'lucide-react';

export default function Dashboard({ navigate, token, user }) {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);

  const filteredWidgets = widgets.filter((w) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = w.name ? w.name.toLowerCase().includes(query) : false;
    const typeMatch = w.type ? w.type.toLowerCase().includes(query) : false;
    return nameMatch || typeMatch;
  });

  const handleDragStart = (id) => {
    setDraggedWidgetId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId) => {
    if (!draggedWidgetId || draggedWidgetId === targetId) return;
    const dragIdx = widgets.findIndex((w) => w.id === draggedWidgetId);
    const targetIdx = widgets.findIndex((w) => w.id === targetId);
    if (dragIdx === -1 || targetIdx === -1) return;

    const reordered = [...widgets];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setWidgets(reordered);
    setDraggedWidgetId(null);

    try {
      const orderedIds = reordered.map((w) => w.id);
      await fetch('/api/widgets/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error('Error saving widget order:', err);
    }
  };

  // Fetch widgets on load and when token changes
  useEffect(() => {
    fetchWidgets();
  }, [token]);

  const fetchWidgets = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/widgets', { headers });
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
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/widgets/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setWidgets(widgets.filter((w) => w.id !== id));
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

  const exportBackup = () => {
    const jsonStr = JSON.stringify(widgets, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `widgetry-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const importedWidgets = JSON.parse(text);
      if (Array.isArray(importedWidgets)) {
        for (const item of importedWidgets) {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          await fetch('/api/widgets', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              type: item.type,
              name: item.name,
              config: item.config,
            }),
          });
        }
        fetchWidgets();
        alert('Widget configurations successfully restored!');
      }
    } catch (err) {
      alert('Invalid backup JSON file.');
    }
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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={exportBackup}
            title="Export Configuration Backup JSON"
          >
            <LucideIcons.Download size={16} />
            <span>Export Backup</span>
          </button>

          <label
            className="btn btn-secondary"
            style={{ cursor: 'pointer', margin: 0 }}
            title="Import Configuration Backup JSON"
          >
            <LucideIcons.Upload size={16} />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              style={{ display: 'none' }}
            />
          </label>

          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <LucideIcons.Plus size={18} />
            <span>New Widget</span>
          </button>
        </div>
      </div>

      {widgets.length > 0 && (
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <LucideIcons.Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
            }}
          />
          <input
            type="text"
            className="input"
            placeholder="Search widgets by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '42px', width: '100%' }}
          />
        </div>
      )}

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: 'var(--text-secondary)',
          }}
        >
          <p>Loading your dashboard...</p>
        </div>
      ) : widgets.length === 0 ? (
        // Empty State
        <div
          className="card"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
            borderStyle: 'dashed',
          }}
        >
          <div
            className="card-icon-wrapper"
            style={{ marginBottom: '1.5rem', padding: '1.25rem' }}
          >
            <LucideIcons.Layers size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            No widgets created yet
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              maxWidth: '400px',
              marginBottom: '2rem',
            }}
          >
            Get started by building your first widget! Customize it with colors,
            data sources, and styles.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <LucideIcons.Plus size={18} />
            <span>Create First Widget</span>
          </button>
        </div>
      ) : filteredWidgets.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)',
          }}
        >
          <p>No widgets found matching "{searchQuery}"</p>
        </div>
      ) : (
        // Widgets Grid
        <div className="grid">
          {filteredWidgets.map((widget) => {
            const registryItem = widgetRegistry[widget.type] || {
              name: 'Unknown Widget',
              icon: 'HelpCircle',
              description: '',
            };

            return (
              <div
                key={widget.id}
                className="card"
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(widget.id)}
                style={{ cursor: 'grab' }}
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
                          <LucideIcons.Check
                            size={16}
                            style={{ color: 'var(--success)' }}
                          />
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
                  <div
                    style={{
                      width: '100%',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-main)',
                      position: 'relative',
                    }}
                  >
                    <iframe
                      src={`/widget/render/${widget.id}`}
                      title={widget.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        pointerEvents: 'none',
                      }}
                      scrolling="no"
                    />
                  </div>

                  <div>
                    <h3 className="card-title">{widget.name}</h3>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.8rem',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Type: {registryItem.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <LucideIcons.Eye size={12} />
                        <span>{widget.views || 0} views</span>
                      </span>
                    </div>
                    <p className="card-desc">{registryItem.description}</p>
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
              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
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
                    <div
                      className="card-icon-wrapper"
                      style={{ color: 'var(--accent-primary)' }}
                    >
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

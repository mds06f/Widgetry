import React, { useState, useEffect } from 'react';
import { widgetRegistry } from '../widgets';

export default function WidgetRender({ id }) {
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchWidget(id);
      // Track impression hit
      fetch(`/api/widgets/${id}/track`, { method: 'POST' }).catch(() => {});
    }
  }, [id]);

  const fetchWidget = async (widgetId) => {
    try {
      const res = await fetch(`/api/widgets/${widgetId}`);
      if (res.ok) {
        const data = await res.json();
        setWidget(data);
      } else {
        setError('Widget not found');
      }
    } catch (err) {
      console.error('Error rendering widget:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          color: '#94a3b8',
          fontSize: '0.85rem',
          fontFamily: 'sans-serif',
          padding: '10px',
        }}
      >
        Loading widget...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: '#ef4444',
          fontSize: '0.85rem',
          fontFamily: 'sans-serif',
          padding: '10px',
          fontWeight: 'bold',
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  const typeDetails = widgetRegistry[widget.type];
  if (!typeDetails) {
    return (
      <div
        style={{
          color: '#ef4444',
          fontSize: '0.85rem',
          fontFamily: 'sans-serif',
          padding: '10px',
        }}
      >
        Unsupported widget type
      </div>
    );
  }

  const ViewComponent = typeDetails.view;

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        boxSizing: 'border-box',
        overflow: 'hidden',
        borderRadius: widget.config.borderRadius || '12px',
        border: widget.config.borderWidth && widget.config.borderWidth !== '0px' && widget.config.borderStyle && widget.config.borderStyle !== 'none'
          ? `${widget.config.borderWidth} ${widget.config.borderStyle} ${widget.config.borderColor || 'transparent'}`
          : 'none',
      }}
    >
      <ViewComponent config={widget.config} />
    </div>
  );
}

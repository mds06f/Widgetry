import React, { useState, useEffect, useCallback } from 'react';
import { GRADIENTS } from '../index';

// Derive a unique storage key from the iframe URL (widget ID in pathname)
// Falls back to a generic key when rendering inside the editor preview
function getStorageKey() {
  const match = window.location.pathname.match(/\/widget\/render\/([^/]+)/);
  return match ? `widgetry_todo_${match[1]}` : 'widgetry_todo_preview';
}

function loadItems(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage unavailable — silently degrade
  }
}

export default function TodoWidgetView({ config }) {
  const storageKey = getStorageKey();

  const {
    title = 'My To-Do List',
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'darkness',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  const [items, setItems] = useState(() => loadItems(storageKey));
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Persist whenever items change
  useEffect(() => {
    saveItems(storageKey, items);
  }, [items, storageKey]);

  const triggerTodoWebhook = useCallback(async (event, taskData) => {
    const match = window.location.pathname.match(/\/widget\/render\/([^/]+)/);
    if (!match) return;
    const widgetId = match[1];

    try {
      await fetch(`/api/widgets/${widgetId}/trigger-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: event,
          data: {
            task: taskData,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (e) {
      console.error('Failed to trigger todo webhook:', e);
    }
  }, []);

  const addItem = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const newItem = { id: Date.now(), text, done: false };
    setItems((prev) => [...prev, newItem]);
    setDraft('');
    triggerTodoWebhook('todo_add', newItem);
  }, [draft, triggerTodoWebhook]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addItem();
  };

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, done: !item.done };
          triggerTodoWebhook('todo_toggle', updated);
          return updated;
        }
        return item;
      })
    );
  };

  const deleteItem = (id) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        triggerTodoWebhook('todo_delete', target);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearCompleted = () => {
    setItems((prev) => {
      const completed = prev.filter((item) => item.done);
      completed.forEach((item) => {
        triggerTodoWebhook('todo_delete', item);
      });
      return prev.filter((item) => !item.done);
    });
  };

  const completedCount = items.filter((i) => i.done).length;

  const visibleItems = items.filter((item) => {
    if (filter === 'active') return !item.done;
    if (filter === 'completed') return item.done;
    return true;
  });

  // Build background style
  const containerStyle = {
    color: textColor,
    fontFamily: 'Outfit, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: borderRadius,
    overflow: 'hidden',
  };

  if (backgroundStyle === 'gradient') {
    containerStyle.background = GRADIENTS[gradientName] || GRADIENTS.darkness;
  } else {
    containerStyle.backgroundColor = backgroundColor;
  }

  if (backgroundImageUrl) {
    containerStyle.backgroundImage = `url(${backgroundImageUrl})`;
    containerStyle.backgroundSize = 'cover';
    containerStyle.backgroundPosition = 'center';
    containerStyle.backgroundRepeat = 'no-repeat';
  }

  const accentColor = 'rgba(99, 102, 241, 0.9)';
  const surfaceColor = 'rgba(0, 0, 0, 0.2)';
  const borderColor = 'rgba(255, 255, 255, 0.12)';
  const mutedColor = `${textColor}99`;

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={containerStyle}>
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.1rem 0.6rem',
            borderBottom: `1px solid ${borderColor}`,
            background: 'rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              letterSpacing: '0.02em',
              marginBottom: '0.6rem',
            }}
          >
            {title}
          </div>

          {/* Add input row */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a task…"
              style={{
                flex: 1,
                background: surfaceColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                color: textColor,
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.82rem',
                padding: '0.4rem 0.6rem',
                outline: 'none',
              }}
            />
            <button
              onClick={addItem}
              title="Add task"
              style={{
                background: accentColor,
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1.1rem',
                padding: '0.2rem 0.7rem',
                lineHeight: 1,
                transition: 'opacity 0.15s ease',
              }}
            >
              +
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: textColor,
                  opacity: filter === f ? 1 : 0.6,
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  padding: '0.15rem 0.4rem',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Items list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem 0.6rem',
          }}
        >
          {visibleItems.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.45,
                fontSize: '0.8rem',
                gap: '0.35rem',
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>✅</span>
              <span>No tasks found!</span>
            </div>
          ) : (
            visibleItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: '6px',
                  marginBottom: '0.25rem',
                  background: item.done ? 'rgba(0,0,0,0.08)' : surfaceColor,
                  border: `1px solid ${item.done ? 'transparent' : borderColor}`,
                  transition: 'background 0.2s',
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleItem(item.id)}
                  title={item.done ? 'Mark incomplete' : 'Mark complete'}
                  style={{
                    flexShrink: 0,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${item.done ? accentColor : borderColor}`,
                    background: item.done ? accentColor : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '10px',
                    transition: 'all 0.2s ease',
                    padding: 0,
                  }}
                >
                  {item.done ? '✓' : ''}
                </button>

                {/* Text */}
                <span
                  style={{
                    flex: 1,
                    fontSize: '0.82rem',
                    lineHeight: '1.35',
                    textDecoration: item.done ? 'line-through' : 'none',
                    opacity: item.done ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.text}
                </span>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(item.id)}
                  title="Delete task"
                  style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    color: mutedColor,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: '0 0.1rem',
                    opacity: 0.6,
                    lineHeight: 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — shown when there are any items */}
        {items.length > 0 && (
          <div
            style={{
              padding: '0.5rem 1rem',
              borderTop: `1px solid ${borderColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>
              {items.filter(i => !i.done).length} active left
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '5px',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.15s',
                  }}
                  title="Remove completed items"
                >
                  Clear Done
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('Clear all tasks from this list?')) {
                    setItems([]);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '5px',
                  color: textColor,
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.15s',
                }}
                title="Wipe entire task list"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

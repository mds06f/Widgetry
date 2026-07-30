// Reactive Cross-Widget PostMessage Event Bus Protocol

const listeners = new Map();

if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    const { eventType, payload, sourceWidgetId } = event.data || {};
    if (!eventType) return;

    const callbacks = listeners.get(eventType) || [];
    callbacks.forEach((cb) => cb(payload, sourceWidgetId));
  });
}

export function publishWidgetEvent(eventType, payload = {}, sourceWidgetId = null) {
  if (typeof window === 'undefined') return;
  
  const message = {
    eventType,
    payload,
    sourceWidgetId,
    timestamp: Date.now(),
  };

  // Broadcast to parent dashboard and sibling widget iframes
  window.parent.postMessage(message, '*');
}

export function subscribeWidgetEvent(eventType, callback) {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, []);
  }
  listeners.get(eventType).push(callback);

  // Return unsubscribe cleanup function
  return () => {
    const current = listeners.get(eventType) || [];
    listeners.set(
      eventType,
      current.filter((cb) => cb !== callback)
    );
  };
}

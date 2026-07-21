import React from 'react';
import { GRADIENTS } from '../index';

export default function GridWidgetView({ config }) {
  const {
    columns = '2',
    gap = '16px',
    items = [],
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'darkness',
    borderRadius = '12px',
    customCSS = ''
  } = config;

  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  const containerStyle = {
    color: textColor,
    fontFamily: 'Outfit, sans-serif',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    padding: gap,
    borderRadius: borderRadius,
    overflowY: 'auto',
  };

  if (backgroundStyle === 'gradient') {
    containerStyle.background = GRADIENTS[gradientName] || GRADIENTS.darkness;
  } else {
    containerStyle.backgroundColor = backgroundColor;
  }

  const validItems = items.filter(item => item.widgetId);

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={containerStyle} className="grid-widget-container">
        {validItems.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6,
            fontSize: '0.85rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            Configure sub-widgets in layout settings
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap,
            width: '100%'
          }}>
            {validItems.map((item) => (
              <div 
                key={item.id} 
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  background: 'rgba(0,0,0,0.1)'
                }}
              >
                <iframe
                  src={`/widget/render/${item.widgetId}`}
                  title={`Sub-widget-${item.widgetId}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    pointerEvents: 'auto'
                  }}
                  scrolling="no"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

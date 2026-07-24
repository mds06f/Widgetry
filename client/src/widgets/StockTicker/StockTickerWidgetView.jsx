import React from 'react';
import { GRADIENTS } from '../index';

export default function StockTickerWidgetView({ config = {} }) {
  const {
    symbol = 'AAPL',
    companyName = 'Apple Inc.',
    basePrice = '185.50',
    changePercent = '+2.45%',
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'darkness',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const safeCSS = customCSS ? customCSS.replace(/<\/style>/gi, '') : '';
  const isPositive = !changePercent.startsWith('-');

  const background =
    backgroundStyle === 'gradient'
      ? GRADIENTS[gradientName] || GRADIENTS.darkness
      : backgroundColor;

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div
        style={{
          width: '100%',
          height: '100vh',
          background,
          borderRadius,
          color: textColor,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {symbol}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.7 }}>
              {companyName}
            </p>
          </div>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: isPositive
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              color: isPositive ? '#10b981' : '#ef4444',
            }}
          >
            {changePercent}
          </span>
        </div>

        <div style={{ margin: '16px 0' }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold' }}>
            ${basePrice}
          </span>
        </div>

        {/* Mini Sparkline Chart SVG */}
        <div style={{ width: '100%', height: '40px' }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="0,30 30,22 60,25 90,12 120,18 150,8 180,14 200,4"
            />
          </svg>
        </div>
      </div>
    </>
  );
}

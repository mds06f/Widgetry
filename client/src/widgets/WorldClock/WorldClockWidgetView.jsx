import React, { useState, useEffect } from 'react';
import { GRADIENTS } from '../index';

export default function WorldClockWidgetView({ config }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    label1 = 'New York',
    tz1 = 'America/New_York',
    label2 = 'London',
    tz2 = 'Europe/London',
    label3 = 'Tokyo',
    tz3 = 'Asia/Tokyo',
    textColor = '#ffffff',
    backgroundColor = '#131a30',
    backgroundStyle = 'gradient',
    gradientName = 'sunset',
    backgroundImageUrl = '',
    borderRadius = '12px',
    enableSlideshow = false,
    customCSS = ''
  } = config;

  const [activeClockIdx, setActiveClockIdx] = useState(0);

  useEffect(() => {
    if (!enableSlideshow) return;
    const interval = setInterval(() => {
      setActiveClockIdx((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [enableSlideshow]);

  const formatTime = (timezone) => {
    try {
      return time.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return 'Invalid TZ';
    }
  };

  const formatDate = (timezone) => {
    try {
      return time.toLocaleDateString('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    } catch (e) {
      return '';
    }
  };

  const containerStyle = {
    color: textColor,
    fontFamily: 'Outfit, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.25rem',
    width: '100%',
    height: '100vh',
    boxSizing: 'border-box',
    borderRadius: borderRadius,
  };

  if (backgroundStyle === 'gradient') {
    containerStyle.background = GRADIENTS[gradientName] || GRADIENTS.sunset;
  } else {
    containerStyle.backgroundColor = backgroundColor;
  }

  if (backgroundImageUrl) {
    containerStyle.backgroundImage = `url(${backgroundImageUrl})`;
    containerStyle.backgroundSize = 'cover';
    containerStyle.backgroundPosition = 'center';
    containerStyle.backgroundRepeat = 'no-repeat';
  }

  const safeCSS = customCSS ? customCSS.replace(/<\/style>/gi, '') : '';

  const clocks = [
    { label: label1, tz: tz1 },
    { label: label2, tz: tz2 },
    { label: label3, tz: tz3 }
  ];

  return (
    <>
      {safeCSS && <style>{safeCSS}</style>}
      <div style={containerStyle}>
        <div style={{
          width: '100%',
          overflow: 'hidden',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            width: '100%',
            gap: enableSlideshow ? '0' : '1rem',
            transform: enableSlideshow ? `translateX(-${activeClockIdx * 100}%)` : 'none',
            transition: enableSlideshow ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            flexWrap: 'nowrap'
          }}>
            {clocks.map((clock, index) => (
              <div
                key={index}
                style={{
                  flex: enableSlideshow ? '0 0 100%' : 1,
                  background: 'rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  boxSizing: 'border-box',
                }}
            >
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                opacity: 0.75,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.2rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {clock.label}
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                letterSpacing: '0.02em',
                marginBottom: '0.1rem'
              }}>
                {formatTime(clock.tz)}
              </div>
              <div style={{
                fontSize: '0.65rem',
                opacity: 0.6
              }}>
                {formatDate(clock.tz)}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}

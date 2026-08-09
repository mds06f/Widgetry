import React, { useState, useEffect, useRef } from 'react';
import { GRADIENTS } from '../index';

export default function CountdownWidgetView({ config }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const redirectedRef = useRef(false);

  const {
    targetDate = '',
    label = 'Countdown',
    completionMessage = "🎉 Time's Up!",
    actionUrl = '',
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'cosmic',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  useEffect(() => {
    redirectedRef.current = false;
  }, [targetDate]);

  useEffect(() => {
    function calculate() {
      if (!targetDate) {
        setTimeLeft(null);
        return;
      }
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ expired: true });
        if (actionUrl && !redirectedRef.current) {
          redirectedRef.current = true;
          try {
            window.open(actionUrl, '_blank');
          } catch (e) {
            console.warn('Pop-up blocked:', e);
          }
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate, actionUrl]);

  // Build background style
  const containerStyle = {
    color: textColor,
    fontFamily: 'Outfit, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    padding: '1.5rem',
    borderRadius: borderRadius,
    textAlign: 'center',
    userSelect: 'none',
  };

  if (backgroundStyle === 'gradient') {
    containerStyle.background = GRADIENTS[gradientName] || GRADIENTS.cosmic;
  } else {
    containerStyle.backgroundColor = backgroundColor;
  }

  if (backgroundImageUrl) {
    containerStyle.backgroundImage = `url(${backgroundImageUrl})`;
    containerStyle.backgroundSize = 'cover';
    containerStyle.backgroundPosition = 'center';
    containerStyle.backgroundRepeat = 'no-repeat';
  }

  const unitStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
  };

  const numberStyle = {
    fontSize: '2.8rem',
    fontWeight: '800',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  };

  const unitLabelStyle = {
    fontSize: '0.65rem',
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '0.3rem',
  };

  const separatorStyle = {
    fontSize: '2.2rem',
    fontWeight: '800',
    opacity: 0.5,
    alignSelf: 'flex-start',
    marginTop: '0.1rem',
    padding: '0 0.1rem',
  };

  // Determine which units to display
  const units = [];
  if (showDays) units.push({ key: 'days', value: timeLeft?.days });
  if (showHours) units.push({ key: 'hours', value: timeLeft?.hours });
  if (showMinutes) units.push({ key: 'minutes', value: timeLeft?.minutes });
  if (showSeconds) units.push({ key: 'seconds', value: timeLeft?.seconds });

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={containerStyle}>
        {label && (
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              opacity: 0.8,
              marginBottom: '1rem',
            }}
          >
            {label}
          </div>
        )}

        {!targetDate ? (
          <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>
            Set a target date in settings
          </div>
        ) : timeLeft?.expired ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {completionMessage || "🎉 Time's Up!"}
            </div>
            {actionUrl && (
              <a
                href={actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#111827',
                  background: textColor,
                  textDecoration: 'none',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span>Launch Action</span>
                <span>➔</span>
              </a>
            )}
          </div>
        ) : timeLeft ? (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            {units.map((unit, i) => (
              <React.Fragment key={unit.key}>
                <div style={unitStyle}>
                  <span style={numberStyle}>
                    {String(unit.value ?? 0).padStart(2, '0')}
                  </span>
                  <span style={unitLabelStyle}>{unit.key}</span>
                </div>
                {i < units.length - 1 && <span style={separatorStyle}>:</span>}
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

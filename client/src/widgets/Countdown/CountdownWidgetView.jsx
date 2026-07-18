import React, { useState, useEffect } from 'react';
import { GRADIENTS } from '../index';

export default function CountdownWidgetView({ config }) {
  const [timeLeft, setTimeLeft] = useState(null);

  const {
    targetDate = '',
    label = 'Countdown',
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
    customCSS = ''
  } = config;

  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  useEffect(() => {
    function calculate() {
      if (!targetDate) { setTimeLeft(null); return; }
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ expired: true }); return; }
      setTimeLeft({
        expired: false,
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

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

  const units = [];
  if (showDays)    units.push({ key: 'days',    value: timeLeft?.days });
  if (showHours)   units.push({ key: 'hours',   value: timeLeft?.hours });
  if (showMinutes) units.push({ key: 'minutes', value: timeLeft?.minutes });
  if (showSeconds) units.push({ key: 'seconds', value: timeLeft?.seconds });

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={containerStyle}>
        {label && (
          <div style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8, marginBottom: '1rem' }}>
            {label}
          </div>
        )}
        {!targetDate ? (
          <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>Set a target date in settings</div>
        ) : timeLeft?.expired ? (
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>🎉 Time's Up!</div>
        ) : timeLeft ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {units.map((unit, i) => (
              <React.Fragment key={unit.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {String(unit.value ?? 0).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '600', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.3rem' }}>
                    {unit.key}
                  </span>
                </div>
                {i < units.length - 1 && (
                  <span style={{ fontSize: '2.2rem', fontWeight: '800', opacity: 0.5, alignSelf: 'flex-start', marginTop: '0.1rem', padding: '0 0.1rem' }}>:</span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

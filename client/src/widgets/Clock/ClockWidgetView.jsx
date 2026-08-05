import React, { useState, useEffect } from 'react';

export default function ClockWidgetView({ config }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    timeFormat = '12',
    showSeconds = true,
    textColor = '#ffffff',
    fontSize = '36px',
    fontFamily = 'Outfit',
    backgroundColor = 'transparent',
    backgroundImageUrl = '',
    borderColor = 'transparent',
    borderWidth = '0px',
    customCSS = '',
    darkMode = false,
    hoverAnimation = 'none',
    showDate = false,
    textShadow = 'none',
  } = config;

  const shadowStyles = {
    subtle: '1px 1px 3px rgba(0, 0, 0, 0.7)',
    glow: '0 0 12px rgba(255, 255, 255, 0.8)',
    hard: '2px 2px 0px rgba(0, 0, 0, 0.9)',
  };
  const effectiveTextShadow = shadowStyles[textShadow] || 'none';

  const hoverClass =
    hoverAnimation && hoverAnimation !== 'none'
      ? `hover-anim-${hoverAnimation}`
      : '';

  const effectiveBgColor = darkMode ? '#111827' : backgroundColor;
  const effectiveTextColor = darkMode ? '#f9fafb' : textColor;

  // Sanitize: strip any </style> tags to prevent style-block breakout
  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  // Format time
  let hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  let ampm = '';
  if (timeFormat === '12') {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  }
  const displayHours = String(hours).padStart(2, '0');

  const timeString = `${displayHours}:${minutes}${showSeconds ? `:${seconds}` : ''}${ampm}`;

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const dateString = time.toLocaleDateString(undefined, dateOptions);

  const fontUrl =
    fontFamily && fontFamily !== 'monospace'
      ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700&display=swap`
      : null;

  return (
    <>
      {fontUrl ? <link rel="stylesheet" href={fontUrl} /> : null}
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div
        className={`${darkMode ? 'dark-mode' : 'light-mode'} ${hoverClass}`}
        style={{
          color: effectiveTextColor,
          textShadow: effectiveTextShadow,
          fontSize: fontSize,
          fontFamily:
            fontFamily === 'monospace'
              ? 'JetBrains Mono, monospace'
              : `'${fontFamily}', sans-serif`,
          fontWeight: 'bold',
          backgroundColor: effectiveBgColor,
          backgroundImage: backgroundImageUrl
            ? `url(${backgroundImageUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: 'none',
          padding: '10px 20px',
          textAlign: 'center',
          userSelect: 'none',
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div>{timeString}</div>
        {showDate && (
          <div
            style={{
              fontSize: '0.45em',
              fontWeight: 'normal',
              opacity: 0.85,
              marginTop: '0.25em',
            }}
          >
            {dateString}
          </div>
        )}
      </div>
    </>
  );
}

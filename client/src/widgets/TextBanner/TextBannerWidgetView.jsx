import React from 'react';
import { GRADIENTS } from '../index';

export default function TextBannerWidgetView({ config }) {
  const {
    text = 'Welcome to Widgetry!',
    textColor = '#ffffff',
    fontSize = '24px',
    fontWeight = 'bold',
    alignment = 'center',
    letterSpacing = 'normal',
    fontFamily = 'Outfit',
    backgroundColor = '#1e293b',
    backgroundStyle = 'solid',
    gradientName = 'sunset',
    backgroundImageUrl = '',
    customCSS = '',
  } = config;

  const fontUrl =
    fontFamily && fontFamily !== 'monospace'
      ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;600;700;800&display=swap`
      : null;

  const style = {
    color: textColor,
    fontSize: fontSize,
    fontWeight: fontWeight,
    textAlign: alignment,
    letterSpacing: letterSpacing,
    fontFamily: fontFamily === 'monospace' ? 'JetBrains Mono, monospace' : `'${fontFamily}', sans-serif`,
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100vh',
    boxSizing: 'border-box',
  };

  if (backgroundStyle === 'gradient') {
    style.background = GRADIENTS[gradientName] || GRADIENTS.sunset;
  } else {
    style.backgroundColor = backgroundColor;
  }

  if (backgroundImageUrl) {
    style.backgroundImage = `url(${backgroundImageUrl})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundRepeat = 'no-repeat';
  }

  const safeCSS = customCSS ? customCSS.replace(/<\/style>/gi, '') : '';

  return (
    <>
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}
      {safeCSS && <style>{safeCSS}</style>}
      <div style={style}>
        <div style={{ width: '100%' }}>{text}</div>
      </div>
    </>
  );
}

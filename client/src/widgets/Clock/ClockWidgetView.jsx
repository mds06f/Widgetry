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
    borderColor = 'transparent',
    borderWidth = '0px'
  } = config;

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

  return (
    <div style={{
      color: textColor,
      fontSize: fontSize,
      fontFamily: fontFamily === 'monospace' ? 'JetBrains Mono, monospace' : 'Outfit, sans-serif',
      fontWeight: 'bold',
      backgroundColor: backgroundColor,
      border: `${borderWidth} solid ${borderColor}`,
      borderRadius: '8px',
      padding: '10px 20px',
      textAlign: 'center',
      userSelect: 'none',
      width: '100%',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {timeString}
    </div>
  );
}

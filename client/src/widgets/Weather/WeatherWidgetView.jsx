import React, { useState, useEffect } from 'react';
import { GRADIENTS } from '../index';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning 
} from 'lucide-react';

const ICON_MAP = {
  Sun: Sun,
  CloudSun: CloudSun,
  Cloud: Cloud,
  CloudFog: CloudFog,
  CloudDrizzle: CloudDrizzle,
  CloudRain: CloudRain,
  CloudSnow: CloudSnow,
  CloudLightning: CloudLightning
};

export default function WeatherWidgetView({ config }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    city = 'Paris',
    unit = 'C',
    textColor = '#ffffff',
    backgroundColor = '#131a30',
    backgroundStyle = 'gradient',
    gradientName = 'sunset',
    borderRadius = '12px'
  } = config;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    async function fetchWeather() {
      try {
        const response = await fetch(`/api/widgets/proxy/weather?city=${encodeURIComponent(city)}`);
        if (!response.ok) {
          throw new Error('City not found or server error');
        }
        const json = await response.json();
        if (active) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      active = false;
    };
  }, [city]);

  const style = {
    color: textColor,
    borderRadius: borderRadius,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Outfit, sans-serif',
    textAlign: 'center'
  };

  if (backgroundStyle === 'gradient') {
    style.background = GRADIENTS[gradientName] || GRADIENTS.sunset;
  } else {
    style.backgroundColor = backgroundColor;
  }

  if (loading) {
    return (
      <div style={style}>
        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Loading weather details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={style}>
        <p style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>⚠️ Error</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{error}</p>
      </div>
    );
  }

  // Convert temp if unit is Fahrenheit
  let displayTemp = data.temperature;
  if (unit === 'F') {
    displayTemp = (data.temperature * 9) / 5 + 32;
    displayTemp = Math.round(displayTemp * 10) / 10;
  }

  const WeatherIcon = ICON_MAP[data.icon] || Cloud;

  return (
    <div style={style}>
      <div style={{ fontSize: '1rem', fontWeight: '600', opacity: 0.9, marginBottom: '0.25rem' }}>
        {data.city}, {data.country}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
        <WeatherIcon size={40} style={{ strokeWidth: 2 }} />
        <span style={{ fontSize: '2.5rem', fontWeight: '700' }}>
          {displayTemp}°{unit}
        </span>
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.8 }}>
        {data.condition}
      </div>
    </div>
  );
}

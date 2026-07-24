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
  CloudLightning,
} from 'lucide-react';

const ICON_MAP = {
  Sun: Sun,
  CloudSun: CloudSun,
  Cloud: Cloud,
  CloudFog: CloudFog,
  CloudDrizzle: CloudDrizzle,
  CloudRain: CloudRain,
  CloudSnow: CloudSnow,
  CloudLightning: CloudLightning,
};

export default function WeatherWidgetView({ config }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    city = 'Paris',
    citiesList = '',
    enableSlideshow = false,
    unit = 'C',
    textColor = '#ffffff',
    backgroundColor = '#131a30',
    backgroundStyle = 'gradient',
    gradientName = 'sunset',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const parsedCities = citiesList
    ? citiesList
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [city];
  const activeCities =
    enableSlideshow && parsedCities.length > 0 ? parsedCities : [city];
  const [cityIdx, setCityIdx] = useState(0);

  useEffect(() => {
    if (!enableSlideshow || activeCities.length <= 1) return;
    const interval = setInterval(() => {
      setCityIdx((prev) => (prev + 1) % activeCities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [enableSlideshow, activeCities.length]);

  const currentCity = activeCities[cityIdx] || city;

  // Sanitize: strip any </style> tags to prevent style-block breakout
  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    async function fetchWeather() {
      try {
        const response = await fetch(
          `/api/widgets/proxy/weather?city=${encodeURIComponent(currentCity)}`,
        );
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
  }, [currentCity]);

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
    textAlign: 'center',
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

  if (loading) {
    return (
      <>
        {safeCSS ? <style>{safeCSS}</style> : null}
        <div style={style}>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Loading weather details...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {safeCSS ? <style>{safeCSS}</style> : null}
        <div style={style}>
          <p
            style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            ⚠️ Error
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{error}</p>
        </div>
      </>
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
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={style}>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            opacity: 0.9,
            marginBottom: '0.25rem',
          }}
        >
          {data.city}, {data.country}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '0.5rem 0',
          }}
        >
          <WeatherIcon size={40} style={{ strokeWidth: 2 }} />
          <span style={{ fontSize: '2.5rem', fontWeight: '700' }}>
            {displayTemp}°{unit}
          </span>
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.8 }}>
          {data.condition}
        </div>
      </div>
    </>
  );
}

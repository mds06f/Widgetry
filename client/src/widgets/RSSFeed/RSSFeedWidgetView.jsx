import React, { useState, useEffect } from 'react';
import { GRADIENTS } from '../index';

export default function RSSFeedWidgetView({ config }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    feedUrl = 'https://news.ycombinator.com/rss',
    headerSize = '1rem',
    textColor = '#ffffff',
    backgroundColor = '#0f172a',
    backgroundStyle = 'solid',
    gradientName = 'darkness',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = ''
  } = config;

  useEffect(() => {
    if (!feedUrl) {
      setData(null);
      setError('Please configure an RSS Feed URL');
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/widgets/proxy/rss?url=${encodeURIComponent(feedUrl)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to retrieve RSS feed data');
        }
        return res.json();
      })
      .then((json) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [feedUrl]);

  const containerStyle = {
    color: textColor,
    fontFamily: 'Outfit, sans-serif',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: borderRadius,
  };

  if (backgroundStyle === 'gradient') {
    containerStyle.background = GRADIENTS[gradientName] || GRADIENTS.darkness;
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

  return (
    <>
      {safeCSS && <style>{safeCSS}</style>}
      <div style={containerStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.7, fontSize: '0.85rem' }}>
            Fetching feed articles...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.8rem' }}>
            ⚠️ {error}
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <h4 style={{
              fontSize: headerSize,
              fontWeight: '700',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '0.35rem',
              margin: '0 0 0.5rem 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              opacity: 0.9
            }}>
              📰 {data.title}
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              flex: 1,
              justifyContent: 'center'
            }}>
              {data.items && data.items.length > 0 ? (
                data.items.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: textColor,
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.4rem',
                      padding: '0.25rem 0.4rem',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.15s ease',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>•</span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {item.title}
                    </span>
                  </a>
                ))
              ) : (
                <div style={{ fontSize: '0.75rem', opacity: 0.6, textAlign: 'center' }}>No articles found.</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
            Configure RSS url to display news list.
          </div>
        )}
      </div>
    </>
  );
}

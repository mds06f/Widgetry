import React, { useState, useEffect } from 'react';
import { GRADIENTS } from '../index';

export default function GithubStatsWidgetView({ config }) {
  const {
    username = '',
    showGraph = true,
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'cosmic',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = '',
    heatmapTheme = 'green',
  } = config;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  const THEME_PALETTES = {
    green: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    blue: ['#161b22', '#0a3069', '#0969da', '#54aefe', '#80ccff'],
    fire: ['#161b22', '#5c1d00', '#9e2a00', '#e65100', '#ff9800'],
    purple: ['#161b22', '#3b1254', '#6b1b9a', '#ab47bc', '#e1bee7'],
  };

  const getContributionColor = (val) => {
    const palette = THEME_PALETTES[heatmapTheme] || THEME_PALETTES.green;
    return palette[val] || palette[0];
  };

  useEffect(() => {
    if (!username) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('API limit reached or user not found');
        }
        return res.json();
      })
      .then((profile) => {
        setData({
          avatar_url: profile.avatar_url,
          name: profile.name || profile.login,
          login: profile.login,
          bio: profile.bio || 'Developer on GitHub',
          public_repos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
        });
        setLoading(false);
      })
      .catch((err) => {
        // Safe fallback mock data
        console.warn(
          'GitHub API fetch failed, using fallback mock data:',
          err.message,
        );
        // Simple hash function to generate deterministic stats for the mock data based on username
        const hash = username
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        setData({
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          login: username.toLowerCase(),
          bio: `Building great widgets! (Mocked Stats due to rate limit/offline)`,
          public_repos: (hash % 80) + 12,
          followers: ((hash * 3) % 5000) + 42,
          following: ((hash * 7) % 300) + 10,
        });
        setLoading(false);
      });
  }, [username]);

  // Generate deterministic contribution levels for grid based on username
  const generateGrid = () => {
    const grid = [];
    const hash = username
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // 7 rows by 16 cols
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 16; c++) {
        // Generate a value between 0 and 4
        const val = (hash + r * 13 + c * 7) % 5;
        grid.push(val);
      }
    }
    return grid;
  };

  // Build backgrounds
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
    position: 'relative',
    overflow: 'hidden',
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

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={containerStyle} className="github-widget-container">
        {!username ? (
          <div
            style={{ opacity: 0.7, textAlign: 'center', fontSize: '0.9rem' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐙</div>
            Configure a GitHub username in Settings
          </div>
        ) : loading ? (
          <div
            className="github-loading"
            style={{ opacity: 0.8, fontSize: '0.9rem' }}
          >
            Fetching GitHub stats...
          </div>
        ) : data ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              alignItems: 'center',
            }}
          >
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                maxWidth: '280px',
              }}
            >
              <img
                src={data.avatar_url}
                alt={data.login}
                className="github-avatar"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {data.name}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  @{data.login}
                </span>
              </div>
            </div>

            {/* Bio */}
            <p
              style={{
                fontSize: '0.75rem',
                opacity: 0.8,
                margin: '0',
                textAlign: 'center',
                width: '100%',
                maxWidth: '280px',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.2',
              }}
            >
              {data.bio}
            </p>

            {/* Stats row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                width: '100%',
                maxWidth: '280px',
                background: 'rgba(0,0,0,0.15)',
                padding: '0.5rem 0',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>
                  {data.public_repos}
                </span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Repos
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>
                  {data.followers}
                </span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Followers
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>
                  {data.following}
                </span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Following
                </span>
              </div>
            </div>

            {/* Simulated Contribution Graph */}
            {showGraph && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.6rem',
                    opacity: 0.7,
                    alignSelf: 'flex-start',
                    marginLeft: '0.2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Contributions
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(7, auto)',
                    gridAutoFlow: 'column',
                    gap: '2px',
                    background: 'rgba(0,0,0,0.1)',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                >
                  {generateGrid().map((val, i) => (
                    <div
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '1px',
                        backgroundColor: getContributionColor(val),
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}

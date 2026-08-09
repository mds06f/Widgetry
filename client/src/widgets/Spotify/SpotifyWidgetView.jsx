import React, { useState, useEffect, useRef } from 'react';
import { GRADIENTS } from '../index';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const TRACK_PRESETS = {
  resonance: {
    title: 'Resonance',
    artist: 'HOME',
    album: 'Odyssey',
    duration: 212, // 3:32
    coverUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
  },
  midnight: {
    title: 'Midnight City',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    duration: 243, // 4:03
    coverUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
  },
  getlucky: {
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    album: 'Random Access Memories',
    duration: 249, // 4:09
    coverUrl:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80',
  },
  strobe: {
    title: 'Strobe',
    artist: 'Deadmau5',
    album: 'For Lack of a Better Name',
    duration: 387, // 6:27
    coverUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80',
  },
};

export default function SpotifyWidgetView({ config }) {
  const {
    trackPreset = 'resonance',
    playlistUrl = '',
    customTitle = '',
    customArtist = '',
    customAlbum = '',
    customDuration = 180,
    customCoverUrl = '',
    showVisualizer = true,
    showPlaybackControls = true,
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'darkness',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  const match = window.location.pathname.match(/\/widget\/render\/([^/]+)/);
  const widgetId = match ? match[1] : null;

  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playlistId = playlistUrl
    ? (playlistUrl.includes('playlist/')
        ? playlistUrl.split('playlist/')[1].split('?')[0]
        : playlistUrl.trim())
    : '';

  useEffect(() => {
    if (trackPreset !== 'playlist' || !playlistId || !widgetId) {
      setPlaylistTracks([]);
      setCurrentTrackIndex(0);
      return;
    }

    let active = true;
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`/api/widgets/spotify/playlist/${playlistId}/${widgetId}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.tracks && data.tracks.length > 0) {
            setPlaylistTracks(data.tracks);
            setCurrentTrackIndex(0);
          }
        }
      } catch (err) {
        console.error('Error fetching playlist tracks:', err);
      }
    };
    fetchPlaylist();

    return () => {
      active = false;
    };
  }, [trackPreset, playlistId, widgetId]);

  const isPlaylistMode = trackPreset === 'playlist' && playlistTracks.length > 0;

  // Determine active track details
  let activeTrack = TRACK_PRESETS[trackPreset] || TRACK_PRESETS.resonance;
  if (isPlaylistMode) {
    activeTrack = playlistTracks[currentTrackIndex] || {
      title: 'No Tracks',
      artist: 'Empty Playlist',
      album: '',
      duration: 180,
      coverUrl: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=300'
    };
  } else if (trackPreset === 'custom') {
    activeTrack = {
      title: customTitle || 'Untitled Track',
      artist: customArtist || 'Unknown Artist',
      album: customAlbum || 'Unknown Album',
      duration: Number(customDuration) || 180,
      coverUrl:
        customCoverUrl ||
        'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=300&auto=format&fit=crop&q=80',
    };
  }

  const [liveTrack, setLiveTrack] = useState(null);

  useEffect(() => {
    if (!config.spotifyConnected || !widgetId) {
      setLiveTrack(null);
      return;
    }

    let active = true;
    const fetchLivePlaying = async () => {
      try {
        const res = await fetch(`/api/widgets/spotify/currently-playing/${widgetId}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setLiveTrack(data);
          }
        }
      } catch (e) {
        console.error('Error fetching live Spotify track:', e);
      }
    };

    fetchLivePlaying();
    const interval = setInterval(fetchLivePlaying, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [config.spotifyConnected, widgetId]);

  const isSpotifyMode = config.spotifyConnected && liveTrack;

  // Override details if Spotify is connected and we have live data
  if (isSpotifyMode) {
    activeTrack = {
      title: liveTrack.title || 'Nothing Playing',
      artist: liveTrack.artist || 'Spotify Account Connected',
      album: liveTrack.album || '',
      duration: liveTrack.duration || 0,
      coverUrl: liveTrack.coverUrl || 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=300',
    };
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [volume, setVolume] = useState(70);

  // Sync state with live Spotify track
  useEffect(() => {
    if (isSpotifyMode) {
      setIsPlaying(liveTrack.isPlaying);
      setProgress(liveTrack.progress || 0);
    }
  }, [isSpotifyMode, liveTrack]);

  // Reset progress when track changes
  useEffect(() => {
    if (!isSpotifyMode) {
      setProgress(0);
    }
  }, [trackPreset, customTitle, customArtist, isSpotifyMode, currentTrackIndex]);

  // Handle play progression
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= activeTrack.duration) {
            if (isPlaylistMode) {
              setCurrentTrackIndex((prevIdx) => (prevIdx + 1) % playlistTracks.length);
              return 0;
            } else if (!isSpotifyMode) {
              setIsPlaying(false);
            }
            return activeTrack.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeTrack.duration, isSpotifyMode, isPlaylistMode, playlistTracks.length]);

  // Format time (seconds to mm:ss)
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercentage = clickX / width;
    setProgress(Math.floor(newPercentage * activeTrack.duration));
  };

  // Styles
  const style = {
    color: textColor,
    borderRadius: borderRadius,
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Outfit, sans-serif',
    overflow: 'hidden',
    position: 'relative',
  };

  if (backgroundStyle === 'gradient') {
    style.background = GRADIENTS[gradientName] || GRADIENTS.darkness;
  } else {
    style.backgroundColor = backgroundColor;
  }

  if (backgroundImageUrl) {
    style.backgroundImage = `url(${backgroundImageUrl})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundRepeat = 'no-repeat';
  }

  // Visualizer animations setup
  const animStyles = isPlaying
    ? {}
    : { transform: 'scaleY(0.15)', transformOrigin: 'bottom' };

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={style} className="spotify-widget-container">
        {/* Main layout container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            width: '100%',
          }}
        >
          {/* Cover Art */}
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
              flexShrink: 0,
              background: '#121212',
            }}
          >
            <img
              src={activeTrack.coverUrl}
              alt={activeTrack.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Track Details & Visualizer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'between',
                alignItems: 'flex-start',
                width: '100%',
                gap: '0.5rem',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeTrack.title}
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    opacity: 0.8,
                    margin: '2px 0 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeTrack.artist}
                </p>
                <p
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '400',
                    opacity: 0.6,
                    margin: '1px 0 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeTrack.album}
                </p>
              </div>

              {/* Spotify Icon */}
              <div
                style={{
                  color: '#1DB954',
                  filter: 'drop-shadow(0 0 4px rgba(29, 185, 84, 0.4))',
                  flexShrink: 0,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-1.007-.336.075-.67-.14-.744-.477-.074-.336.14-.67.477-.743 3.847-.88 7.15-.502 9.813 1.13.294.18.387.563.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.848-.107-.973-.52-.125-.413.108-.847.52-.973 3.666-1.114 8.228-.574 11.343 1.344.367.227.488.708.26 1.073zm.106-2.833C14.733 8.87 9.497 8.694 6.46 9.616c-.482.146-.99-.13-1.136-.613-.146-.483.13-.99.613-1.136 3.5-1.06 9.288-.86 12.96 1.32.434.257.576.816.32 1.25-.257.433-.816.575-1.25.32z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Controls, Progress, and Visualizer */}
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '0.75rem',
          }}
        >
          {/* Progress Bar Container */}
          <div style={{ width: '100%' }}>
            <div
              onClick={handleProgressBarClick}
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${(progress / activeTrack.duration) * 100}%`,
                  height: '100%',
                  background: '#1DB954',
                  borderRadius: '999px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </div>

            {/* Time labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                fontWeight: '500',
                opacity: 0.6,
                marginTop: '4px',
              }}
            >
              <span>{formatTime(progress)}</span>
              <span>{formatTime(activeTrack.duration)}</span>
            </div>
          </div>

          {/* Controls Footer Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            {/* Visualizer inside the controls area */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '3px',
                height: '24px',
                width: '40px',
                opacity: showVisualizer ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => {
                const animationDuration = [
                  '0.8s',
                  '1.2s',
                  '0.9s',
                  '1.1s',
                  '0.7s',
                ][i - 1];
                return (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: '100%',
                      background: '#1DB954',
                      borderRadius: '3px',
                      animation: isPlaying
                        ? `spotifyBounce ${animationDuration} ease-in-out infinite alternate`
                        : 'none',
                      animationDelay: `${i * 0.15}s`,
                      ...animStyles,
                    }}
                  />
                );
              })}
              {/* Inline keyframe style injection */}
              <style>{`
                @keyframes spotifyBounce {
                  0% { transform: scaleY(0.15); }
                  100% { transform: scaleY(1); }
                }
              `}</style>
            </div>

            {/* Core Play/Pause controls */}
            {showPlaybackControls ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transform: 'translateX(-10px)', // Center properly relative to visualizer
                }}
              >
                <button
                  onClick={() => {
                    if (isPlaylistMode) {
                      if (progress > 3) {
                        setProgress(0);
                      } else {
                        setCurrentTrackIndex((prev) => (prev - 1 + playlistTracks.length) % playlistTracks.length);
                        setProgress(0);
                      }
                    } else {
                      setProgress(0);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.8,
                  }}
                  title={isPlaylistMode ? "Previous Track" : "Restart"}
                >
                  <SkipBack size={16} fill="currentColor" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: textColor,
                    border: 'none',
                    color:
                      backgroundStyle === 'solid' ? backgroundColor : '#121212',
                    cursor: 'pointer',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'scale(1.06)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'scale(1)')
                  }
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play
                      size={18}
                      fill="currentColor"
                      style={{ marginLeft: '2px' }}
                    />
                  )}
                </button>

                <button
                  onClick={() => {
                    if (isPlaylistMode) {
                      setCurrentTrackIndex((prev) => (prev + 1) % playlistTracks.length);
                      setProgress(0);
                    } else {
                      setProgress(Math.min(activeTrack.duration, progress + 10));
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.8,
                  }}
                  title={isPlaylistMode ? "Next Track" : "Skip 10s"}
                >
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>
            ) : (
              <div />
            )}

            {/* Volume Control Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: 0.7,
              }}
            >
              <Volume2 size={14} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                style={{
                  width: '50px',
                  height: '3px',
                  accentColor: '#1DB954',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

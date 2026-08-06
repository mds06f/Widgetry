import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RefreshCw, Music } from 'lucide-react';
import { GRADIENTS } from '../index';

export default function AudioPlayerWidgetView({ config }) {
  const {
    audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title = 'Sample Track',
    artist = 'Royalty Free',
    loop = false,
    autoplay = false,
    textColor = '#ffffff',
    backgroundColor = '#0b0f19',
    backgroundStyle = 'gradient',
    gradientName = 'cosmic',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = ''
  } = config;

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    // Reset player on source URL changes
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
      if (autoplay) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.log('Autoplay blocked by browser policy:', e.message));
      }
    }
  }, [audioUrl, autoplay]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Audio playback failed:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

  const safeCSS = customCSS ? customCSS.replace(/<\/style>/gi, '') : '';

  return (
    <>
      {safeCSS && <style>{safeCSS}</style>}
      <div style={containerStyle}>
        <audio
          ref={audioRef}
          src={audioUrl}
          loop={loop}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          width: '100%',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          {/* Album Art Placeholder */}
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
            flexShrink: 0
          }}>
            <Music size={22} style={{ color: '#fff' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title / Artist */}
            <div style={{
              fontSize: '0.88rem',
              fontWeight: '700',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0.1rem'
            }}>
              {title}
            </div>
            <div style={{
              fontSize: '0.72rem',
              opacity: 0.7,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0.4rem'
            }}>
              {artist}
            </div>

            {/* Time Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', opacity: 0.6, fontFamily: 'monospace' }}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.2)',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: '#6366f1'
                }}
              />
              <span style={{ fontSize: '0.65rem', opacity: 0.6, fontFamily: 'monospace' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <button
              onClick={togglePlay}
              style={{
                background: '#ffffff',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={15} style={{ color: '#000', fill: '#000' }} />
              ) : (
                <Play size={15} style={{ color: '#000', fill: '#000', marginLeft: '2px' }} />
              )}
            </button>

            {/* Volume Icon + Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
              <Volume2 size={16} style={{ opacity: 0.8 }} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '50px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.2)',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: '#ffffff'
                }}
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { GRADIENTS } from '../index';

export default function PomodoroWidgetView({ config }) {
  const {
    workDuration = 25,
    breakDuration = 5,
    soundAlert = true,
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'cosmic',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = ''
  } = config;

  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(workDuration * 60);

  const safeCSS = customCSS.replace(/<\/style>/gi, '');
  const timerRef = useRef(null);

  // Sync with config changes when reset/idle
  useEffect(() => {
    if (!isActive) {
      setSecondsLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
    }
  }, [workDuration, breakDuration, mode, isActive]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            playAlertSound();
            // Switch modes
            const nextMode = mode === 'work' ? 'break' : 'work';
            setMode(nextMode);
            return (nextMode === 'work' ? workDuration : breakDuration) * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, mode, workDuration, breakDuration]);

  const playAlertSound = () => {
    if (!soundAlert) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext failed or blocked by autoplay policy:", e);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft((mode === 'work' ? workDuration : breakDuration) * 60);
  };

  const skipSession = () => {
    setIsActive(false);
    const nextMode = mode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    setSecondsLeft((nextMode === 'work' ? workDuration : breakDuration) * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalSeconds = (mode === 'work' ? workDuration : breakDuration) * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

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
    textAlign: 'center'
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
      <div style={containerStyle} className="pomodoro-widget-container">
        
        {/* Session Mode Badge */}
        <div style={{
          fontSize: '0.7rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          background: mode === 'work' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(57, 211, 83, 0.2)',
          color: mode === 'work' ? '#ff8080' : '#80ff80',
          border: mode === 'work' ? '1px solid rgba(255, 77, 77, 0.3)' : '1px solid rgba(57, 211, 83, 0.3)',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          marginBottom: '1rem'
        }}>
          {mode === 'work' ? '🔴 Focus Session' : '🟢 Break Time'}
        </div>

        {/* Digital Clock readout */}
        <div className="timer-display" style={{
          fontSize: '3.6rem',
          fontWeight: '800',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          marginBottom: '1rem',
          textShadow: '0 4px 10px rgba(0,0,0,0.15)'
        }}>
          {formatTime(secondsLeft)}
        </div>

        {/* Dynamic Progress Bar */}
        <div style={{
          width: '180px',
          height: '6px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: mode === 'work' ? '#ff4d4d' : '#39d353',
            transition: 'width 1s linear',
            borderRadius: '3px'
          }} />
        </div>

        {/* Controls Layout */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={toggleTimer}
            style={{
              background: textColor,
              color: backgroundStyle === 'solid' ? backgroundColor : '#1a1a1a',
              border: 'none',
              padding: '0.45rem 1.2rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              transition: 'transform 0.1s active'
            }}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={resetTimer}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              color: textColor,
              padding: '0.45rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={skipSession}
            style={{
              background: 'transparent',
              border: 'none',
              color: textColor,
              opacity: 0.75,
              padding: '0.45rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Skip ➔
          </button>

        </div>
      </div>
    </>
  );
}

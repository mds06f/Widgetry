import React from 'react';
import { GRADIENTS } from '../index';

export default function PomodoroWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Pomodoro Settings</h3>

      <div className="config-row">
        <div className="config-field">
          <label>Work Duration (mins)</label>
          <input
            type="number"
            min="1"
            max="120"
            value={config.workDuration || 25}
            onChange={(e) =>
              handleUpdate('workDuration', parseInt(e.target.value) || 25)
            }
          />
        </div>
        <div className="config-field">
          <label>Break Duration (mins)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={config.breakDuration || 5}
            onChange={(e) =>
              handleUpdate('breakDuration', parseInt(e.target.value) || 5)
            }
          />
        </div>
      </div>

      <div className="config-field toggle-field">
        <label>Enable Sound Alert</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={config.soundAlert !== false}
            onChange={(e) => handleUpdate('soundAlert', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {config.soundAlert !== false && (
        <>
          <div className="config-field" style={{ marginBottom: '0.75rem' }}>
            <label>Custom Sound URL (optional)</label>
            <input
              type="text"
              value={config.customSoundUrl || ''}
              onChange={(e) => handleUpdate('customSoundUrl', e.target.value)}
              placeholder="https://example.com/sound.mp3"
            />
          </div>
          <div className="config-field" style={{ marginTop: '-0.25rem', marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem' }}
              onClick={() => {
                if (config.customSoundUrl) {
                  try {
                    const audio = new Audio(config.customSoundUrl);
                    audio.volume = 0.5;
                    audio.play();
                  } catch (e) {
                    console.warn('Failed to play custom sound URL:', e);
                  }
                  return;
                }
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
                  console.warn('AudioContext failed:', e);
                }
              }}
            >
              🔊 Play Test Sound
            </button>
          </div>
        </>
      )}

      <div className="config-field">
        <label>Background Style</label>
        <select
          value={config.backgroundStyle || 'gradient'}
          onChange={(e) => handleUpdate('backgroundStyle', e.target.value)}
        >
          <option value="gradient">Gradient Presets</option>
          <option value="solid">Solid Background Color</option>
        </select>
      </div>

      {config.backgroundStyle === 'solid' ? (
        <div className="config-row">
          <div className="config-field">
            <label>Background Color</label>
            <input
              type="color"
              value={config.backgroundColor || '#1b2542'}
              onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
            />
          </div>
          <div className="config-field">
            <label>Text Color</label>
            <input
              type="color"
              value={config.textColor || '#ffffff'}
              onChange={(e) => handleUpdate('textColor', e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="config-field">
          <label>Gradient Theme</label>
          <div className="gradient-picker">
            {Object.keys(GRADIENTS).map((key) => (
              <div
                key={key}
                className={`gradient-option ${config.gradientName === key ? 'active' : ''}`}
                style={{ background: GRADIENTS[key] }}
                onClick={() => handleUpdate('gradientName', key)}
                title={key}
              />
            ))}
          </div>
        </div>
      )}

      <div className="config-field">
        <label>Background Image URL</label>
        <input
          type="text"
          value={config.backgroundImageUrl || ''}
          onChange={(e) => handleUpdate('backgroundImageUrl', e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
        />
      </div>

      <div className="config-field">
        <label>Card Corner Rounding</label>
        <select
          value={config.borderRadius || '12px'}
          onChange={(e) => handleUpdate('borderRadius', e.target.value)}
        >
          <option value="0px">Sharp Corners (0px)</option>
          <option value="6px">Subtle (6px)</option>
          <option value="12px">Rounded (12px)</option>
          <option value="24px">Extra Rounded (24px)</option>
        </select>
      </div>

      <div className="config-field">
        <label>Custom CSS</label>
        <textarea
          value={config.customCSS || ''}
          onChange={(e) => handleUpdate('customCSS', e.target.value)}
          placeholder={`/* Override any widget styles */\n.timer-display {\n  font-weight: 900;\n  letter-spacing: -0.05em;\n}`}
          rows={6}
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

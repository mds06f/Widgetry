import React, { useState } from 'react';
import { GRADIENTS } from '../index';

export default function PollWidgetView({ config = {} }) {
  const {
    question = 'What is your favorite frontend framework?',
    optionsString = 'React, Vue, Svelte, Angular',
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'cosmic',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const safeCSS = customCSS ? customCSS.replace(/<\/style>/gi, '') : '';
  const options = optionsString
    .split(',')
    .map((opt) => opt.trim())
    .filter(Boolean);

  const [votes, setVotes] = useState(() => options.map(() => 1));
  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleVote = (idx) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      const newVotes = [...votes];
      newVotes[idx] = (newVotes[idx] || 0) + 1;
      setVotes(newVotes);
    }
  };

  const totalVotes = votes.reduce((acc, curr) => acc + curr, 0);
  const background =
    backgroundStyle === 'gradient'
      ? GRADIENTS[gradientName] || GRADIENTS.cosmic
      : backgroundColor;

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div
        style={{
          width: '100%',
          height: '100vh',
          background,
          borderRadius,
          color: textColor,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>
          {question}
        </h3>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flex: 1,
          }}
        >
          {options.map((option, idx) => {
            const count = votes[idx] || 0;
            const pct =
              totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isVoted = selectedIdx === idx;

            return (
              <div
                key={idx}
                onClick={() => handleVote(idx)}
                style={{
                  position: 'relative',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isVoted
                    ? '2px solid #6366f1'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  cursor: selectedIdx === null ? 'pointer' : 'default',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {/* Progress bar background */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${pct}%`,
                    backgroundColor: isVoted
                      ? 'rgba(99, 102, 241, 0.4)'
                      : 'rgba(255, 255, 255, 0.15)',
                    transition: 'width 0.3s ease',
                    zIndex: 0,
                  }}
                />

                <span
                  style={{ zIndex: 1, fontSize: '14px', fontWeight: '500' }}
                >
                  {option}
                </span>
                <span style={{ zIndex: 1, fontSize: '12px', opacity: 0.8 }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            fontSize: '12px',
            opacity: 0.7,
            textAlign: 'right',
            marginTop: '12px',
          }}
        >
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </div>
      </div>
    </>
  );
}

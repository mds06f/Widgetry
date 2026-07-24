import React, { useState, useEffect } from 'react';
import { GRADIENTS } from '../index';

const LOCAL_FALLBACKS = {
  'dad-jokes': [
    { text: "I'm reading a book on anti-gravity. I just can't put it down!" },
    {
      text: 'Why do fathers take an extra pair of socks when they go golfing?',
      punchline: 'In case they get a hole in one!',
    },
    {
      text: 'Did you hear about the restaurant on the moon?',
      punchline: 'Great food, no atmosphere.',
    },
    {
      text: 'What do you call a factory that makes okay products?',
      punchline: 'A satisfactory.',
    },
    { text: 'Dear Math, grow up and solve your own problems.' },
  ],
  programming: [
    {
      text: 'Why do programmers wear glasses?',
      punchline: 'Because they need to C#.',
    },
    {
      text: "There are 10 types of people in the world: those who understand binary, and those who don't.",
    },
    {
      text: 'How many programmers does it take to change a light bulb?',
      punchline: "None, that's a hardware problem.",
    },
    { text: "['hip', 'hip']", punchline: 'hip hip array!' },
    {
      text: 'A SQL query goes into a bar, walks up to two tables and asks:',
      punchline: "'Can I join you?'",
    },
  ],
  general: [
    {
      text: 'The primary flight feathers of a bird are called remiges.',
      punchline: 'True',
    },
    {
      text: 'The total surface area of two human lungs is approximately 70 square meters.',
      punchline: 'True',
    },
    { text: 'Sound travels faster in water than in air.', punchline: 'True' },
    {
      text: 'A day on Venus is longer than a year on Venus.',
      punchline: 'True',
    },
    {
      text: 'The heart of a shrimp is located in its head.',
      punchline: 'True',
    },
  ],
};

export default function TriviaWidgetView({ config }) {
  const {
    category = 'dad-jokes',
    textColor = '#ffffff',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'cosmic',
    backgroundImageUrl = '',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  const loadNewItem = () => {
    setLoading(true);
    setRevealed(false);

    const useFallback = () => {
      const items = LOCAL_FALLBACKS[category] || LOCAL_FALLBACKS['dad-jokes'];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setContent(randomItem);
      setLoading(false);
    };

    if (category === 'dad-jokes') {
      fetch('https://icanhazdadjoke.com/', {
        headers: { Accept: 'application/json' },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.joke) {
            setContent({ text: data.joke });
            setLoading(false);
          } else {
            useFallback();
          }
        })
        .catch(() => useFallback());
    } else if (category === 'programming') {
      fetch('https://official-joke-api.appspot.com/jokes/programming/random')
        .then((res) => res.json())
        .then((data) => {
          const item = Array.isArray(data) ? data[0] : data;
          if (item && item.setup) {
            setContent({ text: item.setup, punchline: item.punchline });
            setLoading(false);
          } else {
            useFallback();
          }
        })
        .catch(() => useFallback());
    } else {
      // General trivia
      fetch('https://opentdb.com/api.php?amount=1&type=boolean')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.results && data.results.length > 0) {
            const item = data.results[0];
            // Decode html entities briefly
            const decodedQuestion = item.question
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&amp;/g, '&');
            setContent({
              text: decodedQuestion,
              punchline: `Answer: ${item.correct_answer}`,
            });
            setLoading(false);
          } else {
            useFallback();
          }
        })
        .catch(() => useFallback());
    }
  };

  useEffect(() => {
    loadNewItem();
  }, [category]);

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
    textAlign: 'center',
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

  const categoryLabel =
    {
      'dad-jokes': 'Dad Joke 👨',
      programming: 'Dev Humor 💻',
      general: 'Trivia Fact 🧠',
    }[category] || 'Trivia';

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={containerStyle} className="trivia-widget-container">
        {/* Category Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            fontSize: '0.65rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.2rem 0.6rem',
            borderRadius: '20px',
            opacity: 0.8,
          }}
        >
          {categoryLabel}
        </div>

        {loading ? (
          <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Shuffling...</div>
        ) : content ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              width: '100%',
              maxWidth: '280px',
              marginTop: '15px',
            }}
          >
            {/* Setup / Body */}
            <p
              className="trivia-text"
              style={{
                fontSize: '1rem',
                fontWeight: '500',
                lineHeight: '1.4',
                margin: '0',
                opacity: 0.95,
              }}
            >
              {content.text}
            </p>

            {/* Punchline Drawer */}
            {content.punchline && (
              <div
                style={{
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {revealed ? (
                  <p
                    className="trivia-punchline"
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      margin: '0',
                      color: textColor,
                      opacity: 0.9,
                      animation: 'fadeIn 0.3s ease-in-out',
                    }}
                  >
                    {content.punchline}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      color: textColor,
                      padding: '0.35rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      outline: 'none',
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.background = 'rgba(255, 255, 255, 0.3)')
                    }
                    onMouseOut={(e) =>
                      (e.target.style.background = 'rgba(255, 255, 255, 0.2)')
                    }
                  >
                    Reveal Answer
                  </button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <button
              type="button"
              onClick={loadNewItem}
              style={{
                background: 'transparent',
                border: `1.5px solid ${textColor}`,
                color: textColor,
                padding: '0.35rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                opacity: 0.8,
                transition: 'all 0.2s',
                marginTop: content.punchline ? '0' : '10px',
              }}
              onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = '0.8';
                e.target.style.background = 'transparent';
              }}
            >
              Next ➔
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

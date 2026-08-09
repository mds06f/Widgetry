import React from 'react';
import { GRADIENTS } from '../index';

const QUOTES = {
  motivational: [
    {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
    },
    {
      text: "It always seems impossible until it's done.",
      author: 'Nelson Mandela',
    },
    { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
    {
      text: 'Strive not to be a success, but rather to be of value.',
      author: 'Albert Einstein',
    },
  ],
  developer: [
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    {
      text: 'Before software can be reusable it first has to be usable.',
      author: 'Ralph Johnson',
    },
    { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
    { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  ],
  design: [
    {
      text: 'Design is not just what it looks like and feels like. Design is how it works.',
      author: 'Steve Jobs',
    },
    {
      text: 'Simplicity is the ultimate sophistication.',
      author: 'Leonardo da Vinci',
    },
    {
      text: 'Good design is obvious. Great design is transparent.',
      author: 'Joe Sparano',
    },
    { text: 'Form follows function.', author: 'Louis Sullivan' },
  ],
};

export default function QuoteWidgetView({ config }) {
  const {
    category = 'motivational',
    textAlign = 'center',
    textColor = '#ffffff',
    fontSize = '18px',
    backgroundStyle = 'gradient',
    backgroundColor = '#1b2542',
    gradientName = 'royal',
    backgroundImageUrl = '',
    borderRadius = '12px',
    showAuthor = true,
    customCSS = '',
  } = config;

  const [copied, setCopied] = React.useState(false);
  const [quoteOffset, setQuoteOffset] = React.useState(0);

  // Sanitize: strip any </style> tags to prevent style-block breakout
  const safeCSS = customCSS.replace(/<\/style>/gi, '');

  // Select quotes list
  const list = QUOTES[category] || QUOTES.motivational;
  
  // Reset offset when category changes
  React.useEffect(() => {
    setQuoteOffset(0);
  }, [category]);

  // Use a simple hash of the configuration to pick a stable index, rather than Math.random() which changes on every render.
  // This keeps the preview stable while editing!
  const configStr = JSON.stringify({ ...config, category });
  let hash = 0;
  for (let i = 0; i < configStr.length; i++) {
    hash = configStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const quoteIndex = (Math.abs(hash) + quoteOffset) % list.length;
  const quote = list[quoteIndex];

  const handleCopy = () => {
    const textToCopy = `"${quote.text}" — ${quote.author}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build styling
  const style = {
    color: textColor,
    fontSize: fontSize,
    textAlign: textAlign,
    borderRadius: borderRadius,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Outfit, sans-serif',
    position: 'relative',
  };

  if (backgroundStyle === 'gradient') {
    style.background = GRADIENTS[gradientName] || GRADIENTS.royal;
  } else {
    style.backgroundColor = backgroundColor;
  }

  if (backgroundImageUrl) {
    style.backgroundImage = `url(${backgroundImageUrl})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundRepeat = 'no-repeat';
  }

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={style}>
        <p
          style={{
            fontWeight: '500',
            lineHeight: '1.4',
            marginBottom: showAuthor ? '1rem' : '0',
          }}
        >
          "{quote.text}"
        </p>
        {showAuthor && (
          <span
            style={{
              fontSize: '0.85em',
              opacity: 0.8,
              fontWeight: '300',
              fontStyle: 'italic',
              marginBottom: '1rem',
            }}
          >
            — {quote.author}
          </span>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setQuoteOffset((prev) => prev + 1)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              color: textColor,
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '0.25rem 0.75rem',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            🔄 Next Quote
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              color: textColor,
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '0.25rem 0.75rem',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Quote'}
          </button>
        </div>
      </div>
    </>
  );
}

import React from 'react';
import { GRADIENTS } from '../index';

const COINS = [
  { id: 'bitcoin', name: '🪙 Bitcoin (BTC)' },
  { id: 'ethereum', name: '⟠ Ethereum (ETH)' },
  { id: 'solana', name: '☀️ Solana (SOL)' },
  { id: 'dogecoin', name: '🐕 Dogecoin (DOGE)' },
  { id: 'cardano', name: '₳ Cardano (ADA)' },
  { id: 'ripple', name: '✕ Ripple (XRP)' },
  { id: 'polkadot', name: '● Polkadot (DOT)' },
];

const CURRENCIES = [
  { code: 'usd', symbol: '$', name: 'USD ($)' },
  { code: 'eur', symbol: '€', name: 'EUR (€)' },
  { code: 'gbp', symbol: '£', name: 'GBP (£)' },
  { code: 'jpy', symbol: '¥', name: 'JPY (¥)' },
];

export default function CryptoTickerWidgetConfig({ config, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="config-group">
      <h3>Crypto Ticker Settings</h3>

      <div className="config-field">
        <label>Select Cryptocurrency</label>
        <select
          value={config.coinId || 'bitcoin'}
          onChange={(e) => handleUpdate('coinId', e.target.value)}
        >
          {COINS.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
        </select>
      </div>

      <div className="config-field">
        <label>Select Currency</label>
        <select
          value={config.vsCurrency || 'usd'}
          onChange={(e) => handleUpdate('vsCurrency', e.target.value)}
        >
          {CURRENCIES.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.name}
            </option>
          ))}
        </select>
      </div>

      <div className="config-row">
        <div className="config-field">
          <label>Price Up Color</label>
          <input
            type="color"
            value={config.upColor || '#39d353'}
            onChange={(e) => handleUpdate('upColor', e.target.value)}
          />
        </div>
        <div className="config-field">
          <label>Price Down Color</label>
          <input
            type="color"
            value={config.downColor || '#ff4d4d'}
            onChange={(e) => handleUpdate('downColor', e.target.value)}
          />
        </div>
      </div>

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
          placeholder={`/* Override any widget styles */\n.crypto-price {\n  font-size: 2.5rem;\n  font-weight: 900;\n}`}
          rows={6}
        />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          CSS is scoped to this widget's iframe — use standard selectors freely.
        </small>
      </div>
    </div>
  );
}

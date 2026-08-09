import React, { useEffect, useState } from 'react';
import { executeInSandbox } from '../../utils/sandboxBridge';

export default function CustomScriptWidgetView({ config = {} }) {
  const {
    htmlCode = "<div class='custom-card'>Hello Custom Widget!</div>",
    cssCode = '.custom-card { color: #6366f1; font-weight: bold; }',
    jsCode = '',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const [sandboxError, setSandboxError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const safeCSS = (cssCode + '\n' + customCSS).replace(/<\/style>/gi, '');

  useEffect(() => {
    if (!jsCode.trim()) {
      setLogs([]);
      setSandboxError(null);
      return;
    }
    executeInSandbox(jsCode)
      .then(({ logs: executedLogs }) => {
        setSandboxError(null);
        setLogs(executedLogs || []);
      })
      .catch((err) => {
        setSandboxError(err.message);
        setLogs(err.logs || []);
      });
  }, [jsCode]);

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div
        style={{
          width: '100%',
          height: '100vh',
          borderRadius,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
          fontFamily: 'Outfit, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div dangerouslySetInnerHTML={{ __html: htmlCode }} style={{ width: '100%', textAlign: 'center' }} />
        </div>

        {sandboxError && (
          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', zIndex: 5 }}>
            ⚠️ Sandbox Error: {sandboxError}
          </div>
        )}

        {/* Debug Console Panel */}
        <div style={{ width: '100%', zIndex: 10, marginTop: '0.5rem' }}>
          <button
            onClick={() => setShowConsole(!showConsole)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px',
              color: '#fff',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: '600',
              transition: 'background 0.2s',
            }}
          >
            <span>💬 Sandbox Console ({logs.length})</span>
            <span>{showConsole ? '▼ Close' : '▲ Show Logs'}</span>
          </button>

          {showConsole && (
            <div
              style={{
                background: '#0d0f17',
                border: '1px solid rgba(255,255,255,0.12)',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '0.5rem',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center', padding: '0.25rem' }}>
                  No logs captured. Add console.log() in your code.
                </div>
              ) : (
                logs.map((log, idx) => {
                  const logColor = log.type === 'error' ? '#f87171' : log.type === 'warn' ? '#fbbf24' : '#a7f3d0';
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '2px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>[{log.time}]</span>
                      <span style={{ color: logColor, fontWeight: 'bold' }}>{log.type.toUpperCase()}:</span>
                      <span style={{ color: '#fff', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

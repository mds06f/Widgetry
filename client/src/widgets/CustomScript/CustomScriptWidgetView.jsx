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
  const safeCSS = (cssCode + '\n' + customCSS).replace(/<\/style>/gi, '');

  useEffect(() => {
    if (!jsCode.trim()) return;
    executeInSandbox(jsCode)
      .then(() => setSandboxError(null))
      .catch((err) => setSandboxError(err.message));
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
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
        {sandboxError && (
          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            ⚠️ Sandbox Error: {sandboxError}
          </div>
        )}
      </div>
    </>
  );
}

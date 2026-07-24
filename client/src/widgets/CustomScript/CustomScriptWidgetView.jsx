import React from 'react';

export default function CustomScriptWidgetView({ config = {} }) {
  const {
    htmlCode = "<div class='custom-card'>Hello Custom Widget!</div>",
    cssCode = '.custom-card { color: #6366f1; font-weight: bold; }',
    jsCode = '',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const safeCSS = (cssCode + '\n' + customCSS).replace(/<\/style>/gi, '');
  const safeJS = jsCode.replace(/<\/script>/gi, '');

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
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          fontFamily: 'Outfit, sans-serif',
        }}
        dangerouslySetInnerHTML={{ __html: htmlCode }}
      />
      {safeJS ? <script dangerouslySetInnerHTML={{ __html: safeJS }} /> : null}
    </>
  );
}

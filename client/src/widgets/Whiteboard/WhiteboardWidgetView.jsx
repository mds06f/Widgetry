import React, { useRef, useState, useEffect } from 'react';

export default function WhiteboardWidgetView({ config = {} }) {
  const {
    brushColor = '#6366f1',
    brushSize = 4,
    backgroundColor = '#0f172a',
    borderRadius = '12px',
    customCSS = '',
  } = config;

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(brushColor);
  const [size, setSize] = useState(brushSize);

  const safeCSS = customCSS ? customCSS.replace(/<\/style>/gi, '') : '';

  useEffect(() => {
    setColor(brushColor);
    setSize(brushSize);
  }, [brushColor, brushSize]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: backgroundColor,
          borderRadius,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxSizing: 'border-box',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '28px',
                height: '28px',
                border: 'none',
                cursor: 'pointer',
                background: 'none',
              }}
            />
            <input
              type="range"
              min="1"
              max="20"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ width: '80px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={downloadCanvas}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              Download
            </button>
            <button
              onClick={clearCanvas}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            width: '100%',
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            cursor: 'crosshair',
          }}
        />
      </div>
    </>
  );
}

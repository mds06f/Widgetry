import React, { useState, useEffect } from "react";
import { GRADIENTS } from "../index";

export default function AnalogClockWidgetView({ config }) {
  const {
    hourHandColor = "#ffffff",
    minuteHandColor = "#ffffff",
    secondHandColor = "#ff4d4d",
    faceColor = "rgba(0,0,0,0.2)",
    showNumbers = true,
    showTicks = true,
    textColor = "#ffffff",
    backgroundStyle = "gradient",
    backgroundColor = "#1b2542",
    gradientName = "cosmic",
    backgroundImageUrl = "",
    borderRadius = "12px",
    customCSS = "",
  } = config;

  const [time, setTime] = useState(new Date());

  const safeCSS = customCSS.replace(/<\/style>/gi, "");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 50); // 20fps for smooth sweep hand animation
    return () => clearInterval(timer);
  }, []);

  const ms = time.getMilliseconds();
  const seconds = time.getSeconds() + ms / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secAngle = seconds * 6;
  const minAngle = minutes * 6;
  const hrAngle = hours * 30;

  // Build backgrounds
  const containerStyle = {
    color: textColor,
    fontFamily: "Outfit, sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "1.5rem",
    borderRadius: borderRadius,
    position: "relative",
    overflow: "hidden",
  };

  if (backgroundStyle === "gradient") {
    containerStyle.background = GRADIENTS[gradientName] || GRADIENTS.cosmic;
  } else {
    containerStyle.backgroundColor = backgroundColor;
  }

  if (backgroundImageUrl) {
    containerStyle.backgroundImage = `url(${backgroundImageUrl})`;
    containerStyle.backgroundSize = "cover";
    containerStyle.backgroundPosition = "center";
    containerStyle.backgroundRepeat = "no-repeat";
  }

  // Draw ticks
  const ticks = [];
  if (showTicks) {
    for (let i = 0; i < 12; i++) {
      const angle = i * 30;
      const isMajor = i % 3 === 0;
      ticks.push(
        <line
          key={`tick-${i}`}
          x1="100"
          y1={isMajor ? "22" : "25"}
          x2="100"
          y2="30"
          stroke={textColor}
          strokeWidth={isMajor ? "2" : "1"}
          opacity={isMajor ? "0.85" : "0.5"}
          transform={`rotate(${angle} 100 100)`}
        />,
      );
    }
  }

  // Draw numbers (12, 1, 2, ..., 11)
  const numbers = [];
  if (showNumbers) {
    const r = 58; // Radius for placing numbers
    for (let i = 1; i <= 12; i++) {
      const angleRad = (i * 30 * Math.PI) / 180;
      const x = 100 + r * Math.sin(angleRad);
      const y = 100 - r * Math.cos(angleRad) + 3.5; // Offset slightly for vertical alignment
      numbers.push(
        <text
          key={`num-${i}`}
          x={x}
          y={y}
          fill={textColor}
          fontSize="9.5"
          fontWeight="700"
          textAnchor="middle"
          opacity="0.9"
          style={{ userSelect: "none" }}
        >
          {i}
        </text>,
      );
    }
  }

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div style={containerStyle} className="analog-clock-container">
        <svg
          width="180"
          height="180"
          viewBox="0 0 200 200"
          style={{ filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.25))" }}
        >
          {/* Clock Dial face */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill={faceColor}
            stroke={textColor}
            strokeWidth="2.5"
            opacity="0.95"
            className="clock-face"
          />

          {/* Tick marks */}
          {ticks}

          {/* Numbers */}
          {numbers}

          {/* Hour Hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="55"
            stroke={hourHandColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            transform={`rotate(${hrAngle} 100 100)`}
            className="clock-hour-hand"
          />

          {/* Minute Hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="42"
            stroke={minuteHandColor}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${minAngle} 100 100)`}
            className="clock-minute-hand"
          />

          {/* Second Hand */}
          <line
            x1="100"
            y1="115" // Extend slightly backward past center
            x2="100"
            y2="35"
            stroke={secondHandColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${secAngle} 100 100)`}
            className="clock-second-hand"
          />

          {/* Center Pin / Dot */}
          <circle
            cx="100"
            cy="100"
            r="5"
            fill={secondHandColor}
            className="clock-center-dot"
          />
          <circle cx="100" cy="100" r="2" fill="#ffffff" />
        </svg>
      </div>
    </>
  );
}

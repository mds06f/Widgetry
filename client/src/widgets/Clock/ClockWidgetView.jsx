import React, { useState, useEffect } from "react";

export default function ClockWidgetView({ config }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    timeFormat = "12",
    showSeconds = true,
    textColor = "#ffffff",
    fontSize = "36px",
    fontFamily = "Outfit",
    backgroundColor = "transparent",
    backgroundImageUrl = "",
    borderColor = "transparent",
    borderWidth = "0px",
    customCSS = "",
    darkMode = false,
  } = config;

  const effectiveBgColor = darkMode
    ? "#111827"
    : backgroundColor;
  const effectiveTextColor = darkMode
    ? "#f9fafb"
    : textColor;

  // Sanitize: strip any </style> tags to prevent style-block breakout
  const safeCSS = customCSS.replace(/<\/style>/gi, "");

  // Format time
  let hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");

  let ampm = "";
  if (timeFormat === "12") {
    ampm = hours >= 12 ? " PM" : " AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  }
  const displayHours = String(hours).padStart(2, "0");

  const timeString = `${displayHours}:${minutes}${showSeconds ? `:${seconds}` : ""}${ampm}`;

  return (
    <>
      {safeCSS ? <style>{safeCSS}</style> : null}
      <div
        className={darkMode ? "dark-mode" : "light-mode"}
        style={{
          color: effectiveTextColor,
          fontSize: fontSize,
          fontFamily:
            fontFamily === "monospace"
              ? "JetBrains Mono, monospace"
              : "Outfit, sans-serif",
          fontWeight: "bold",
          backgroundColor: effectiveBgColor,
          backgroundImage: backgroundImageUrl
            ? `url(${backgroundImageUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          border: `${borderWidth} solid ${borderColor}`,
          borderRadius: "8px",
          padding: "10px 20px",
          textAlign: "center",
          userSelect: "none",
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {timeString}
      </div>
    </>
  );
}

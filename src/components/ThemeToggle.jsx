import React from "react";

export default function ThemeToggle({ theme, setTheme, colors }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        width: 32,
        height: 32,
        background: colors.primary,
        border: "none",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.2s",
        boxShadow: theme === "light" ? "0 2px 8px #aaa" : undefined,
        flexShrink: 0
      }}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5.2" fill="#f5e206" stroke="#975809" strokeWidth="1.4" />
          <g stroke="#f5e206" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.6" y1="4.6" x2="6.8" y2="6.8" />
            <line x1="19.4" y1="19.4" x2="17.2" y2="17.2" />
            <line x1="4.6" y1="19.4" x2="6.8" y2="17.2" />
            <line x1="19.4" y1="4.6" x2="17.2" y2="6.8" />
          </g>
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path
            d="M21 13.5 A9 9 0 1 1 13.5 3 A7 7 0 1 0 21 13.5Z"
            fill="#f5e206"
            stroke="#975809"
            strokeWidth="1.4"
          />
        </svg>
      )}
    </button>
  );
}

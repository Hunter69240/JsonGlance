import React from "react";

export default function BackButton({ colors, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 12px",
        marginBottom: 16,
        background: colors.analyticsBg,
        color: colors.primary,
        border: `2px solid ${colors.primary}`,
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: 13,
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all 0.2s"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = colors.primary;
        e.currentTarget.style.color = colors.background;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = colors.analyticsBg;
        e.currentTarget.style.color = colors.primary;
      }}
      title="Go back to Home"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back to Home
    </button>
  );
}

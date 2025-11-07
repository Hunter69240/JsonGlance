import React from "react";

export default function ExportImage({ colors, handleExportImage, showExportPanel, setShowExportPanel, exportMsg }) {
  return (
    <div style={{ width: "100%", marginBottom: 12 }}>
      <button
        onClick={() => setShowExportPanel(!showExportPanel)}
        style={{
          width: "100%",
          padding: "8px 10px",
          background: colors.secondary,
          color: colors.background,
          border: "none",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: 8,
          transition: "background 0.2s"
        }}
      >
        {showExportPanel ? "Hide" : "Show"} Export Image
      </button>
      {showExportPanel && (
        <div
          style={{
            background: colors.analyticsBg,
            border: `2px solid ${colors.secondary}`,
            borderRadius: "6px",
            padding: "10px",
            marginBottom: 12
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 8,
              color: colors.analyticsLabel,
              fontSize: 12
            }}
          >
            Export as:
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              marginBottom: 10
            }}
          >
            {["png", "jpg", "svg", "gif"].map((format) => (
              <button
                key={format}
                onClick={() => handleExportImage(format)}
                style={{
                  padding: "8px 10px",
                  background: colors.primary,
                  color: colors.background,
                  border: "none",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                  textTransform: "uppercase"
                }}
              >
                {format}
              </button>
            ))}
          </div>
          {exportMsg && (
            <div
              style={{
                fontSize: 11,
                color: exportMsg.includes("Error") ? colors.accent : colors.analyticsKey,
                padding: "6px",
                background: colors.sidebar,
                borderRadius: "4px",
                minHeight: "20px",
                fontFamily: "monospace"
              }}
            >
              {exportMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React from "react";

export default function AdvancedFeatures({
  colors,
  showAdvanced,
  setShowAdvanced,
  findValue,
  setFindValue,
  replaceValue,
  setReplaceValue,
  handleReplace,
  replaceMsg,
  lastReplaceCount
}) {
  return (
    <div style={{ width: "100%", marginTop: 3 }}>
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        style={{
          width: "100%",
          padding: "9px 0",
          marginBottom: showAdvanced ? 6 : 0,
          background: colors.secondary,
          color: colors.background,
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontFamily: "monospace",
          fontSize: 13,
          cursor: "pointer",
          letterSpacing: 1,
          transition: "background 0.2s"
        }}
      >
        {showAdvanced ? "Hide Advanced Features" : "Show Advanced Features"}
      </button>
      {showAdvanced && (
        <div
          style={{
            width: "100%",
            background: colors.analyticsBg,
            padding: "12px 10px 15px 10px",
            borderRadius: "8px",
            fontFamily: "monospace",
            color: colors.analyticsText,
            marginTop: 6,
            border: `1.5px solid ${colors.sidebarBorder}`
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 4, color: colors.analyticsKey, fontSize: 15 }}>
            Search & Replace
          </div>
          <form onSubmit={handleReplace} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <input
              type="text"
              value={findValue}
              placeholder="Find value"
              onChange={(e) => setFindValue(e.target.value)}
              style={{
                padding: "6px",
                border: `1.5px solid ${colors.primary}`,
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "13px",
                marginBottom: 6
              }}
            />
            <input
              type="text"
              value={replaceValue}
              placeholder="Replace with"
              onChange={(e) => setReplaceValue(e.target.value)}
              style={{
                padding: "6px",
                border: `1.5px solid ${colors.secondary}`,
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "13px",
                marginBottom: 5
              }}
            />
            <button
              type="submit"
              style={{
                padding: "7px 5px",
                fontWeight: "bold",
                background: colors.primary,
                color: colors.background,
                border: "none",
                borderRadius: "6px",
                fontFamily: "monospace",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              Replace All
            </button>
            <div
              style={{
                color: lastReplaceCount > 0 ? colors.secondary : colors.accent,
                fontSize: 12,
                marginTop: 4,
                minHeight: 20
              }}
            >
              {replaceMsg}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import React from "react";

export default function AnalyticsPanel({ colors, analytics, showAnalyticsPanel, setShowAnalyticsPanel }) {
  return (
    <div style={{ width: "100%", marginTop: 8, marginBottom: 8 }}>
      <button
        onClick={() => setShowAnalyticsPanel((p) => !p)}
        style={{
          width: "100%",
          padding: "8px 0",
          background: colors.primary,
          color: colors.background,
          border: "none",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: showAnalyticsPanel ? 6 : 0,
          transition: "background 0.2s"
        }}
      >
        {showAnalyticsPanel ? "Hide Analytics" : "Show Analytics"}
      </button>
      {showAnalyticsPanel && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: colors.analyticsText,
            background: colors.analyticsBg,
            borderRadius: "8px",
            border: `1.5px solid ${colors.sidebarBorder}`,
            padding: "14px 9px",
            margin: "0",
            width: "100%"
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: colors.analyticsLabel, marginBottom: 7 }}>
            Analytics
          </div>
          <div>
            <b>Nodes:</b> {analytics.nodeCount}
          </div>
          <div>
            <b>Max Depth:</b> {analytics.maxDepth}
          </div>
          <div>
            <b>Largest Array:</b>{" "}
            {analytics.largestArray.length
              ? `${analytics.largestArray.path} [${analytics.largestArray.length}]`
              : "-"}
          </div>
          <div>
            <b>Largest Object:</b>{" "}
            {analytics.largestObject.keys
              ? `${analytics.largestObject.path} [${analytics.largestObject.keys} keys]`
              : "-"}
          </div>
          <div style={{ marginTop: 7 }}>
            <b>Key Frequency:</b>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: colors.analyticsKey,
                marginTop: 4,
                maxHeight: 60,
                overflowY: "auto"
              }}
            >
              {Object.entries(analytics.keyFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([k, v]) => (
                  <div key={k}>
                    {k}: {v}
                  </div>
                ))}
              {Object.keys(analytics.keyFrequency).length > 10 && <div>...</div>}
            </div>
          </div>
          <div style={{ marginTop: 7 }}>
            <b>Type Breakdown:</b>
            <div style={{ fontSize: 11, color: colors.analyticsKey }}>
              {Object.entries(analytics.typeCounts).map(([k, v]) => (
                <div key={k}>
                  {k}: {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

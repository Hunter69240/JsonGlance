import React from "react";

export default function SearchPanel({ colors, searchField, setSearchField, handleSearch, searchMsg, searchResultPath = [] }) {
  return (
    <>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 16,
          color: colors.primary,
          marginTop: 8,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: `1px solid ${colors.sidebarBorder}`,
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        Search
      </div>
      <div style={{ width: "100%", marginBottom: 12 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", width: "100%", gap: "6px" }}>
          <input
            type="text"
            placeholder="Search key..."
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: 12,
              border: `2px solid ${colors.sidebarBorder}`,
              color: colors.text,
              background: colors.sidebar,
              boxSizing: "border-box",
              minWidth: 0
            }}
          />
          <button
            type="submit"
            style={{
              background: colors.primary,
              color: colors.background,
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              fontFamily: "monospace",
              fontSize: 11,
              cursor: "pointer",
              fontWeight: "bold",
              whiteSpace: "nowrap"
            }}
          >
            Go
          </button>
        </form>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: searchResultPath.length > 0 ? colors.analyticsKey : colors.accent,
            marginTop: 8,
            wordBreak: "break-word",
            lineHeight: "1.3"
          }}
        >
          {searchMsg}
        </div>
      </div>
    </>
  );
}

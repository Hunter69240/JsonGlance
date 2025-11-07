import React from "react";

export default function FilterPanel({
  colors,
  excludedFields,
  setExcludedFields,
  filterInput,
  setFilterInput,
  showFilterPanel,
  setShowFilterPanel,
  allFields,
  toggleExclude
}) {
  const filteredSuggestions = allFields.filter((f) =>
    f.toLowerCase().includes(filterInput.toLowerCase())
  );

  return (
    <div style={{ width: "100%", marginBottom: 12 }}>
      <button
        onClick={() => setShowFilterPanel(!showFilterPanel)}
        style={{
          width: "100%",
          padding: "8px 10px",
          background: colors.accent,
          color: colors.background,
          border: "none",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: 8,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {showFilterPanel ? "Hide" : "Show"} Filters ({excludedFields.size})
      </button>
      {showFilterPanel && (
        <div
          style={{
            background: colors.filterPanel,
            border: `2px solid ${colors.accent}`,
            borderRadius: "6px",
            padding: "10px",
            marginBottom: 12
          }}
        >
          <input
            type="text"
            placeholder="Search fields..."
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              marginBottom: 8,
              border: `1px solid ${colors.sidebarBorder}`,
              borderRadius: "4px",
              background: colors.sidebar,
              color: colors.text,
              fontFamily: "monospace",
              fontSize: 11,
              boxSizing: "border-box"
            }}
          />
          <div style={{ maxHeight: "180px", overflowY: "auto", fontSize: 11 }}>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((field) => (
                <div
                  key={field}
                  onClick={() => toggleExclude(field)}
                  style={{
                    padding: "6px 8px",
                    marginBottom: 3,
                    background: excludedFields.has(field) ? colors.filterHidden : colors.sidebarBorder,
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: excludedFields.has(field) ? colors.background : colors.primary,
                    fontFamily: "monospace",
                    transition: "all 0.2s",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                  title={field}
                >
                  {excludedFields.has(field) ? "👁️ " : "○ "}
                  {field}
                </div>
              ))
            ) : (
              <div style={{ color: colors.accent, padding: "8px", fontSize: 10 }}>No fields found</div>
            )}
          </div>
          {excludedFields.size > 0 && (
            <>
              <div
                style={{
                  background: colors.filterHidden,
                  padding: "6px",
                  borderRadius: "4px",
                  marginTop: 8,
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: colors.background,
                  marginBottom: 8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {excludedFields.size} field{excludedFields.size !== 1 ? "s" : ""} hidden
              </div>
              <button
                onClick={() => setExcludedFields(new Set())}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: colors.secondary,
                  color: colors.background,
                  border: "none",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: 10,
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Clear All
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

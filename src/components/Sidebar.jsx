import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import ThemeToggle from "./ThemeToggle";
import FormatConverter from "./FormatConverter";
import ExportImage from "./ExportImage";
import SearchPanel from "./SearchPanel";
import FilterPanel from "./FilterPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import AdvancedFeatures from "./AdvancedFeatures";

export default function Sidebar({
  colors,
  theme,
  setTheme,
  showMinimap,
  setShowMinimap,
  jsonData,
  setJsonData,
  copyJsonState,
  handleCopyJson,
  searchField,
  setSearchField,
  handleSearch,
  searchMsg,
  excludedFields,
  setExcludedFields,
  filterInput,
  setFilterInput,
  showFilterPanel,
  setShowFilterPanel,
  allFields,
  toggleExclude,
  selectedPathArr,
  selectedValue,
  rawSelectedValue,
  copied,
  handleCopy,
  analytics,
  showAnalyticsPanel,
  setShowAnalyticsPanel,
  findValue,
  setFindValue,
  replaceValue,
  setReplaceValue,
  handleReplace,
  replaceMsg,
  lastReplaceCount,
  showAdvanced,
  setShowAdvanced,
  handleExportImage,
  showExportPanel,
  setShowExportPanel,
  exportMsg
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "350px",
        minWidth: "250px",
        maxWidth: "450px",
        minHeight: "100%",
        background: colors.sidebar,
        padding: "20px 16px",
        borderRight: `2.5px solid ${colors.sidebarBorder}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        overflow: "auto",
        boxSizing: "border-box"
      }}
    >
      <BackButton colors={colors} onClick={() => navigate("/")} />

      {/* Header with title and controls */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 18,
          color: colors.primary,
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: `1px solid ${colors.sidebarBorder}`,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <span style={{ fontWeight: "bold", flexShrink: 0 }}>JSON Visualizer</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} colors={colors} />
          <button
            onClick={() => setShowMinimap(s => !s)}
            style={{
              padding: "4px 8px",
              background: showMinimap ? colors.primary : colors.sidebarBorder,
              color: showMinimap ? colors.background : colors.text,
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: 10,
              flexShrink: 0
            }}
            title={showMinimap ? "Hide Minimap" : "Show Minimap"}
          >
            Map
          </button>
        </div>
      </div>

      {/* COPY JSON button */}
      <div style={{ width: "100%", marginBottom: 12 }}>
        <button
          onClick={handleCopyJson}
          style={{
            width: "100%",
            fontFamily: "monospace",
            background: colors.secondary,
            color: colors.background,
            border: "none",
            borderRadius: "7px",
            fontWeight: "bold",
            padding: "8px 12px",
            fontSize: 12,
            cursor: "pointer",
            transition: "background 0.15s"
          }}
          title="Copy entire JSON to clipboard"
        >
          {copyJsonState}
        </button>
      </div>

      <FormatConverter 
        colors={colors}
        jsonData={jsonData}
        setJsonData={setJsonData}
      />

      <ExportImage
        colors={colors}
        handleExportImage={handleExportImage}
        showExportPanel={showExportPanel}
        setShowExportPanel={setShowExportPanel}
        exportMsg={exportMsg}
      />

      <SearchPanel
        colors={colors}
        searchField={searchField}
        setSearchField={setSearchField}
        handleSearch={handleSearch}
        searchMsg={searchMsg}
      />

      <FilterPanel
        colors={colors}
        excludedFields={excludedFields}
        setExcludedFields={setExcludedFields}
        filterInput={filterInput}
        setFilterInput={setFilterInput}
        showFilterPanel={showFilterPanel}
        setShowFilterPanel={setShowFilterPanel}
        allFields={allFields}
        toggleExclude={toggleExclude}
      />

      {/* Selected Path and Value */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          color: colors.analyticsKey,
          wordBreak: "break-word",
          marginTop: 8,
          marginBottom: 8,
          width: "100%",
          lineHeight: "1.4"
        }}
      >
        {selectedPathArr.length ? (
          <>
            <div>
              <b>Path:</b> {selectedPathArr.join(" > ").substring(0, 60)}
              {selectedPathArr.join(" > ").length > 60 && "..."}
            </div>
            {selectedValue !== "" && (
              <div
                style={{
                  color: colors.secondary,
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                  flexWrap: "wrap",
                  lineHeight: "1.4",
                  wordBreak: "break-all",
                  maxWidth: "95%"
                }}
              >
                <b style={{ color: colors.analyticsKey }}>Value:</b>
                <span
                  style={{
                    color: colors.accent,
                    background: colors.sidebar,
                    borderRadius: "4px",
                    padding: "2px 6px",
                    fontFamily: "monospace",
                    fontWeight: 500,
                    fontSize: 15,
                    wordBreak: "break-all",
                    overflowWrap: "anywhere"
                  }}
                >
                  {selectedValue}
                </span>
                <button
                  type="button"
                  style={{
                    padding: "2px 14px",
                    fontSize: 13,
                    fontFamily: "monospace",
                    background: copied ? colors.copyActive : colors.copyDefault,
                    color: colors.background,
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginLeft: 4,
                    minWidth: "48px"
                  }}
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            Path: <span style={{ color: colors.secondary }}>None</span>
          </>
        )}
      </div>

      <AnalyticsPanel
        colors={colors}
        analytics={analytics}
        showAnalyticsPanel={showAnalyticsPanel}
        setShowAnalyticsPanel={setShowAnalyticsPanel}
      />

      <AdvancedFeatures
        colors={colors}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        findValue={findValue}
        setFindValue={setFindValue}
        replaceValue={replaceValue}
        setReplaceValue={setReplaceValue}
        handleReplace={handleReplace}
        replaceMsg={replaceMsg}
        lastReplaceCount={lastReplaceCount}
      />
    </div>
  );
}

import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as d3 from "d3";
import Sidebar from "../components/Sidebar";
import VisualizationCanvas from "../components/VisualizationCanvas";
import { THEMES, getAnalytics, getAllFieldNames, deepReplace } from "../utils/visualizerUtils";
import { handleSearchLogic } from "../utils/searchUtils";
import { handleExportImage as exportImageUtil } from "../utils/exportUtils";

const VisualizeScreen = () => {
  const svgRef = useRef();
  const gRef = useRef();
  const zoomBehaviorRef = useRef();
  const zoomTransformRef = useRef(d3.zoomIdentity);
  const [zoomTick, setZoomTick] = useState(0);
  const { state } = useLocation();
  const [jsonData, setJsonData] = useState(state?.jsonData);

  const [theme, setTheme] = useState("dark");
  const colors = THEMES[theme];
  const [highlightedNodePathChain, setHighlightedNodePathChain] = useState([]);
  const [selectedNodePath, setSelectedNodePath] = useState("");
  const [selectedPathArr, setSelectedPathArr] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [rawSelectedValue, setRawSelectedValue] = useState("");
  const [searchField, setSearchField] = useState("");
  const [searchResultPath, setSearchResultPath] = useState([]);
  const [searchMsg, setSearchMsg] = useState("");
  const [expandedNodes, setExpandedNodes] = useState(new Set([""]));
  const [excludedFields, setExcludedFields] = useState(new Set());
  const [filterInput, setFilterInput] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [replaceMsg, setReplaceMsg] = useState("");
  const [lastReplaceCount, setLastReplaceCount] = useState(0);
  const [copyJsonState, setCopyJsonState] = useState("Copy JSON");

  const [analytics, setAnalytics] = useState({
    nodeCount: 0,
    maxDepth: 0,
    largestArray: { path: "", length: 0 },
    largestObject: { path: "", keys: 0 },
    keyFrequency: {},
    typeCounts: {}
  });

  useEffect(() => {
    if (jsonData) {
      setAnalytics(getAnalytics(jsonData));
    }
  }, [jsonData]);

  const allFields = Array.from(getAllFieldNames(jsonData || {})).sort();

  function toggleExclude(fieldName) {
    setExcludedFields((prev) => {
      const updated = new Set(prev);
      if (updated.has(fieldName)) {
        updated.delete(fieldName);
      } else {
        updated.add(fieldName);
      }
      return updated;
    });
  }

  function handleSearch(e) {
    e.preventDefault();
    const result = handleSearchLogic(jsonData, searchField, expandedNodes, excludedFields);
    
    // Clear any node selection when searching and use search result for highlighting
    if (result.searchResultPath.length > 0) {
      setHighlightedNodePathChain(result.searchResultNodePathChain || []);
    } else {
      setHighlightedNodePathChain([]);
    }
    setSelectedNodePath("");
    setSelectedPathArr(result.searchResultPath);
    
    setSearchResultPath(result.searchResultPath);
    setSearchMsg(result.searchMsg);
    setSelectedValue(result.selectedValue);
    setRawSelectedValue(result.rawSelectedValue);
    setCopied(false);
  }

  function handleReplace(e) {
    e.preventDefault();
    setReplaceMsg("");
    setLastReplaceCount(0);
    if (!findValue) {
      setReplaceMsg("Enter a value to search for.");
      return;
    }
    if (jsonData === undefined) return;
    const { newJson, count } = deepReplace(jsonData, findValue, replaceValue);
    if (count === 0) {
      setReplaceMsg(`No occurrences of "${findValue}" found.`);
    } else {
      setReplaceMsg(`Replaced ${count} occurrence${count === 1 ? "" : "s"} of "${findValue}".`);
      setJsonData(newJson);
      setLastReplaceCount(count);
    }
  }

  function handleCopy() {
    if (rawSelectedValue !== undefined && rawSelectedValue !== null) {
      navigator.clipboard.writeText(
        typeof rawSelectedValue === "string" ? rawSelectedValue : String(rawSelectedValue)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  function handleCopyJson() {
    if (!jsonData) return;
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopyJsonState("Copied!");
    setTimeout(() => setCopyJsonState("Copy JSON"), 1000);
  }

  const handleExportImageWrapper = (format) => {
    exportImageUtil(svgRef, gRef, format, setExportMsg);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "92vh",
        display: "flex",
        background: colors.background,
        color: colors.text,
        overflow: "hidden"
      }}
    >
      <Sidebar
        colors={colors}
        theme={theme}
        setTheme={setTheme}
        showMinimap={showMinimap}
        setShowMinimap={setShowMinimap}
        jsonData={jsonData}
        setJsonData={setJsonData}
        copyJsonState={copyJsonState}
        handleCopyJson={handleCopyJson}
        searchField={searchField}
        setSearchField={setSearchField}
        handleSearch={handleSearch}
        searchMsg={searchMsg}
        searchResultPath={searchResultPath}
        excludedFields={excludedFields}
        setExcludedFields={setExcludedFields}
        filterInput={filterInput}
        setFilterInput={setFilterInput}
        showFilterPanel={showFilterPanel}
        setShowFilterPanel={setShowFilterPanel}
        allFields={allFields}
        toggleExclude={toggleExclude}
        selectedPathArr={selectedPathArr}
        selectedValue={selectedValue}
        rawSelectedValue={rawSelectedValue}
        copied={copied}
        handleCopy={handleCopy}
        analytics={analytics}
        showAnalyticsPanel={showAnalyticsPanel}
        setShowAnalyticsPanel={setShowAnalyticsPanel}
        findValue={findValue}
        setFindValue={setFindValue}
        replaceValue={replaceValue}
        setReplaceValue={setReplaceValue}
        handleReplace={handleReplace}
        replaceMsg={replaceMsg}
        lastReplaceCount={lastReplaceCount}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        handleExportImage={handleExportImageWrapper}
        showExportPanel={showExportPanel}
        setShowExportPanel={setShowExportPanel}
        exportMsg={exportMsg}
      />
      <VisualizationCanvas
        colors={colors}
        jsonData={jsonData}
        expandedNodes={expandedNodes}
        setExpandedNodes={setExpandedNodes}
        excludedFields={excludedFields}
        highlightedNodePathChain={highlightedNodePathChain}
        setHighlightedNodePathChain={setHighlightedNodePathChain}
        setSelectedNodePath={setSelectedNodePath}
        setSelectedPathArr={setSelectedPathArr}
        setSelectedValue={setSelectedValue}
        setRawSelectedValue={setRawSelectedValue}
        setCopied={setCopied}
        showMinimap={showMinimap}
        zoomBehaviorRef={zoomBehaviorRef}
        zoomTransformRef={zoomTransformRef}
        zoomTick={zoomTick}
        setZoomTick={setZoomTick}
        searchResultPath={searchResultPath}
        setSearchResultPath={setSearchResultPath}
        setSearchMsg={setSearchMsg}
      />
    </div>
  );
};

export default VisualizeScreen;

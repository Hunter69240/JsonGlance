import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as d3 from "d3";

const WIDTH = 3500;
const HEIGHT = 2500;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const VERTICAL_SPACING = 220;
const HORIZONTAL_SPACING = 380;
const TOP_MARGIN = 100;
const ARRAY_THRESHOLD = 5;

const THEMES = {
  dark: {
    background: "#181c24",
    sidebar: "#232638",
    text: "#eee",
    primary: "#80ffea",
    secondary: "#51e3e0",
    accent: "#ff6b9d",
    nodeBg: "#262d37",
    nodeBorder: "#50e3c2",
    collapsedFill: "#4a3f6a",
    collapsedStroke: "#ff6b9d",
    highlightFill: "#ff007f",
    highlightStroke: "#ffe600",
    pathFill: "#4a3f6a",
    pathStroke: "#fae600",
    nodeText: "#80ffea",
    highlightNodeText: "#ffe600",
    link: "#01C4D6",
    linkActive: "#FF00DD",
    sidebarBorder: "#232638",
    analyticsBg: "#20253a",
    analyticsText: "#98fad9",
    analyticsLabel: "#50e3c2",
    analyticsKey: "#ffe272",
    copyActive: "#50e3c2",
    copyDefault: "#80ffea",
    filterHidden: "#ff4081",
    filterPanel: "#1a1f28"
  },
  light: {
    background: "#f5f5fa",
    sidebar: "#f7f7fb",
    text: "#181c24",
    primary: "#175ba5",
    secondary: "#0e81cc",
    accent: "#b83757",
    nodeBg: "#e7ebef",
    nodeBorder: "#0e81cc",
    collapsedFill: "#bfd1e5",
    collapsedStroke: "#b83757",
    highlightFill: "#f9f525",
    highlightStroke: "#b83757",
    pathFill: "#acecee",
    pathStroke: "#178fbf",
    nodeText: "#333",
    highlightNodeText: "#b83757",
    link: "#313972",
    linkActive: "#c31475",
    sidebarBorder: "#dde6f1",
    analyticsBg: "#e3e9f2",
    analyticsText: "#175ba5",
    analyticsLabel: "#175ba5",
    analyticsKey: "#c31475",
    copyActive: "#50e3c2",
    copyDefault: "#0e81cc",
    filterHidden: "#b83757",
    filterPanel: "#e6eef7"
  }
};

const VisualizeScreen = () => {
  const svgRef = useRef();
  const gRef = useRef();
  const zoomInitialized = useRef(false);
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

  // Search & Replace
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [replaceMsg, setReplaceMsg] = useState("");
  const [lastReplaceCount, setLastReplaceCount] = useState(0);

  // Copy JSON state
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
    function getAnalytics(data, path = [], depth = 0, meta = null) {
      if (!meta) {
        meta = {
          nodeCount: 0,
          maxDepth: 0,
          largestArray: { path: "", length: 0 },
          largestObject: { path: "", keys: 0 },
          keyFrequency: {},
          typeCounts: {}
        };
      }
      meta.nodeCount += 1;
      meta.maxDepth = Math.max(meta.maxDepth, depth);
      if (typeof data === "object" && data !== null) {
        const isArray = Array.isArray(data);
        if (isArray) {
          if (data.length > meta.largestArray.length) {
            meta.largestArray = { path: path.join("."), length: data.length };
          }
        } else {
          const keys = Object.keys(data);
          if (keys.length > meta.largestObject.keys) {
            meta.largestObject = { path: path.join("."), keys: keys.length };
          }
          keys.forEach(k => {
            meta.keyFrequency[k] = (meta.keyFrequency[k] || 0) + 1;
          });
        }
        meta.typeCounts[isArray ? "array" : "object"] = (meta.typeCounts[isArray ? "array" : "object"] || 0) + 1;
        for (let k in data) {
          if (data.hasOwnProperty(k)) {
            getAnalytics(data[k], path.concat([k]), depth + 1, meta);
          }
        }
      } else {
        const t = typeof data;
        meta.typeCounts[t] = (meta.typeCounts[t] || 0) + 1;
      }
      return meta;
    }
    if (jsonData) {
      setAnalytics(getAnalytics(jsonData));
    }
  }, [jsonData]);

  function isFieldExcluded(fieldName) {
    return excludedFields.has(fieldName);
  }

  function makeHierarchy(data, label = "", nodePath = "") {
    const currentPath = nodePath ? `${nodePath}/${label}` : label;
    if (isFieldExcluded(label)) return null;
    if (typeof data !== "object" || data === null) {
      return {
        name: label,
        value: data,
        rawValue: data,
        type: typeof data,
        isArray: false,
        isCollapsed: false,
        isCollapsible: false,
        nodePath: currentPath,
        children: undefined,
      };
    }
    const isArray = Array.isArray(data);
    const entries = isArray ? data : Object.entries(data);
    const itemCount = entries.length;
    const isExpanded = expandedNodes.has(currentPath);
    const isCollapsible = itemCount > ARRAY_THRESHOLD;
    let children = undefined;
    if (isExpanded || !isCollapsible) {
      const childrenRaw = isArray
        ? data.map((v, i) => makeHierarchy(v, i.toString(), currentPath))
        : Object.entries(data).map(([k, v]) => makeHierarchy(v, k, currentPath));
      children = childrenRaw.filter(c => c !== null);
    }
    return {
      name: label,
      children: children && children.length > 0 ? children : undefined,
      value: undefined,
      rawValue: undefined,
      isArray: isArray,
      isCollapsed: isCollapsible && !isExpanded,
      isCollapsible,
      type: isArray ? "array" : "object",
      length: itemCount,
      nodePath: currentPath,
    };
  }

  function searchTree(d3root, field) {
    let queue = [[d3root, []]];
    while (queue.length) {
      const [node, pathSoFar] = queue.shift();
      const myPath = [...pathSoFar, node.data.name];
      if (node.data.name === field) return { path: myPath.filter(x => x), node };
      if (node.children)
        for (let child of node.children)
          queue.push([child, myPath]);
    }
    return null;
  }

  function getAllFieldNames(data, fieldSet = new Set()) {
    if (typeof data !== "object" || data === null) return fieldSet;
    if (Array.isArray(data)) {
      data.forEach(item => getAllFieldNames(item, fieldSet));
    } else {
      Object.keys(data).forEach(key => {
        fieldSet.add(key);
        getAllFieldNames(data[key], fieldSet);
      });
    }
    return fieldSet;
  }

  function toggleExclude(fieldName) {
    setExcludedFields(prev => {
      const updated = new Set(prev);
      if (updated.has(fieldName)) {
        updated.delete(fieldName);
      } else {
        updated.add(fieldName);
      }
      return updated;
    });
  }

  useEffect(() => {
    if (!jsonData) return;
    const rootObj = makeHierarchy(jsonData, "");
    if (!rootObj) return;
    const root = d3.hierarchy(rootObj);
    const treeLayout = d3.tree().nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING]);
    treeLayout(root);
    const nodes = root.descendants();
    const minX = d3.min(nodes, d => d.x);
    const verticalOffset = TOP_MARGIN - minX;
    const nodesNoRoot = nodes.slice(1);
    const linksNoRoot = root.links().filter(l => l.source.depth !== 0);
    const g = d3.select(gRef.current);
    g.selectAll("*").remove();

    g.selectAll("path.link")
      .data(linksNoRoot)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3
        .linkHorizontal()
        .x(d => d.y + NODE_WIDTH / 2)
        .y(d => d.x + verticalOffset + NODE_HEIGHT / 2)
      )
      .attr("stroke", d =>
        highlightedNodePathChain.includes(d.target.data.nodePath)
          ? colors.linkActive
          : colors.link
      )
      .attr("stroke-width", d =>
        highlightedNodePathChain.includes(d.target.data.nodePath) ? 4 : 2)
      .attr("fill", "none")
      .attr("opacity", 0.8);

    const node = g
      .selectAll("g.node")
      .data(nodesNoRoot)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x + verticalOffset})`)
      .style("cursor", "pointer");

    node
      .append("rect")
      .attr("width", NODE_WIDTH)
      .attr("height", NODE_HEIGHT)
      .attr("x", 0)
      .attr("y", 0)
      .attr("rx", 13)
      .attr("fill", d =>
        highlightedNodePathChain.includes(d.data.nodePath)
          ? (d.data.nodePath === selectedNodePath ? colors.highlightFill : colors.pathFill)
          : (d.data.isCollapsed ? colors.collapsedFill : colors.nodeBg)
      )
      .attr("stroke", d =>
        highlightedNodePathChain.includes(d.data.nodePath)
          ? (d.data.nodePath === selectedNodePath ? colors.highlightStroke : colors.pathStroke)
          : (d.data.isCollapsed ? colors.collapsedStroke : colors.nodeBorder)
      )
      .attr("stroke-width", d =>
        highlightedNodePathChain.includes(d.data.nodePath) ? 4 : 2.5);

    node
      .append("text")
      .attr("x", 8)
      .attr("y", 28)
      .attr("font-size", 16)
      .attr("font-family", "monospace")
      .attr("fill", d =>
        highlightedNodePathChain.includes(d.data.nodePath)
          ? colors.highlightNodeText
          : colors.nodeText
      )
      .style("font-weight", 600)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .text(d => {
        const name = String(d.data.name || "");
        if (d.data.isCollapsible && d.data.isCollapsed) return (name.length > 10 ? name.substring(0, 8) + "..." : name) + " [+]";
        return name.length > 15 ? name.substring(0, 12) + "..." : name;
      })
      .append("title")
      .text(d => d.data.name || "");

    node
      .append("text")
      .attr("x", 8)
      .attr("y", 45)
      .attr("font-size", 12)
      .attr("fill", colors.secondary)
      .attr("font-family", "monospace")
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .text(d => {
        let text = "";
        if (d.data.isCollapsed) {
          text = `[${d.data.length}] ⊕`;
        } else {
          text = d.data.children
            ? (d.data.isArray
                ? `[${d.data.length}]`
                : `{${d.data.length}}`)
            : JSON.stringify(d.data.value);
        }
        return text.length > 18 ? text.substring(0, 15) + "..." : text;
      })
      .append("title")
      .text(d => {
        if (d.data.isCollapsed) {
          return `[${d.data.length} items] (Click to expand)`;
        }
        return d.data.children
          ? (d.data.isArray
              ? `[${d.data.length} items]`
              : `{${d.data.length} keys}`)
          : JSON.stringify(d.data.value);
      });

    const svg = d3.select(svgRef.current);
    svg.selectAll("rect.bg").remove();
    svg.insert("rect", ":first-child")
       .attr("class", "bg")
       .attr("width", WIDTH)
       .attr("height", HEIGHT)
       .attr("fill", colors.background);

    svg.call(
      d3.zoom()
        .scaleExtent([0.3, 2.5])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        })
    );
    if (!zoomInitialized.current) {
      svg.call(d3.zoom().transform, d3.zoomIdentity.translate(500, 250).scale(0.8));
      zoomInitialized.current = true;
    }

    g.selectAll("g.node").on("click", (event, d) => {
      if (d.data.isCollapsible) {
        setExpandedNodes(prev => {
          const next = new Set(prev);
          if (next.has(d.data.nodePath)) {
            next.delete(d.data.nodePath);
          } else {
            next.add(d.data.nodePath);
          }
          return next;
        });
      }
      setSelectedNodePath(d.data.nodePath);
      const nodePathChain = d.ancestors().reverse().map(a => a.data.nodePath);
      setHighlightedNodePathChain(nodePathChain);

      const pathArr = d.ancestors().reverse().map(a => a.data.name).filter(name => name !== "");
      setSelectedPathArr(pathArr);

      let valStr = "", rawVal = "";
      if ("value" in d.data) {
        if (typeof d.data.value === "object" && d.data.value !== null) {
          valStr = Array.isArray(d.data.value)
            ? `[${d.data.value.length} items]`
            : `{${Object.keys(d.data.value).length} keys}`;
          rawVal = JSON.stringify(d.data.value, null, 2);
        } else {
          valStr = JSON.stringify(d.data.value);
          rawVal = d.data.value;
        }
      }
      setSelectedValue(valStr);
      setRawSelectedValue(rawVal);
      setCopied(false);
    });
  }, [jsonData, expandedNodes, excludedFields, highlightedNodePathChain, selectedNodePath, colors]);

  function handleSearch(e) {
    e.preventDefault();
    if (!searchField.trim()) {
      setSearchResultPath([]);
      setSearchMsg("Enter a key name to search.");
      return;
    }
    const rootObj = makeHierarchy(jsonData, "");
    if (!rootObj) return;
    const root = d3.hierarchy(rootObj);
    const result = searchTree(root, searchField.trim());
    if (result) {
      setSearchResultPath(result.path);
      let valStr = "";
      let rawVal = "";
      if ("value" in result.node.data) {
        if (typeof result.node.data.value === "object" && result.node.data.value !== null) {
          valStr = Array.isArray(result.node.data.value)
            ? `[${result.node.data.value.length} items]`
            : `{${Object.keys(result.node.data.value).length} keys}`;
          rawVal = JSON.stringify(result.node.data.value, null, 2);
        } else {
          valStr = JSON.stringify(result.node.data.value);
          rawVal = result.node.data.value;
        }
      }
      setSearchMsg(
        <span>
          Found: <b>{result.path.join(" > ")}</b>
          {valStr !== "" && (
            <>
              <br />
              Value: <b style={{ color: colors.accent }}>{valStr}</b>
            </>
          )}
        </span>
      );
      setSelectedValue(valStr);
      setRawSelectedValue(rawVal);
      setCopied(false);
    } else {
      setSearchResultPath([]);
      setSelectedValue("");
      setRawSelectedValue("");
      setCopied(false);
      setSearchMsg(`Not found: "${searchField}"`);
    }
  }

  function deepReplace(obj, findStr, replaceStr) {
    let count = 0;
    function recurse(node) {
      if (typeof node === "string" && node === findStr) {
        count++;
        return replaceStr;
      } else if (typeof node === "object" && node !== null) {
        if (Array.isArray(node)) {
          return node.map(recurse);
        } else {
          const copy = {};
          for (const key in node) {
            if (node.hasOwnProperty(key)) {
              copy[key] = recurse(node[key]);
            }
          }
          return copy;
        }
      } else {
        return node;
      }
    }
    const newJson = recurse(obj);
    return { newJson, count };
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

  const allFields = Array.from(getAllFieldNames(jsonData || {})).sort();
  const filteredSuggestions = allFields.filter(f =>
    f.toLowerCase().includes(filterInput.toLowerCase())
  );

  function handleCopy() {
    if (rawSelectedValue !== undefined && rawSelectedValue !== null) {
      navigator.clipboard.writeText(typeof rawSelectedValue === "string" ? rawSelectedValue : String(rawSelectedValue));
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
        {/* COPY JSON and THEME ICON SWITCH */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button
            onClick={handleCopyJson}
            style={{
              fontFamily: "monospace",
              background: colors.secondary,
              color: colors.background,
              border: "none",
              borderRadius: "7px",
              fontWeight: "bold",
              padding: "6px 18px",
              fontSize: 13,
              cursor: "pointer",
              transition: "background 0.15s"
            }}
            title="Copy entire JSON to clipboard"
          >
            {copyJsonState}
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              width: 40,
              height: 40,
              background: colors.primary,
              border: "none",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: theme === "light" ? "0 2px 8px #aaa" : undefined
            }}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5.2" fill="#f5e206" stroke="#975809" strokeWidth="1.4"/>
                <g stroke="#f5e206" strokeWidth="2">
                  <line x1="12" y1="2" x2="12" y2="5"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="5" y2="12"/>
                  <line x1="19" y1="12" x2="22" y2="12"/>
                  <line x1="4.6" y1="4.6" x2="6.8" y2="6.8"/>
                  <line x1="19.4" y1="19.4" x2="17.2" y2="17.2"/>
                  <line x1="4.6" y1="19.4" x2="6.8" y2="17.2"/>
                  <line x1="19.4" y1="4.6" x2="17.2" y2="6.8"/>
                </g>
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M21 13.5
                    A9 9 0 1 1 13.5 3
                    A7 7 0 1 0 21 13.5Z"
                  fill="#f5e206"
                  stroke="#975809" strokeWidth="1.4"
                />
              </svg>
            )}
          </button>
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            color: colors.primary,
            marginBottom: 14,
            paddingBottom: 8,
            borderBottom: `1px solid ${colors.sidebarBorder}`,
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          JSON Visualizer
        </div>

        {/* --- SEARCH --- */}
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
        <div style={{
          width: "100%",
          marginBottom: 12,
        }}>
          <form onSubmit={handleSearch} style={{ display: "flex", width: "100%", gap: "6px" }}>
            <input
              type="text"
              placeholder="Search key..."
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
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
            >Go</button>
          </form>
          <div style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: searchResultPath.length > 0 ? colors.analyticsKey : colors.accent,
            marginTop: 8,
            wordBreak: "break-word",
            lineHeight: "1.3"
          }}>
            {searchMsg}
          </div>
        </div>
        {/* --- FILTERS --- */}
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
            <div style={{
              background: colors.filterPanel,
              border: `2px solid ${colors.accent}`,
              borderRadius: "6px",
              padding: "10px",
              marginBottom: 12
            }}>
              <input
                type="text"
                placeholder="Search fields..."
                value={filterInput}
                onChange={e => setFilterInput(e.target.value)}
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
              <div style={{
                maxHeight: "180px",
                overflowY: "auto",
                fontSize: 11,
              }}>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map(field => (
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
                      {excludedFields.has(field) ? "👁️ " : "○ "}{field}
                    </div>
                  ))
                ) : (
                  <div style={{ color: colors.accent, padding: "8px", fontSize: 10 }}>
                    No fields found
                  </div>
                )}
              </div>
              {excludedFields.size > 0 && (
                <>
                  <div style={{
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
                  }}>
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
        {/* --- PATH AND SELECTED VALUE --- */}
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
          {selectedPathArr.length
            ? (
              <>
                <div>
                  <b>Path:</b> {selectedPathArr.join(" > ").substring(0, 60)}{selectedPathArr.join(" > ").length > 60 && "..."}
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
                    <span style={{
                      color: colors.accent,
                      background: colors.sidebar,
                      borderRadius: "4px",
                      padding: "2px 6px",
                      fontFamily: "monospace",
                      fontWeight: 500,
                      fontSize: 15,
                      wordBreak: "break-all",
                      overflowWrap: "anywhere"
                    }}>
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
            )
            : <>Path: <span style={{color: colors.secondary}}>None</span></>
          }
        </div>
        {/* --- ANALYTICS --- */}
        <div style={{ width: '100%', marginTop: 8, marginBottom: 8 }}>
          <button
            onClick={() => setShowAnalyticsPanel((p) => !p)}
            style={{
              width: '100%',
              padding: '8px 0',
              background: colors.primary,
              color: colors.background,
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: showAnalyticsPanel ? 6 : 0,
              transition: 'background 0.2s'
            }}
          >
            {showAnalyticsPanel ? "Hide Analytics" : "Show Analytics"}
          </button>
          {showAnalyticsPanel && (
            <div style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: colors.analyticsText,
              background: colors.analyticsBg,
              borderRadius: '8px',
              border: `1.5px solid ${colors.sidebarBorder}`,
              padding: '14px 9px',
              margin: '0',
              width: '100%'
            }}>
              <div style={{fontWeight: 700, fontSize: 14, color: colors.analyticsLabel, marginBottom: 7}}>Analytics</div>
              <div><b>Nodes:</b> {analytics.nodeCount}</div>
              <div><b>Max Depth:</b> {analytics.maxDepth}</div>
              <div><b>Largest Array:</b> {analytics.largestArray.length ? `${analytics.largestArray.path} [${analytics.largestArray.length}]` : '-'}</div>
              <div><b>Largest Object:</b> {analytics.largestObject.keys ? `${analytics.largestObject.path} [${analytics.largestObject.keys} keys]` : '-'}</div>
              <div style={{marginTop: 7}}><b>Key Frequency:</b>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: colors.analyticsKey,
                  marginTop: 4,
                  maxHeight: 60,
                  overflowY: 'auto'
                }}>
                  {Object.entries(analytics.keyFrequency)
                    .sort((a,b) => b[1]-a[1])
                    .slice(0,10)
                    .map(([k,v]) => <div key={k}>{k}: {v}</div>)
                  }
                  {Object.keys(analytics.keyFrequency).length > 10 && <div>...</div>}
                </div>
              </div>
              <div style={{marginTop:7}}><b>Type Breakdown:</b>
                <div style={{fontSize:11, color:colors.analyticsKey}}>
                  {Object.entries(analytics.typeCounts).map(([k,v])=> (
                    <div key={k}>{k}: {v}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* --- ADVANCED FEATURES --- */}
        <div style={{ width: '100%', marginTop: 3 }}>
          <button
            onClick={() => setShowAdvanced(v => !v)}
            style={{
              width: '100%',
              padding: '9px 0',
              marginBottom: showAdvanced ? 6 : 0,
              background: colors.secondary,
              color: colors.background,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: 13,
              cursor: 'pointer',
              letterSpacing: 1,
              transition: 'background 0.2s'
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
              }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4, color: colors.analyticsKey, fontSize: 15 }}>Search & Replace</div>
              <form onSubmit={handleReplace} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <input
                  type="text"
                  value={findValue}
                  placeholder="Find value"
                  onChange={e => setFindValue(e.target.value)}
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
                  onChange={e => setReplaceValue(e.target.value)}
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
                <div style={{
                  color: lastReplaceCount > 0 ? colors.secondary : colors.accent,
                  fontSize: 12,
                  marginTop: 4,
                  minHeight: 20
                }}>{replaceMsg}</div>
              </form>
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          maxHeight: "92vh"
        }}
      >
        <svg
          ref={svgRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            borderRadius: "12px",
            background: colors.background,
            display: "block"
          }}
        >
          <g ref={gRef} />
        </svg>
      </div>
    </div>
  );
};

export default VisualizeScreen;

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import Minimap from "./Minimap";

const WIDTH = 3500;
const HEIGHT = 2500;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const VERTICAL_SPACING = 220;
const HORIZONTAL_SPACING = 380;
const TOP_MARGIN = 100;
const ARRAY_THRESHOLD = 5;

export default function VisualizationCanvas({
  colors,
  jsonData,
  expandedNodes,
  setExpandedNodes,
  excludedFields,
  highlightedNodePathChain,
  setHighlightedNodePathChain,
  setSelectedNodePath,
  setSelectedPathArr,
  setSelectedValue,
  setRawSelectedValue,
  setCopied,
  showMinimap,
  zoomBehaviorRef,
  zoomTransformRef,
  zoomTick,
  setZoomTick,
  searchResultPath,
  setSearchResultPath,
  setSearchMsg
}) {
  const svgRef = useRef();
  const gRef = useRef();
  const zoomInitialized = useRef(false);

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
        children: undefined
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
      children = childrenRaw.filter((c) => c !== null);
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
      nodePath: currentPath
    };
  }

  useEffect(() => {
    if (!jsonData) return;
    const rootObj = makeHierarchy(jsonData, "");
    if (!rootObj) return;
    const root = d3.hierarchy(rootObj);
    const treeLayout = d3.tree().nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING]);
    treeLayout(root);
    const nodes = root.descendants();
    const minX = d3.min(nodes, (d) => d.x);
    const verticalOffset = TOP_MARGIN - minX;
    const nodesNoRoot = nodes.slice(1);
    const linksNoRoot = root.links().filter((l) => l.source.depth !== 0);
    const g = d3.select(gRef.current);
    g.selectAll("*").remove();

    g.selectAll("path.link")
      .data(linksNoRoot)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y + NODE_WIDTH / 2)
          .y((d) => d.x + verticalOffset + NODE_HEIGHT / 2)
      )
      .attr("stroke", (d) =>
        highlightedNodePathChain.includes(d.target.data.nodePath) ? colors.linkActive : colors.link
      )
      .attr("stroke-width", (d) => (highlightedNodePathChain.includes(d.target.data.nodePath) ? 4 : 2))
      .attr("fill", "none")
      .attr("opacity", 0.8);

    const node = g
      .selectAll("g.node")
      .data(nodesNoRoot)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x + verticalOffset})`)
      .style("cursor", "pointer");

    node
      .append("rect")
      .attr("width", NODE_WIDTH)
      .attr("height", NODE_HEIGHT)
      .attr("x", 0)
      .attr("y", 0)
      .attr("rx", 13)
      .attr("fill", (d) =>
        highlightedNodePathChain.includes(d.data.nodePath)
          ? d.data.nodePath === highlightedNodePathChain[highlightedNodePathChain.length - 1]
            ? colors.highlightFill
            : colors.pathFill
          : d.data.isCollapsed
          ? colors.collapsedFill
          : colors.nodeBg
      )
      .attr("stroke", (d) =>
        highlightedNodePathChain.includes(d.data.nodePath)
          ? d.data.nodePath === highlightedNodePathChain[highlightedNodePathChain.length - 1]
            ? colors.highlightStroke
            : colors.pathStroke
          : d.data.isCollapsed
          ? colors.collapsedStroke
          : colors.nodeBorder
      )
      .attr("stroke-width", (d) => (highlightedNodePathChain.includes(d.data.nodePath) ? 4 : 2.5));

    node
      .append("text")
      .attr("x", 8)
      .attr("y", 28)
      .attr("font-size", 16)
      .attr("font-family", "monospace")
      .attr("fill", (d) =>
        highlightedNodePathChain.includes(d.data.nodePath) ? colors.highlightNodeText : colors.nodeText
      )
      .style("font-weight", 600)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .text((d) => {
        const name = String(d.data.name || "");
        if (d.data.isCollapsible && d.data.isCollapsed)
          return (name.length > 10 ? name.substring(0, 8) + "..." : name) + " [+]";
        return name.length > 15 ? name.substring(0, 12) + "..." : name;
      })
      .append("title")
      .text((d) => d.data.name || "");

    node
      .append("text")
      .attr("x", 8)
      .attr("y", 45)
      .attr("font-size", 12)
      .attr("fill", colors.secondary)
      .attr("font-family", "monospace")
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .text((d) => {
        let text = "";
        if (d.data.isCollapsed) {
          text = `[${d.data.length}] ⊕`;
        } else {
          text = d.data.children
            ? d.data.isArray
              ? `[${d.data.length}]`
              : `{${d.data.length}}`
            : JSON.stringify(d.data.value);
        }
        return text.length > 18 ? text.substring(0, 15) + "..." : text;
      })
      .append("title")
      .text((d) => {
        if (d.data.isCollapsed) {
          return `[${d.data.length} items] (Click to expand)`;
        }
        return d.data.children
          ? d.data.isArray
            ? `[${d.data.length} items]`
            : `{${d.data.length} keys}`
          : JSON.stringify(d.data.value);
      });

    const svg = d3.select(svgRef.current);
    svg.selectAll("rect.bg").remove();
    svg
      .insert("rect", ":first-child")
      .attr("class", "bg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .attr("fill", colors.background);

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        zoomTransformRef.current = event.transform;
        setZoomTick((t) => t + 1);
      });
    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);
    if (!zoomInitialized.current) {
      d3.select(svgRef.current).call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(500, 250).scale(0.8)
      );
      zoomTransformRef.current = d3.zoomTransform(svgRef.current);
      zoomInitialized.current = true;
    }

    g.selectAll("g.node").on("click", (event, d) => {
      // Clear search results when clicking a node
      if (setSearchResultPath) {
        setSearchResultPath([]);
      }
      if (setSearchMsg) {
        setSearchMsg("");
      }
      
      if (d.data.isCollapsible) {
        setExpandedNodes((prev) => {
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
      const nodePathChain = d
        .ancestors()
        .reverse()
        .map((a) => a.data.nodePath);
      setHighlightedNodePathChain(nodePathChain);

      const pathArr = d
        .ancestors()
        .reverse()
        .map((a) => a.data.name)
        .filter((name) => name !== "");
      setSelectedPathArr(pathArr);

      let valStr = "",
        rawVal = "";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonData, expandedNodes, excludedFields, highlightedNodePathChain, colors]);

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        maxHeight: "92vh",
        position: "relative"
      }}
    >
      {showMinimap && (
        <div style={{ position: "absolute", right: 14, top: 14, zIndex: 40 }}>
          <Minimap
            targetSvgRef={svgRef}
            targetGRef={gRef}
            zoomBehaviorRef={zoomBehaviorRef}
            zoomTransformRef={zoomTransformRef}
            zoomTick={zoomTick}
            width={220}
            height={140}
            padding={6}
            themeColors={colors}
          />
        </div>
      )}
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
  );
}

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

const VisualizeScreen = () => {
  const svgRef = useRef();
  const gRef = useRef();
  const zoomInitialized = useRef(false); // NEW!
  const { state } = useLocation();
  const jsonData = state?.jsonData;

  // State for path visualization & search
  const [selectedPath, setSelectedPath] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [searchResultPath, setSearchResultPath] = useState([]);
  const [searchMsg, setSearchMsg] = useState("");

  // --- helpers for hierarchy/tree ---
  function makeHierarchy(data, label = "") {
    return {
      name: label,
      children:
        typeof data === "object" && data !== null
          ? Array.isArray(data)
            ? data.map((v, i) => makeHierarchy(v, i.toString()))
            : Object.entries(data).map(([k, v]) => makeHierarchy(v, k))
          : undefined,
      value: typeof data === "object" && data !== null ? undefined : data,
      isArray: Array.isArray(data),
      type: typeof data,
      length: Array.isArray(data)
        ? data.length
        : typeof data === "object" && data !== null
          ? Object.keys(data).length
          : undefined,
    };
  }

  // Recursively search for node where .name === searchField, return path and node
  function searchTree(d3root, field) {
    let queue = [[d3root, []]];
    while (queue.length) {
      const [node, pathSoFar] = queue.shift();
      const myPath = [...pathSoFar, node.data.name];
      if (node.data.name === field)
        return { path: myPath.filter(x => x), node };
      if (node.children)
        for (let child of node.children)
          queue.push([child, myPath]);
    }
    return null;
  }

  // Effect ONLY runs when jsonData changes (NOT on highlight/path change)
  useEffect(() => {
    if (!jsonData) return;

    const rootObj = makeHierarchy(jsonData, "");
    const root = d3.hierarchy(rootObj);
    const treeLayout = d3.tree().nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING]);
    treeLayout(root);

    // full tree data
    const nodes = root.descendants();
    const minX = d3.min(nodes, d => d.x);
    const verticalOffset = TOP_MARGIN - minX;
    const nodesNoRoot = nodes.slice(1); // skip root node at index 0
    const linksNoRoot = root.links().filter(l => l.source.depth !== 0);

    // Select the <g> inside SVG and clear previous children
    const g = d3.select(gRef.current);
    g.selectAll("*").remove();

    // LINKS
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
      .attr("stroke", "#01C4D6")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("opacity", 0.8);

    // NODES
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
      .attr("fill", "#262d37")
      .attr("stroke", "#50e3c2")
      .attr("stroke-width", 2.5);

    node
      .append("text")
      .attr("x", 16)
      .attr("y", 28)
      .attr("font-size", 18)
      .attr("font-family", "monospace")
      .attr("fill", "#80ffea")
      .style("font-weight", 600)
      .text(d => d.data.name ? d.data.name : "");

    node
      .append("text")
      .attr("x", 16)
      .attr("y", 48)
      .attr("font-size", 14)
      .attr("fill", "#51e1fc")
      .attr("font-family", "monospace")
      .text(d =>
        d.data.children
          ? d.data.isArray
            ? `[${d.data.length} item${d.data.length !== 1 ? "s" : ""}]`
            : `{${d.data.length} key${d.data.length !== 1 ? "s" : ""}}`
          : JSON.stringify(d.data.value)
      );

    // Add black background
    const svg = d3.select(svgRef.current);
    svg.selectAll("rect.bg").remove();
    svg.insert("rect", ":first-child")
       .attr("class", "bg")
       .attr("width", WIDTH)
       .attr("height", HEIGHT)
       .attr("fill", "#181c24");

    // D3 Zoom/Pan behavior (Attaches handler every time)
    svg.call(
      d3.zoom()
        .scaleExtent([0.3, 2.5])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        })
    );

    // Initial zoom only ONCE per dataset
    if (!zoomInitialized.current) {
      svg.call(d3.zoom().transform, d3.zoomIdentity.translate(500, 250).scale(0.8));
      zoomInitialized.current = true;
    }

  }, [jsonData]); // Only on data change

  // Path highlight and interactivity: *separate* useEffect for highlight
  useEffect(() => {
    if (!jsonData) return;

    const rootObj = makeHierarchy(jsonData, "");
    const root = d3.hierarchy(rootObj);
    const nodes = root.descendants();
    const minX = d3.min(nodes, d => d.x);
    const verticalOffset = TOP_MARGIN - minX;
    const nodesNoRoot = nodes.slice(1);
    const linksNoRoot = root.links().filter(l => l.source.depth !== 0);

    // For highlighting: compute set of nodes in searchResultPath
    const highlightedNodes = new Set(searchResultPath);
    // Build set of edges to highlight (all ancestor pairs in the path)
    const highlightedEdges = new Set();
    if (searchResultPath.length > 1) {
      for (let i = 1; i < searchResultPath.length; ++i) {
        highlightedEdges.add(searchResultPath.slice(0, i + 1).join(" > "));
      }
    }

    // Update highlight state for LINKS
    const g = d3.select(gRef.current);
    g.selectAll("path.link")
      .attr("stroke", d => {
        let edgePath = [];
        let node = d.target;
        while (node.depth && node.data.name) {
          edgePath.unshift(node.data.name);
          node = node.parent;
        }
        if (highlightedEdges.has(edgePath.join(" > "))) {
          return "#FF00DD";
        }
        return "#01C4D6";
      })
      .attr("stroke-width", d => {
        let edgePath = [];
        let node = d.target;
        while (node.depth && node.data.name) {
          edgePath.unshift(node.data.name);
          node = node.parent;
        }
        if (highlightedEdges.has(edgePath.join(" > "))) {
          return 4;
        }
        return 2;
      });

    // Update highlight state for NODES
    g.selectAll("g.node").select("rect")
      .attr("fill", d => highlightedNodes.has(d.data.name) ? "#ff007f" : "#262d37")
      .attr("stroke", d => highlightedNodes.has(d.data.name) ? "#ffe600" : "#50e3c2")
      .attr("stroke-width", d => highlightedNodes.has(d.data.name) ? 5 : 2.5);

    g.selectAll("g.node").select("text")
      .attr("fill", d => highlightedNodes.has(d.data.name) ? "#ffe600" : "#80ffea");

    // Add click handler for node highlighting
    g.selectAll("g.node")
      .on("click", (event, d) => {
        const pathArr = d.ancestors()
          .reverse()
          .map(a => a.data.name)
          .filter(name => name !== "");
        setSelectedPath(pathArr);
        setSearchResultPath(pathArr); // highlight the selected path!
      });

  }, [jsonData, searchResultPath]); // Update on path change

  // -- Search logic --
  function handleSearch(e) {
    e.preventDefault();
    if (!searchField.trim()) {
      setSearchResultPath([]);
      setSearchMsg("Enter a field/key name to search.");
      return;
    }
    const rootObj = makeHierarchy(jsonData, "");
    const root = d3.hierarchy(rootObj);
    const result = searchTree(root, searchField.trim());
    if (result) {
      setSearchResultPath(result.path);
      // Show value if it is present in the final node
      let valStr = "";
      if ("value" in result.node.data) {
        if (
          typeof result.node.data.value === "object" &&
          result.node.data.value !== null
        ) {
          valStr =
            Array.isArray(result.node.data.value)
              ? `[${result.node.data.value.length} items]`
              : `{${Object.keys(result.node.data.value).length} keys}`;
        } else {
          valStr = JSON.stringify(result.node.data.value);
        }
      }
      setSearchMsg(
        <span>
          Found path: <b>{result.path.join(" > ")}</b>
          {valStr !== "" && (
            <>
              <br />
              Value:{" "}
              <b style={{ color: "#ff5959" }}>{valStr}</b>
            </>
          )}
        </span>
      );
    } else {
      setSearchResultPath([]);
      setSearchMsg(`No such field/key found: "${searchField}"`);
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "92vh",
        display: "flex",
        background: "#181c24",
        color: "#eee",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: "350px",
          minWidth: "250px",
          maxWidth: "450px",
          minHeight: "100%",
          background: "#232638",
          padding: "32px 22px",
          borderRight: "2.5px solid #232638",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 20,
            color: "#80ffea",
            marginBottom: 18,
            paddingBottom: 10,
            borderBottom: "1px solid #30334e",
            width: "100%"
          }}
        >
          Click any node to view its full path.
        </div>
        <div style={{
          width: "100%",
          marginBottom: 22,
        }}>
          <form onSubmit={handleSearch} style={{ display: "flex", width: "100%" }}>
            <input
              type="text"
              placeholder="Search for key/field"
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: 16,
                marginRight: "8px",
                border: "2px solid #30334e",
                color: "#fff",               
                background: "#232638"
              }}
            />
            <button
              type="submit"
              style={{
                background: "#80ffea",
                color: "#181c24",
                border: "none",
                borderRadius: "5px",
                padding: "8px 18px",
                fontFamily: "monospace",
                fontSize: 16,
                cursor: "pointer"
              }}
            >Search</button>
          </form>
          <div style={{
            fontFamily: "monospace",
            fontSize: 15,
            color: searchResultPath.length > 0 ? "#ffe600" : "#ff72fa",
            marginTop: 10,
            wordBreak: "break-all"
          }}>
            {searchMsg}
          </div>
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            color: "#FAFF00",
            wordBreak: "break-all",
            marginTop: 10,
            marginBottom: 10,
            width: "100%"
          }}
        >
          {selectedPath.length
            ? <>Path: <b>{selectedPath.join(" > ")}</b></>
            : <>Path: <span style={{color: "#51e2fc"}}>No node selected</span></>
          }
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
            background: "#181c24",
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


// add check of if more than 10 objects it enables manual expand,collapse
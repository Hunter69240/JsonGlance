import * as d3 from "d3";

export function searchTree(d3root, field, expandedNodes, excludedFields) {
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
    const isCollapsible = itemCount > 5; // ARRAY_THRESHOLD
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

  let queue = [[d3root, []]];
  while (queue.length) {
    const [node, pathSoFar] = queue.shift();
    const myPath = [...pathSoFar, node.data.name];
    if (node.data.name === field) return { path: myPath.filter((x) => x), node };
    if (node.children) for (let child of node.children) queue.push([child, myPath]);
  }
  return null;
}

export function handleSearchLogic(jsonData, searchField, expandedNodes, excludedFields) {
  if (!searchField.trim()) {
    return {
      searchResultPath: [],
      searchResultNodePathChain: [],
      searchMsg: "Enter a key name to search.",
      selectedValue: "",
      rawSelectedValue: ""
    };
  }

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
    const isCollapsible = itemCount > 5;
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

  const rootObj = makeHierarchy(jsonData, "");
  if (!rootObj) {
    return {
      searchResultPath: [],
      searchMsg: "No data available",
      selectedValue: "",
      rawSelectedValue: ""
    };
  }

  const root = d3.hierarchy(rootObj);
  const result = searchTree(root, searchField.trim(), expandedNodes, excludedFields);

  if (result) {
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

    // Get the node path chain for highlighting
    const nodePathChain = result.node.ancestors
      ? result.node.ancestors().reverse().map((a) => a.data.nodePath)
      : [];

    return {
      searchResultPath: result.path,
      searchResultNodePathChain: nodePathChain,
      searchMsg: `Found: ${result.path.join(" > ")}${valStr !== "" ? `\nValue: ${valStr}` : ""}`,
      searchFoundPath: result.path.join(" > "),
      searchFoundValue: valStr,
      selectedValue: valStr,
      rawSelectedValue: rawVal
    };
  } else {
    return {
      searchResultPath: [],
      searchResultNodePathChain: [],
      searchMsg: `Not found: "${searchField}"`,
      searchFoundPath: "",
      searchFoundValue: "",
      selectedValue: "",
      rawSelectedValue: ""
    };
  }
}

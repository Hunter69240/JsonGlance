// Utility functions for VisualizeScreen

export function getAnalytics(data, path = [], depth = 0, meta = null) {
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
      keys.forEach((k) => {
        meta.keyFrequency[k] = (meta.keyFrequency[k] || 0) + 1;
      });
    }
    meta.typeCounts[isArray ? "array" : "object"] =
      (meta.typeCounts[isArray ? "array" : "object"] || 0) + 1;
    for (let k in data) {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        getAnalytics(data[k], path.concat([k]), depth + 1, meta);
      }
    }
  } else {
    const t = typeof data;
    meta.typeCounts[t] = (meta.typeCounts[t] || 0) + 1;
  }
  return meta;
}

export function getAllFieldNames(data, fieldSet = new Set()) {
  if (typeof data !== "object" || data === null) return fieldSet;
  if (Array.isArray(data)) {
    data.forEach((item) => getAllFieldNames(item, fieldSet));
  } else {
    Object.keys(data).forEach((key) => {
      fieldSet.add(key);
      getAllFieldNames(data[key], fieldSet);
    });
  }
  return fieldSet;
}

export function deepReplace(obj, findStr, replaceStr) {
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
          if (Object.prototype.hasOwnProperty.call(node, key)) {
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

export const THEMES = {
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

import React, { useState } from "react";
import * as YAML from "js-yaml";
import Papa from "papaparse";
import { js2xml, xml2js } from "xml-js";

export default function FormatConverter({ colors, jsonData, setJsonData }) {
  const [showFormatConverter, setShowFormatConverter] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("json");
  const [convertedData, setConvertedData] = useState("");
  const [convertMsg, setConvertMsg] = useState("");
  const [formatCopied, setFormatCopied] = useState(false);

  const flattenForCSV = (data, prefix = "") => {
    if (!Array.isArray(data)) data = [data];
    const result = [];
    const flattenObject = (obj, pre = "") => {
      const flat = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const newKey = pre ? `${pre}_${key}` : key;
          if (value === null || value === undefined) {
            flat[newKey] = "";
          } else if (typeof value === "object" && !Array.isArray(value)) {
            Object.assign(flat, flattenObject(value, newKey));
          } else if (Array.isArray(value)) {
            flat[newKey] = JSON.stringify(value);
          } else {
            flat[newKey] = value;
          }
        }
      }
      return flat;
    };
    data.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        result.push(flattenObject(item));
      } else {
        result.push({ value: item });
      }
    });
    return result;
  };

  const formatConverters = {
    toYAML: (data) => YAML.dump(data, { indent: 2, lineWidth: -1 }),
    toXML: (data) => js2xml({ root: data }, { compact: false, spaces: 2 }),
    toCSV: (data) => {
      const flattenedData = flattenForCSV(data);
      return Papa.unparse(flattenedData);
    },
    toJSON: (data) => JSON.stringify(data, null, 2),
    fromYAML: (yamlStr) => YAML.load(yamlStr),
    fromXML: (xmlStr) => xml2js(xmlStr, { compact: true }).root,
    fromCSV: (csvStr) => {
      const parsed = Papa.parse(csvStr, { header: true });
      return parsed.data.filter((row) => Object.values(row).some((v) => v));
    },
    fromJSON: (jsonStr) => JSON.parse(jsonStr)
  };

  const handleFormatConversion = (targetFormat) => {
    try {
      setConvertMsg("");
      let output;
      if (targetFormat === "json") output = formatConverters.toJSON(jsonData);
      else if (targetFormat === "yaml") output = formatConverters.toYAML(jsonData);
      else if (targetFormat === "xml") output = formatConverters.toXML(jsonData);
      else if (targetFormat === "csv") output = formatConverters.toCSV(jsonData);
      setConvertedData(output);
      setSelectedFormat(targetFormat);
      setFormatCopied(false);
      setConvertMsg(`Successfully converted to ${targetFormat.toUpperCase()}`);
    } catch (e) {
      setConvertMsg(`Error: ${e.message}`);
      setConvertedData("");
    }
  };

  const handleFormatImport = (inputValue, fromFormat) => {
    try {
      setConvertMsg("");
      let parsedData;
      if (fromFormat === "json") parsedData = formatConverters.fromJSON(inputValue);
      else if (fromFormat === "yaml") parsedData = formatConverters.fromYAML(inputValue);
      else if (fromFormat === "xml") parsedData = formatConverters.fromXML(inputValue);
      else if (fromFormat === "csv") parsedData = formatConverters.fromCSV(inputValue);
      setJsonData(parsedData);
      setConvertMsg(`Successfully imported from ${fromFormat.toUpperCase()}`);
    } catch (e) {
      setConvertMsg(`Import error: ${e.message}`);
    }
  };

  const handleCopyFormat = () => {
    if (convertedData) {
      navigator.clipboard.writeText(convertedData);
      setFormatCopied(true);
      setTimeout(() => setFormatCopied(false), 1200);
    }
  };

  const handleDownloadFormat = () => {
    if (!convertedData) return;
    const element = document.createElement("a");
    const file = new Blob([convertedData], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `data.${selectedFormat}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ width: "100%", marginBottom: 12 }}>
      <button
        onClick={() => setShowFormatConverter(!showFormatConverter)}
        style={{
          width: "100%",
          padding: "8px 10px",
          background: colors.link,
          color: colors.background,
          border: "none",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: 8,
          transition: "background 0.2s"
        }}
      >
        {showFormatConverter ? "Hide" : "Show"} Format Converter
      </button>
      {showFormatConverter && (
        <div
          style={{
            background: colors.analyticsBg,
            border: `2px solid ${colors.link}`,
            borderRadius: "6px",
            padding: "10px",
            marginBottom: 12
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 8,
              color: colors.analyticsLabel,
              fontSize: 12
            }}
          >
            Convert To:
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              marginBottom: 10
            }}
          >
            {["json", "yaml", "xml", "csv"].map((format) => (
              <button
                key={format}
                onClick={() => handleFormatConversion(format)}
                style={{
                  padding: "6px 8px",
                  background: selectedFormat === format ? colors.primary : colors.sidebarBorder,
                  color: selectedFormat === format ? colors.background : colors.text,
                  border: `1px solid ${colors.primary}`,
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                  textTransform: "uppercase"
                }}
              >
                {format}
              </button>
            ))}
          </div>
          {convertedData && (
            <div
              style={{
                background: colors.sidebar,
                border: `1px solid ${colors.sidebarBorder}`,
                borderRadius: "4px",
                padding: "8px",
                maxHeight: "150px",
                overflowY: "auto",
                marginBottom: 8,
                fontSize: 10,
                fontFamily: "monospace",
                color: colors.analyticsText,
                wordBreak: "break-all",
                lineHeight: "1.3"
              }}
            >
              {convertedData.substring(0, 500)}
              {convertedData.length > 500 && "..."}
            </div>
          )}
          <div style={{ display: "flex", gap: "6px", marginBottom: 8 }}>
            <button
              onClick={handleCopyFormat}
              disabled={!convertedData}
              style={{
                flex: 1,
                padding: "6px",
                background: formatCopied ? colors.copyActive : colors.copyDefault,
                color: colors.background,
                border: "none",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: 10,
                cursor: convertedData ? "pointer" : "not-allowed",
                fontWeight: "bold",
                opacity: convertedData ? 1 : 0.5
              }}
            >
              {formatCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownloadFormat}
              disabled={!convertedData}
              style={{
                flex: 1,
                padding: "6px",
                background: colors.secondary,
                color: colors.background,
                border: "none",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: 10,
                cursor: convertedData ? "pointer" : "not-allowed",
                fontWeight: "bold",
                opacity: convertedData ? 1 : 0.5
              }}
            >
              Download
            </button>
          </div>
          <div
            style={{
              fontSize: 11,
              color: convertMsg.includes("Error") ? colors.accent : colors.analyticsKey,
              padding: "6px",
              background: colors.sidebar,
              borderRadius: "4px",
              minHeight: "20px",
              fontFamily: "monospace"
            }}
          >
            {convertMsg}
          </div>
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${colors.sidebarBorder}`
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 8,
                color: colors.analyticsLabel,
                fontSize: 12
              }}
            >
              Import From:
            </div>
            <textarea
              placeholder="Paste JSON, YAML, XML, or CSV here..."
              style={{
                width: "100%",
                height: "80px",
                padding: "6px",
                borderRadius: "4px",
                border: `1px solid ${colors.sidebarBorder}`,
                background: colors.sidebar,
                color: colors.text,
                fontFamily: "monospace",
                fontSize: 10,
                resize: "none",
                boxSizing: "border-box",
                marginBottom: 6
              }}
              id="format-input"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {["json", "yaml", "xml", "csv"].map((format) => (
                <button
                  key={`import-${format}`}
                  onClick={() => {
                    const textarea = document.getElementById("format-input");
                    handleFormatImport(textarea.value, format);
                  }}
                  style={{
                    padding: "6px 8px",
                    background: colors.accent,
                    color: colors.background,
                    border: "none",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: 10,
                    cursor: "pointer",
                    fontWeight: "bold",
                    textTransform: "uppercase"
                  }}
                >
                  Import {format}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

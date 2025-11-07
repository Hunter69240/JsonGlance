export async function handleExportImage(svgRef, gRef, format, setExportMsg) {
  try {
    setExportMsg("Generating image...");
    const svgElement = svgRef.current;
    const gElement = gRef.current;

    if (!svgElement || !gElement) {
      setExportMsg("Error: SVG not found");
      return;
    }

    let bbox;
    try {
      bbox = gElement.getBBox();
    } catch (err) {
      setExportMsg("Error: Unable to calculate bounds");
      console.warn("BBox calculation failed:", err);
      return;
    }

    if (!bbox || bbox.width === 0 || bbox.height === 0) {
      setExportMsg("Error: No content to export");
      return;
    }

    const clonedSvg = svgElement.cloneNode(true);
    const clonedG = clonedSvg.querySelector("g");
    if (clonedG) {
      clonedG.removeAttribute("transform");
    }

    const padding = 40;
    const width = bbox.width + padding * 2;
    const height = bbox.height + padding * 2;

    clonedSvg.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
    clonedSvg.setAttribute("width", width);
    clonedSvg.setAttribute("height", height);
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    if (format === "svg") {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jsonglance-visualization.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportMsg(`Successfully exported as SVG`);
      setTimeout(() => setExportMsg(""), 3000);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      if (format === "jpg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = `jsonglance-visualization.${format}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(downloadUrl);
              setExportMsg(`Successfully exported as ${format.toUpperCase()}`);
              setTimeout(() => setExportMsg(""), 3000);
            } else {
              setExportMsg("Error creating image file");
            }
          },
          `image/${format === "jpg" ? "jpeg" : format}`
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setExportMsg("Error rendering image");
      };

      img.src = url;
    }
  } catch (error) {
    setExportMsg(`Export error: ${error.message}`);
    setTimeout(() => setExportMsg(""), 3000);
  }
}

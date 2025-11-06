import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Minimap = ({ targetSvgRef, targetGRef, zoomBehaviorRef, zoomTransformRef, zoomTick, width = 220, height = 140, padding = 6, themeColors }) => {
  const miniRef = useRef();

  useEffect(() => {
    const miniSvg = d3.select(miniRef.current);
    miniSvg.selectAll("*").remove();
    if (!targetGRef?.current || !targetSvgRef?.current) return;

    try {
      const gNode = targetGRef.current;
      const bbox = gNode.getBBox();
      const contentW = bbox.width || 1;
      const contentH = bbox.height || 1;
      const sx = (width - 2 * padding) / contentW;
      const sy = (height - 2 * padding) / contentH;
      const scale = Math.min(sx, sy);

      // container
      miniSvg
        .attr("width", width)
        .attr("height", height)
        .style("background", themeColors?.sidebar || "#222")
        .style("borderRadius", "8px")
        .style("boxShadow", "0 2px 8px rgba(0,0,0,0.2)")
        .style("overflow", "hidden");

      const miniG = miniSvg.append("g");

      // clone nodes
      const clone = gNode.cloneNode(true);
      // wrap in a foreignObject-safe group by creating an svg group and appending cloned children
      const tmp = document.createElementNS("http://www.w3.org/2000/svg", "g");
      while (clone.childNodes && clone.childNodes.length) {
        tmp.appendChild(clone.childNodes[0]);
      }
      // append the cloned content to the d3 mini group
      miniG.node().appendChild(tmp);

      // transform to fit
      const tx = padding - bbox.x * scale;
      const ty = padding - bbox.y * scale;
      miniG.attr("transform", `translate(${tx},${ty}) scale(${scale})`);

      // draw viewport rectangle
      const transform = zoomTransformRef?.current || d3.zoomIdentity;
      const svgNode = targetSvgRef.current;
      const viewW = svgNode.clientWidth || svgNode.getBoundingClientRect().width || 800;
      const viewH = svgNode.clientHeight || svgNode.getBoundingClientRect().height || 600;

      const viewX0 = (-transform.x) / transform.k;
      const viewY0 = (-transform.y) / transform.k;
      const viewWc = viewW / transform.k;
      const viewHc = viewH / transform.k;

      const rectX = padding + (viewX0 - bbox.x) * scale;
      const rectY = padding + (viewY0 - bbox.y) * scale;
      const rectW = viewWc * scale;
      const rectH = viewHc * scale;

      miniSvg
        .append("rect")
        .attr("class", "viewport-rect")
        .attr("x", rectX)
        .attr("y", rectY)
        .attr("width", Math.max(2, rectW))
        .attr("height", Math.max(2, rectH))
        .attr("fill", "none")
        .attr("stroke", themeColors?.accent || "#ff6b9d")
        .attr("stroke-width", 2)
        .attr("rx", 3)
        .attr("pointer-events", "none");

      // click to center
      miniSvg.on("click", function (event) {
        const [mx, my] = d3.pointer(event);
        // convert mini coords -> content coords
        const contentX = bbox.x + (mx - padding) / scale;
        const contentY = bbox.y + (my - padding) / scale;

        // want contentX,contentY to be centered in viewer
        const k = transform.k || 1;
        const svgW = viewW;
        const svgH = viewH;

        const newX = -contentX * k + svgW / 2;
        const newY = -contentY * k + svgH / 2;

        if (zoomBehaviorRef && zoomBehaviorRef.current) {
          d3.select(targetSvgRef.current)
            .transition()
            .duration(350)
            .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(newX, newY).scale(k));
        } else {
          // fallback: set transform on g directly
          d3.select(targetGRef.current).attr("transform", `translate(${newX},${newY}) scale(${k})`);
        }
      });

    } catch (err) {
      // log to help debugging if something about bbox or cloning fails
      // keep it non-fatal for the visualizer
  console.warn("minimap update failed", err);
    }

    // cleanup handled by next render
  }, [targetGRef, targetSvgRef, zoomTick, themeColors, padding, width, height, zoomBehaviorRef, zoomTransformRef]);

  return (
    <svg
      ref={miniRef}
      style={{
        width: width,
        height: height,
        display: "block",
        cursor: "pointer",
        border: "1px solid rgba(0,0,0,0.12)",
        background: themeColors?.sidebar,
      }}
    />
  );
};

export default Minimap;

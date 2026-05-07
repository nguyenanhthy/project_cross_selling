"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ForceGraph2D = dynamic(() => import("react-force-graph").then((mod) => mod.ForceGraph2D), {
  ssr: false,
});

const getColor = (value, min, max) => {
  if (max === min) return "#8b5cf6";
  const ratio = (value - min) / (max - min);
  if (ratio > 0.66) return "#3b82f6";
  if (ratio > 0.33) return "#8b5cf6";
  return "#94a3b8";
};

export default function NetworkGraph({ data }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const pagerankValues = useMemo(
    () => data.nodes.map((node) => node.pagerank || 0),
    [data]
  );
  const minPage = Math.min(...pagerankValues, 0);
  const maxPage = Math.max(...pagerankValues, 1);

  return (
    <div className="card relative h-[520px] w-full overflow-hidden">
      {hoveredNode && (
        <div className="absolute left-4 top-4 z-10 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs text-slate-100 backdrop-blur">
          <div className="text-sm font-semibold text-white">
            {hoveredNode.id}
          </div>
          <div className="mt-2 space-y-1">
            <div>Degree: {hoveredNode.degree}</div>
            <div>PageRank: {hoveredNode.pagerank?.toFixed(4)}</div>
          </div>
        </div>
      )}
      <ForceGraph2D
        backgroundColor="#0a0f1e"
        graphData={data}
        nodeRelSize={4}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.fillText(label, node.x + 8, node.y + 4);
        }}
        nodeColor={(node) => getColor(node.pagerank || 0, minPage, maxPage)}
        nodeVal={(node) => Math.max(node.degree || 1, 1)}
        linkColor={(link) => (link.lift > 2 ? "#10b981" : "#f59e0b")}
        linkWidth={(link) => Math.max((link.lift || 1) / 2, 0.6)}
        onNodeHover={(node) => setHoveredNode(node)}
      />
    </div>
  );
}

import React, { useMemo } from "react";
import type { CanvasNode, CanvasViewState } from "./types";

interface MiniMapProps {
  nodes: CanvasNode[];
  viewState: CanvasViewState;
  canvasWidth: number;
  canvasHeight: number;
  onClickPosition: (canvasX: number, canvasY: number) => void;
}

const MINIMAP_W = 200;
const MINIMAP_H = 130;
const CANVAS_LOGICAL_W = 3000;
const CANVAS_LOGICAL_H = 2000;
const SCALE_X = MINIMAP_W / CANVAS_LOGICAL_W;
const SCALE_Y = MINIMAP_H / CANVAS_LOGICAL_H;

// Node accent colour mapping
const NODE_COLORS: Record<string, string> = {
  "image-asset": "#06b6d4",
  "http-request": "#f97316",
  "webhook": "#a855f7",
  "social-instagram": "#e1306c",
  "social-x": "#ffffff",
  "social-facebook": "#1877f2",
  "social-linkedin": "#0a66c2",
  "social-youtube": "#ff0000",
  "social-tiktok": "#00f2fe",
  "socials-aggregator": "#ec4899",
};

export const MiniMap: React.FC<MiniMapProps> = ({
  nodes,
  viewState,
  canvasWidth,
  canvasHeight,
  onClickPosition,
}) => {
  // Viewport rect in minimap coordinates
  const vpX = (-viewState.panX / viewState.zoom) * SCALE_X;
  const vpY = (-viewState.panY / viewState.zoom) * SCALE_Y;
  const vpW = (canvasWidth / viewState.zoom) * SCALE_X;
  const vpH = (canvasHeight / viewState.zoom) * SCALE_Y;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Convert minimap coords → canvas coords
    const canvasX = (mx / SCALE_X) * viewState.zoom - canvasWidth / 2;
    const canvasY = (my / SCALE_Y) * viewState.zoom - canvasHeight / 2;
    onClickPosition(canvasX, canvasY);
  };

  return (
    <div className="absolute bottom-14 right-4 z-30 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0c0f]/90 backdrop-blur-md shadow-2xl">
      <div className="px-2 pt-1.5 pb-0.5 flex items-center justify-between">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
          Mini-Map
        </span>
        <span className="text-[9px] font-mono text-zinc-600">
          {nodes.length} node{nodes.length !== 1 ? "s" : ""}
        </span>
      </div>
      <svg
        width={MINIMAP_W}
        height={MINIMAP_H}
        className="cursor-crosshair block"
        onClick={handleClick}
      >
        {/* Background */}
        <rect width={MINIMAP_W} height={MINIMAP_H} fill="#09090b" />

        {/* Dot grid hint */}
        <pattern id="mm-dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="#1a1a1e" />
        </pattern>
        <rect width={MINIMAP_W} height={MINIMAP_H} fill="url(#mm-dots)" />

        {/* Node silhouettes */}
        {nodes.map((node) => {
          const nx = node.position.x * SCALE_X;
          const ny = node.position.y * SCALE_Y;
          const color = NODE_COLORS[node.type] ?? "#71717a";
          return (
            <g key={node.id}>
              <rect
                x={nx}
                y={ny}
                width={26}
                height={16}
                rx={3}
                fill={color}
                fillOpacity={0.25}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.7}
              />
              {/* Tiny label */}
              <text
                x={nx + 3}
                y={ny + 10}
                fontSize={5}
                fill={color}
                fillOpacity={0.9}
                fontFamily="monospace"
              >
                {node.type.split("-").pop()?.slice(0, 6) ?? "node"}
              </text>
            </g>
          );
        })}

        {/* Viewport rect */}
        <rect
          x={Math.max(0, vpX)}
          y={Math.max(0, vpY)}
          width={Math.min(MINIMAP_W, vpW)}
          height={Math.min(MINIMAP_H, vpH)}
          fill="rgba(139,92,246,0.06)"
          stroke="rgba(139,92,246,0.5)"
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  );
};

import React from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Circle } from "lucide-react";
import type { CanvasNode, NodeType } from "./types";
import type { NodeStatus } from "./ExecutionEngine";
import { NODE_PORTS, arePortsCompatible } from "./ports";
import { NODE_REGISTRY, NODE_WIDTHS } from "./nodeRegistry";

// ── Connection drag state shared via context ──────────────────────────────────
export interface PendingConnection {
  sourceNodeId: string;
  sourcePortId: string;
  sourceType: "input" | "output";
  /** dataType of the source port */
  dataType: string;
  /** Canvas-space start coordinates */
  startX: number;
  startY: number;
}

interface HandleProps {
  nodeId: string;
  portId: string;
  portType: "input" | "output";
  dataType: string;
  color: string;
  label: string;
  yOffset: number;
  nodeWidth: number;
  nodeX: number;
  nodeY: number;
  pending: PendingConnection | null;
  onStartConnection: (p: PendingConnection) => void;
  onCompleteConnection: (targetNodeId: string, targetPortId: string) => void;
}

const Handle: React.FC<HandleProps> = ({
  nodeId,
  portId,
  portType,
  dataType,
  color,
  label,
  yOffset,
  nodeWidth,
  nodeX,
  nodeY,
  pending,
  onStartConnection,
  onCompleteConnection,
}) => {
  const isOutput = portType === "output";
  // Position: output on right edge, input on left edge
  const xPos = isOutput ? nodeWidth : 0;
  const canvasX = nodeX + xPos;
  const canvasY = nodeY + yOffset;

  // Can this handle accept the current pending connection?
  const canConnect =
    pending !== null &&
    pending.sourceNodeId !== nodeId &&
    pending.sourceType !== portType && // must be opposite direction
    arePortsCompatible(pending.dataType as any, dataType as any);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOutput) return; // only start drag from outputs
    e.stopPropagation();
    e.preventDefault();
    onStartConnection({
      sourceNodeId: nodeId,
      sourcePortId: portId,
      sourceType: "output",
      dataType,
      startX: canvasX,
      startY: canvasY,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!pending || !canConnect) return;
    e.stopPropagation();
    onCompleteConnection(nodeId, portId);
  };

  return (
    <div
      className="absolute flex items-center group/handle"
      style={{
        left: isOutput ? "100%" : undefined,
        right: isOutput ? undefined : "100%",
        top: yOffset,
        transform: "translateY(-50%)",
        [isOutput ? "flexDirection" : "flexDirection"]: isOutput ? "row" : "row-reverse",
        zIndex: 20,
      }}
      onMouseUp={handleMouseUp}
    >
      {/* Label (visible on hover) */}
      <span
        className={`px-1.5 py-0.5 text-[9px] font-mono rounded whitespace-nowrap opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none
          ${isOutput ? "mr-1.5" : "ml-1.5"}`}
        style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
      >
        {label}
      </span>

      {/* The handle dot */}
      <div
        onMouseDown={handleMouseDown}
        className={`relative flex items-center justify-center transition-all duration-150 select-none
          ${isOutput ? "cursor-crosshair" : canConnect ? "cursor-crosshair" : "cursor-default"}
          ${canConnect ? "scale-125" : ""}
        `}
        style={{ width: 16, height: 16 }}
      >
        {/* Outer ring (glow when hoverable) */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-150 ${
            canConnect ? "opacity-60 scale-150 animate-pulse" : "opacity-0 group-hover/handle:opacity-40"
          }`}
          style={{ background: color }}
        />
        {/* Handle body */}
        <div
          className={`w-3 h-3 rounded-full border-2 transition-all duration-150 z-10
            ${canConnect
              ? "scale-125"
              : "group-hover/handle:scale-110"
            }
          `}
          style={{
            borderColor: color,
            background: canConnect ? color : "#0e0e12",
            boxShadow: `0 0 8px ${color}${canConnect ? "cc" : "60"}`,
          }}
        />
      </div>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: NodeStatus }> = ({ status }) => {
  if (status === "idle") return null;
  return (
    <div className={`absolute -top-2.5 left-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border
      ${status === "running" ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse" : ""}
      ${status === "success" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : ""}
      ${status === "error"   ? "bg-red-500/20 border-red-500/40 text-red-300" : ""}
    `}>
      {status === "running" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
      {status === "success" && <CheckCircle2 className="w-2.5 h-2.5" />}
      {status === "error"   && <AlertCircle className="w-2.5 h-2.5" />}
      <span>{status.toUpperCase()}</span>
    </div>
  );
};

// ── Main NodeWrapper ──────────────────────────────────────────────────────────
interface NodeWrapperProps {
  node: CanvasNode;
  status: NodeStatus;
  isDragging: boolean;
  pending: PendingConnection | null;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onRemove: () => void;
  onStartConnection: (p: PendingConnection) => void;
  onCompleteConnection: (targetNodeId: string, targetPortId: string) => void;
  children: React.ReactNode;
}

export const NodeWrapper: React.FC<NodeWrapperProps> = ({
  node,
  status,
  isDragging,
  pending,
  onMouseDown,
  onDoubleClick,
  onRemove,
  onStartConnection,
  onCompleteConnection,
  children,
}) => {
  const ports = NODE_PORTS[node.type] ?? { inputs: [], outputs: [] };
  const nodeWidth = NODE_WIDTHS[node.type] ?? 240;
  const accentColor = NODE_REGISTRY[node.type]?.accentColor ?? "#71717a";

  const statusGlow =
    status === "running" ? `0 0 20px ${accentColor}88, 0 0 40px ${accentColor}44` :
    status === "success" ? "0 0 20px #10b98166" :
    status === "error"   ? "0 0 20px #ef444466"  :
    "";

  return (
    <div
      className="absolute select-none group/node"
      style={{
        left: node.position.x,
        top: node.position.y,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 100 : 10,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.();
      }}
    >
      {/* Status badge */}
      <StatusBadge status={status} />

      {/* Node content with status glow ring */}
      <div
        style={{
          boxShadow: statusGlow,
          borderRadius: "1rem",
          transition: "box-shadow 0.3s ease",
          animation: status === "running" ? "nodePulse 1.2s ease-in-out infinite" : undefined,
        }}
      >
        {children}
      </div>

      {/* Delete button (top-right, visible on hover) */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="absolute -top-2 -right-2 z-30 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-600 text-zinc-500
          hover:bg-red-500 hover:border-red-400 hover:text-white transition
          opacity-0 group-hover/node:opacity-100 flex items-center justify-center"
      >
        <X className="w-3 h-3" />
      </button>

      {/* ── Input Handles (left side) ── */}
      {ports.inputs.map((port) => (
        <Handle
          key={`in-${port.id}`}
          nodeId={node.id}
          portId={port.id}
          portType="input"
          dataType={port.dataType}
          color={port.color}
          label={port.label}
          yOffset={port.yOffset}
          nodeWidth={nodeWidth}
          nodeX={node.position.x}
          nodeY={node.position.y}
          pending={pending}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
        />
      ))}

      {/* ── Output Handles (right side) ── */}
      {ports.outputs.map((port) => (
        <Handle
          key={`out-${port.id}`}
          nodeId={node.id}
          portId={port.id}
          portType="output"
          dataType={port.dataType}
          color={port.color}
          label={port.label}
          yOffset={port.yOffset}
          nodeWidth={nodeWidth}
          nodeX={node.position.x}
          nodeY={node.position.y}
          pending={pending}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
        />
      ))}
    </div>
  );
};

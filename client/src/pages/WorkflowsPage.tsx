import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import {
  Workflow,
  Play,
  Plus,
  Send,
  ChevronDown,
  X as XIcon,
  Trash2,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

// ── Canvas engine ─────────────────────────────────────────────────────────────
import { useCanvasEngine } from "@/components/workflow/useCanvasEngine";
import { CanvasControls } from "@/components/workflow/CanvasControls";
import { MiniMap } from "@/components/workflow/MiniMap";

// ── Node UI components ────────────────────────────────────────────────────────
import { CompactNodeCard } from "@/components/workflow/CompactNodeCard";
import { NodeConfigDrawer } from "@/components/workflow/NodeConfigDrawer";

// ── Workflow engine ───────────────────────────────────────────────────────────
import { NodeWrapper, type PendingConnection } from "@/components/workflow/NodeWrapper";
import { ExecutionLog } from "@/components/workflow/ExecutionLog";
import { runPipeline, type NodeStatus, type LogEntry } from "@/components/workflow/ExecutionEngine";
import { NODE_PORTS, arePortsCompatible } from "@/components/workflow/ports";
import { NODE_REGISTRY, NODE_CATEGORIES, NODE_WIDTHS } from "@/components/workflow/nodeRegistry";

// ── Types ─────────────────────────────────────────────────────────────────────
import type {
  CanvasNode,
  NodeEdge,
  NodeType,
  WorkflowImageItem,
  HttpNodeData,
  WebhookNodeData,
  SocialAccountNodeData,
  SocialsAggregatorData,
  ImageAssetNodeData,
  PortDataType,
} from "@/components/workflow/types";
import { useCreateSocialPostMutation } from "@/store/socialSlice";
import { useGenerateImageMutation, useGenerateTextMutation, useGetAvailableModelsQuery } from "@/store/authSlice";

// ─── Wire colours ─────────────────────────────────────────────────────────────
const WIRE_COLORS: Record<string, string> = {
  image: "#06b6d4",
  json: "#a855f7",
  "http-response": "#f97316",
  "webhook-payload": "#a855f7",
  any: "#71717a",
};

// ─── LocalStorage keys & defaults ─────────────────────────────────────────────
const STORAGE_KEY_NODES = "nova_workflow_nodes_v3";
const STORAGE_KEY_EDGES = "nova_workflow_edges_v3";

const loadSavedNodes = (): CanvasNode[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NODES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const loadSavedEdges = (): NodeEdge[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EDGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const PORT_Y_OFFSET = 32; // vertically centered in 64px compact card

// ─────────────────────────────────────────────────────────────────────────────
export default function WorkflowsPage() {
  // ── Sync backend models dynamically ─────────────────────────────────────────
  useGetAvailableModelsQuery();

  // ── Canvas engine (zoom/pan) ───────────────────────────────────────────────
  const engine = useCanvasEngine();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperSize, setWrapperSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setWrapperSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Node / edge state ──────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<CanvasNode[]>(loadSavedNodes);
  const [edges, setEdges] = useState<NodeEdge[]>(loadSavedEdges);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});

  // Persist user nodes & edges to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
    } catch {}
  }, [nodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));
    } catch {}
  }, [edges]);

  // ── Execution log ──────────────────────────────────────────────────────────
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "ts">) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setLogs((prev) => [
      ...prev.slice(-200), // keep last 200
      { ...entry, id: `log-${Date.now()}-${Math.random()}`, ts },
    ]);
  }, []);

  // ── Node dragging ──────────────────────────────────────────────────────────
  const nodeDragRef = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
  } | null>(null);

  // ── Connection drag state ──────────────────────────────────────────────────
  const [pendingConn, setPendingConn] = useState<PendingConnection | null>(null);
  const [mouseCanvas, setMouseCanvas] = useState({ x: 0, y: 0 });

  // ── Add Node dropdown ──────────────────────────────────────────────────────
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Close add menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    window.addEventListener("mousedown", handler, true);
    return () => window.removeEventListener("mousedown", handler, true);
  }, [showAddMenu]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const selectedImage: WorkflowImageItem | null = useMemo(() => {
    const n = nodes.find((n) => n.type === "image-asset");
    return n ? (n.data as ImageAssetNodeData).selectedImage : null;
  }, [nodes]);

  // ── Configuration Drawer state ────────────────────────────────────────────
  const [activeConfigNodeId, setActiveConfigNodeId] = useState<string | null>(null);
  const activeConfigNode = useMemo(
    () => nodes.find((n) => n.id === activeConfigNodeId) || null,
    [nodes, activeConfigNodeId]
  );

  // ── Update helpers ─────────────────────────────────────────────────────────
  const updateNodeData = useCallback(<T extends CanvasNode["data"]>(id: string, patch: Partial<T>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    );
  }, []);

  const updateNodeLabel = useCallback((id: string, label: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, label } : n))
    );
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.sourceNodeId !== id && e.targetNodeId !== id));
    setNodeStatuses((prev) => { const s = { ...prev }; delete s[id]; return s; });
    setActiveConfigNodeId((curr) => (curr === id ? null : curr));
  }, []);

  // ── Add Node ───────────────────────────────────────────────────────────────
  const addNode = useCallback((type: NodeType) => {
    const entry = NODE_REGISTRY[type];
    // Spawn near center of current viewport in canvas coords
    const centerX = (wrapperSize.w / 2 - engine.viewState.panX) / engine.viewState.zoom;
    const centerY = (wrapperSize.h / 2 - engine.viewState.panY) / engine.viewState.zoom;
    const jitter = () => (Math.random() - 0.5) * 80;
    const newNode: CanvasNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.max(20, centerX + jitter()), y: Math.max(20, centerY + jitter()) },
      data: entry.defaultData(),
    };
    setNodes((prev) => [...prev, newNode]);
    setShowAddMenu(false);
    toast.success(`${entry.label} added to canvas`);
  }, [engine.viewState, wrapperSize]);

  // ── Connection system ──────────────────────────────────────────────────────
  const handleStartConnection = useCallback((p: PendingConnection) => {
    setPendingConn(p);
  }, []);

  const handleCompleteConnection = useCallback((targetNodeId: string, targetPortId: string) => {
    if (!pendingConn) return;
    if (pendingConn.sourceNodeId === targetNodeId) {
      toast.error("Cannot connect a node to itself");
      setPendingConn(null);
      return;
    }
    // Check port compatibility
    const tgtPorts = NODE_PORTS[nodes.find((n) => n.id === targetNodeId)?.type ?? "image-asset"];
    const tgtPort = tgtPorts?.inputs.find((p) => p.id === targetPortId);
    if (tgtPort && !arePortsCompatible(pendingConn.dataType as PortDataType, tgtPort.dataType)) {
      toast.error(`Incompatible port types: ${pendingConn.dataType} → ${tgtPort.dataType}`);
      setPendingConn(null);
      return;
    }
    // Check for duplicate edge
    const exists = edges.some(
      (e) =>
        e.sourceNodeId === pendingConn.sourceNodeId &&
        e.sourcePort === pendingConn.sourcePortId &&
        e.targetNodeId === targetNodeId &&
        e.targetPort === targetPortId
    );
    if (exists) {
      setPendingConn(null);
      return;
    }
    const newEdge: NodeEdge = {
      id: `e-${Date.now()}`,
      sourceNodeId: pendingConn.sourceNodeId,
      sourcePort: pendingConn.sourcePortId,
      targetNodeId,
      targetPort: targetPortId,
      dataType: pendingConn.dataType as PortDataType,
      animated: false,
    };
    setEdges((prev) => [...prev, newEdge]);
    toast.success("Nodes connected!");
    setPendingConn(null);
  }, [pendingConn, edges, nodes]);

  // Delete selected edge with Delete key
  useEffect(() => {
    if (!selectedEdgeId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        setEdges((prev) => prev.filter((ed) => ed.id !== selectedEdgeId));
        setSelectedEdgeId(null);
        toast("Wire disconnected", { icon: "✂️" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedEdgeId]);

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const handleNodeMouseDown = (nodeId: string, nodePos: { x: number; y: number }, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest("a")) return;
    e.stopPropagation();
    nodeDragRef.current = {
      id: nodeId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: nodePos.x,
      startNodeY: nodePos.y,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Update canvas-space mouse position (for live wire preview)
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setMouseCanvas({
        x: (e.clientX - rect.left - engine.viewState.panX) / engine.viewState.zoom,
        y: (e.clientY - rect.top - engine.viewState.panY) / engine.viewState.zoom,
      });
    }
    // Node dragging
    if (nodeDragRef.current) {
      const drag = nodeDragRef.current;
      const dx = (e.clientX - drag.startMouseX) / engine.viewState.zoom;
      const dy = (e.clientY - drag.startMouseY) / engine.viewState.zoom;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === drag.id
            ? { ...n, position: { x: Math.max(0, drag.startNodeX + dx), y: Math.max(0, drag.startNodeY + dy) } }
            : n
        )
      );
      return;
    }
    engine.wrapperHandlers.onMouseMove(e);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (pendingConn) {
      // Dropped on empty canvas — cancel
      setPendingConn(null);
    }
    nodeDragRef.current = null;
    engine.wrapperHandlers.onMouseUp(e);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "svg" || target.tagName === "DIV") {
      setSelectedEdgeId(null);
    }
  };

  // ── Execute pipeline ───────────────────────────────────────────────────────
  const [createPost] = useCreateSocialPostMutation();
  const [generateImageApi] = useGenerateImageMutation();
  const [generateTextApi] = useGenerateTextMutation();
  const isRunningRef = useRef(false);

  const handleRunPipeline = async () => {
    if (isRunningRef.current || isRunning) return;
    isRunningRef.current = true;
    setIsRunning(true);
    // Reset all statuses
    setNodeStatuses({});
    setEdges((prev) => prev.map((e) => ({ ...e, animated: true })));
    addLog({ nodeId: "system", nodeLabel: "System", message: `Pipeline started — ${nodes.length} nodes`, level: "info" });

    try {
      await runPipeline(nodes, edges, {
        onNodeStatus: (id, status) => {
          setNodeStatuses((prev) => ({ ...prev, [id]: status }));
        },
        onLog: (entry) => addLog(entry),
        onPublishPost: async (payload) => {
          const isUuid = (val: any) =>
            typeof val === "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

          const res = await createPost({
            mediaUrl: payload.mediaUrl,
            mediaType: payload.mediaType || "image",
            caption: payload.caption || "Created with Nova AI Studio #NovaAI",
            targetPlatforms: payload.targetPlatforms,
            imageId: isUuid(payload.imageId) ? payload.imageId : null,
          }).unwrap();
          return res;
        },
        onGenerateImage: async (params) => {
          const res = await generateImageApi({
            prompt: params.prompt,
            style: params.style,
            aspectRatio: params.aspectRatio,
            model: params.model || "Flux Schnell",
            negativePrompt: params.negativePrompt,
          }).unwrap();
          return {
            url: res.url || res.image?.r2Url || res.image?.watermarkedR2Url,
            image: res.image,
          };
        },
        onGenerateText: async (params) => {
          const res = await generateTextApi({
            prompt: params.prompt,
            model: params.model,
          }).unwrap();
          return { text: res.text };
        },
        onComplete: () => {
          addLog({ nodeId: "system", nodeLabel: "System", message: "Pipeline execution complete ✓", level: "success" });
          toast.success("Pipeline executed successfully!");
        },
      });
    } catch (err: any) {
      addLog({ nodeId: "system", nodeLabel: "System", message: `Fatal: ${err?.message}`, level: "error" });
    } finally {
      isRunningRef.current = false;
      setIsRunning(false);
      setTimeout(() => {
        setEdges((prev) => prev.map((e) => ({ ...e, animated: false })));
      }, 1500);
    }
  };

  // ── Wire geometry ──────────────────────────────────────────────────────────
  const getWirePath = (sx: number, sy: number, tx: number, ty: number) => {
    const tension = Math.max(80, Math.abs(tx - sx) * 0.5);
    return `M ${sx} ${sy} C ${sx + tension} ${sy}, ${tx - tension} ${ty}, ${tx} ${ty}`;
  };

  const getEdgeEndpoints = (edge: NodeEdge) => {
    const src = nodes.find((n) => n.id === edge.sourceNodeId);
    const tgt = nodes.find((n) => n.id === edge.targetNodeId);
    if (!src || !tgt) return null;
    const srcW = NODE_WIDTHS[src.type] ?? 320;
    // Find the actual port Y offsets
    const srcPorts = NODE_PORTS[src.type];
    const tgtPorts = NODE_PORTS[tgt.type];
    const srcPort = srcPorts?.outputs.find((p) => p.id === edge.sourcePort);
    const tgtPort = tgtPorts?.inputs.find((p) => p.id === edge.targetPort);
    const sy = src.position.y + (srcPort?.yOffset ?? PORT_Y_OFFSET);
    const ty = tgt.position.y + (tgtPort?.yOffset ?? PORT_Y_OFFSET);
    return {
      sx: src.position.x + srcW,
      sy,
      tx: tgt.position.x,
      ty,
      color: WIRE_COLORS[edge.dataType] ?? WIRE_COLORS.any,
    };
  };

  // Live wire from pending connection to mouse
  const pendingWirePath = useMemo(() => {
    if (!pendingConn) return null;
    const srcNode = nodes.find((n) => n.id === pendingConn.sourceNodeId);
    if (!srcNode) return null;
    const srcW = NODE_WIDTHS[srcNode.type] ?? 320;
    const srcPorts = NODE_PORTS[srcNode.type];
    const srcPort = srcPorts?.outputs.find((p) => p.id === pendingConn.sourcePortId);
    const sy = srcNode.position.y + (srcPort?.yOffset ?? PORT_Y_OFFSET);
    const sx = srcNode.position.x + srcW;
    return { sx, sy, tx: mouseCanvas.x, ty: mouseCanvas.y, color: WIRE_COLORS[pendingConn.dataType] ?? "#71717a" };
  }, [pendingConn, nodes, mouseCanvas]);

  const activeSocialCount = useMemo(() => {
    const agg = nodes.find((n) => n.type === "socials-aggregator");
    return agg ? Object.values((agg.data as SocialsAggregatorData).targets).filter(Boolean).length : 0;
  }, [nodes]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AppShell title="Node Workflows" subtitleBadge="[ WORKFLOW ENGINE ]" noPadding>
      <div className="h-[calc(100vh-56px)] w-full flex flex-col bg-[#0e0e12]">

        {/* ── Top Bar ───────────────────────────────────────────────────── */}
        <div className="h-12 border-b border-white/[0.07] bg-[#0c0c0f] px-3 flex items-center justify-between gap-2 z-30 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Workflow className="h-4 w-4 text-pink-400 flex-shrink-0" />
            <span className="text-xs font-bold text-white hidden sm:block whitespace-nowrap">Social Distribution</span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-amber-400 animate-ping" : "bg-pink-400"}`} />
              {nodes.length} nodes · {edges.length} wires
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* ── Add Node dropdown ── */}
            <div className="relative" ref={addMenuRef}>
              <button
                type="button"
                onClick={() => setShowAddMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/[0.07] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Node</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAddMenu ? "rotate-180" : ""}`} />
              </button>

              {showAddMenu && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-[#111115] border border-white/[0.08] rounded-xl shadow-2xl z-[200] overflow-hidden">
                  <div className="p-2 border-b border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Add Node to Canvas</span>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.stopPropagation(); setShowAddMenu(false); }}
                      className="p-0.5 text-zinc-600 hover:text-zinc-300 rounded"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2 space-y-3 max-h-80 overflow-y-auto">
                    {(["source", "trigger", "control", "transform", "destination"] as const).map((cat) =>
                      NODE_CATEGORIES[cat].length > 0 && (
                        <div key={cat}>
                          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider px-1.5 mb-1 select-none">{cat}</div>
                          <div className="space-y-0.5">
                            {NODE_CATEGORIES[cat].map((entry) => (
                              <button
                                key={entry.type}
                                type="button"
                                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); addNode(entry.type); }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-left transition group/item cursor-pointer"
                              >
                                <div
                                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                                  style={{ background: `${entry.accentColor}20`, border: `1px solid ${entry.accentColor}40` }}
                                >
                                  <div className="w-2 h-2 rounded-full" style={{ background: entry.accentColor }} />
                                </div>
                                <div>
                                  <div className="text-xs text-zinc-200 group-hover/item:text-white font-medium">{entry.label}</div>
                                  <div className="text-[9px] text-zinc-600 line-clamp-1">{entry.description}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Clear all nodes / canvas ── */}
            {nodes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setNodes([]);
                  setEdges([]);
                  localStorage.removeItem(STORAGE_KEY_NODES);
                  localStorage.removeItem(STORAGE_KEY_EDGES);
                  toast("Canvas cleared", { icon: "🧹" });
                }}
                title="Clear all nodes and connections"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/15 text-zinc-400 hover:text-red-400 border border-white/[0.07] transition text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Canvas</span>
              </button>
            )}

            {/* ── Clear all edges ── */}
            {edges.length > 0 && (
              <button
                type="button"
                onClick={() => { setEdges([]); toast("All wires cleared", { icon: "✂️" }); }}
                title="Clear all connections"
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/15 text-zinc-500 hover:text-red-400 border border-white/[0.07] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* ── Run Pipeline ── */}
            <button
              type="button"
              onClick={handleRunPipeline}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition disabled:opacity-50 shadow-[0_0_12px_rgba(124,58,237,0.35)]"
            >
              {isRunning
                ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Running…</span></>
                : <><Play className="w-3.5 h-3.5 fill-current" /><span>Run</span></>
              }
            </button>

            {/* ── Publish ── */}
            <button
              type="button"
              onClick={handleRunPipeline}
              disabled={isPublishing || !selectedImage || activeSocialCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold transition shadow-[0_0_14px_rgba(236,72,153,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publish</span>
            </button>
          </div>
        </div>

        {/* ── Canvas ────────────────────────────────────────────────────── */}
        <div
          ref={(el) => {
            (wrapperRef as any).current = el;
            (engine.canvasRef as any).current = el;
          }}
          className="flex-1 relative overflow-hidden bg-[#0e0e12]"
          style={{
            backgroundImage: "radial-gradient(#1c1c21 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            cursor: pendingConn ? "crosshair" : "default",
          }}
          onMouseDown={engine.wrapperHandlers.onMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={engine.wrapperHandlers.onWheel}
          onContextMenu={engine.wrapperHandlers.onContextMenu}
          onClick={handleCanvasClick}
        >
          {/* ── Transformed canvas layer ── */}
          <div style={{ transform: engine.canvasTransform, transformOrigin: "0 0", position: "absolute", inset: 0 }}>

            {/* ── SVG wire layer ── */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: 6000, height: 4000, overflow: "visible", zIndex: 1 }}
            >
              <defs>
                {Object.entries(WIRE_COLORS).map(([type, color]) => (
                  <React.Fragment key={type}>
                    <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                    </linearGradient>
                    <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </React.Fragment>
                ))}
                {/* Live wire gradient */}
                <linearGradient id="grad-live" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* ── Existing edges ── */}
              {edges.map((edge) => {
                const ep = getEdgeEndpoints(edge);
                if (!ep) return null;
                const { sx, sy, tx, ty, color } = ep;
                const path = getWirePath(sx, sy, tx, ty);
                const isSelected = selectedEdgeId === edge.id;
                const gradId = `grad-${edge.dataType}`;

                return (
                  <g
                    key={edge.id}
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(isSelected ? null : edge.id); }}
                  >
                    {/* Wide invisible hit area */}
                    <path d={path} fill="none" stroke="transparent" strokeWidth={18} />
                    {/* Glow halo */}
                    <path d={path} fill="none" stroke={color} strokeWidth={isSelected ? 10 : 6} strokeOpacity={isSelected ? 0.15 : 0.07} filter={`url(#glow-${edge.dataType})`} />
                    {/* Main wire */}
                    <path
                      d={path} fill="none"
                      stroke={isSelected ? color : `url(#${gradId})`}
                      strokeWidth={isSelected ? 2.5 : 2}
                      strokeDasharray={edge.animated ? "8 4" : undefined}
                      strokeLinecap="round"
                    />
                    {/* Port dots */}
                    <circle cx={sx} cy={sy} r={6} fill={color} opacity={0.25} />
                    <circle cx={sx} cy={sy} r={4} fill="#0e0e12" stroke={color} strokeWidth={2} />
                    <circle cx={sx} cy={sy} r={2} fill={color} />
                    <circle cx={tx} cy={ty} r={6} fill={color} opacity={0.25} />
                    <circle cx={tx} cy={ty} r={4} fill="#0e0e12" stroke={color} strokeWidth={2} />
                    <circle cx={tx} cy={ty} r={2} fill={color} opacity={0.8} />

                    {/* Delete hint on selection */}
                    {isSelected && (
                      <text
                        x={(sx + tx) / 2}
                        y={(sy + ty) / 2 - 10}
                        textAnchor="middle"
                        fontSize={9}
                        fill={color}
                        opacity={0.8}
                        fontFamily="monospace"
                      >
                        Press Delete to disconnect
                      </text>
                    )}
                  </g>
                );
              })}

              {/* ── Live pending wire (during drag) ── */}
              {pendingWirePath && (() => {
                const { sx, sy, tx, ty, color } = pendingWirePath;
                const path = getWirePath(sx, sy, tx, ty);
                return (
                  <g className="pointer-events-none">
                    <path d={path} fill="none" stroke={color} strokeWidth={8} strokeOpacity={0.08} filter={`url(#glow-image)`} />
                    <path d={path} fill="none" stroke={color} strokeWidth={2} strokeDasharray="6 3" strokeLinecap="round" strokeOpacity={0.8} />
                    {/* Animated target dot at cursor */}
                    <circle cx={tx} cy={ty} r={5} fill={color} opacity={0.6} />
                    <circle cx={tx} cy={ty} r={8} fill={color} opacity={0.15} className="animate-ping" />
                  </g>
                );
              })()}
            </svg>

            {/* ── Node cards ── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
              {nodes.map((node) => {
                const status = nodeStatuses[node.id] ?? "idle";
                const isDragging = nodeDragRef.current?.id === node.id;

                return (
                  <NodeWrapper
                    key={node.id}
                    node={node}
                    status={status}
                    isDragging={isDragging}
                    pending={pendingConn}
                    onMouseDown={(e) => handleNodeMouseDown(node.id, node.position, e)}
                    onDoubleClick={() => setActiveConfigNodeId(node.id)}
                    onRemove={() => removeNode(node.id)}
                    onStartConnection={handleStartConnection}
                    onCompleteConnection={handleCompleteConnection}
                  >
                    <CompactNodeCard
                      node={node}
                      status={status}
                      isSelected={activeConfigNodeId === node.id}
                      onOpenConfig={() => setActiveConfigNodeId(node.id)}
                      onDelete={() => removeNode(node.id)}
                    />
                  </NodeWrapper>
                );
              })}
            </div>
          </div>

          {/* ── Empty Canvas State ── */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="flex flex-col items-center gap-3 p-7 rounded-2xl bg-zinc-950/85 border border-white/[0.08] backdrop-blur-md shadow-2xl max-w-sm text-center pointer-events-auto">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Clean Canvas Ready</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Build your custom workflow. Click <span className="text-violet-300 font-medium">+ Add Node</span> above to place your Image Library, Instagram, X, or other nodes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMenu(true)}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/35 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Node</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Canvas Controls (outside transform) ── */}
          <CanvasControls
            zoom={engine.viewState.zoom}
            showMiniMap={engine.viewState.showMiniMap}
            onZoomIn={engine.zoomIn}
            onZoomOut={engine.zoomOut}
            onReset={engine.resetZoom}
            onFitView={() => engine.fitView(nodes.length)}
            onToggleMiniMap={engine.toggleMiniMap}
          />

          {/* ── Mini-map ── */}
          {engine.viewState.showMiniMap && (
            <MiniMap
              nodes={nodes}
              viewState={engine.viewState}
              canvasWidth={wrapperSize.w}
              canvasHeight={wrapperSize.h}
              onClickPosition={() => engine.fitView(nodes.length)}
            />
          )}

          {/* ── Pending connection cancel hint ── */}
          {pendingConn && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[11px] font-mono px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-none">
              🔌 Drag to an input port — <kbd className="bg-white/10 px-1 rounded text-[10px]">Esc</kbd> to cancel
            </div>
          )}
        </div>

        {/* ── Node Configuration Drawer (Double-click or hover configure) ── */}
        <NodeConfigDrawer
          node={activeConfigNode}
          isOpen={!!activeConfigNodeId}
          onClose={() => setActiveConfigNodeId(null)}
          onUpdateData={updateNodeData}
          onUpdateLabel={updateNodeLabel}
          selectedPipelineImage={selectedImage}
        />

        {/* ── Execution Log panel ── */}
        <ExecutionLog
          logs={logs}
          isRunning={isRunning}
          onClear={() => setLogs([])}
        />

        {/* ── Status bar ── */}
        <div className="h-7 border-t border-white/[0.05] bg-[#0a0a0d] px-3 flex items-center justify-between text-[10px] text-zinc-600 font-mono flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className={isRunning ? "text-amber-400" : "text-emerald-500"}>
              {isRunning ? "⚙ Running pipeline…" : "✓ Ready"}
            </span>
            <span>{nodes.length} nodes</span>
            <span>{edges.length} connections</span>
            {pendingConn && <span className="text-violet-400">Connecting: {pendingConn.sourcePortId} →</span>}
            {selectedEdgeId && <span className="text-amber-400">Wire selected · Delete to remove</span>}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>Zoom {Math.round(engine.viewState.zoom * 100)}%</span>
            <span>Ctrl+Scroll = zoom · Space+Drag = pan · Click wire to select</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

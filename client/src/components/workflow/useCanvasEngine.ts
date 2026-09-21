import { useState, useRef, useCallback, useEffect } from "react";
import type { CanvasViewState, WorkflowPosition } from "./types";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;
const ZOOM_WHEEL_SENSITIVITY = 0.001;

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

export interface CanvasEngineAPI {
  viewState: CanvasViewState;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitView: (nodeCount: number) => void;
  toggleMiniMap: () => void;
  /** Returns CSS transform string for the canvas inner element */
  canvasTransform: string;
  /** Converts screen coords to canvas-space coords (accounts for pan/zoom) */
  screenToCanvas: (sx: number, sy: number) => WorkflowPosition;
  /** Handlers to spread on the outer wrapper div */
  wrapperHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
}

export function useCanvasEngine(): CanvasEngineAPI {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [viewState, setViewState] = useState<CanvasViewState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    showMiniMap: true,
  });

  // Pan state refs (avoid stale closures in events)
  const isPanning = useRef(false);
  const panMode = useRef<"middle" | "space" | "right" | null>(null);
  const panStart = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number }>({
    mouseX: 0,
    mouseY: 0,
    panX: 0,
    panY: 0,
  });
  const isSpaceDown = useRef(false);

  // Keyboard listeners for space-bar pan and shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpaceDown.current) {
        // Only activate if not typing inside an input/textarea
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
        e.preventDefault();
        isSpaceDown.current = true;
        if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      }
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        setViewState((v) => ({ ...v, zoom: 1, panX: 0, panY: 0 }));
      }
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setViewState((v) => ({ ...v, zoom: 0.75, panX: 40, panY: 40 }));
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpaceDown.current = false;
        if (canvasRef.current) canvasRef.current.style.cursor = "default";
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    setViewState((v) => ({ ...v, zoom: clampZoom(v.zoom + ZOOM_STEP) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewState((v) => ({ ...v, zoom: clampZoom(v.zoom - ZOOM_STEP) }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewState((v) => ({ ...v, zoom: 1, panX: 0, panY: 0 }));
  }, []);

  const fitView = useCallback((_nodeCount: number) => {
    setViewState((v) => ({ ...v, zoom: 0.75, panX: 60, panY: 60 }));
  }, []);

  const toggleMiniMap = useCallback(() => {
    setViewState((v) => ({ ...v, showMiniMap: !v.showMiniMap }));
  }, []);

  // ── Coordinate transform ──────────────────────────────────────────────────
  const screenToCanvas = useCallback(
    (sx: number, sy: number): WorkflowPosition => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: sx, y: sy };
      return {
        x: (sx - rect.left - viewState.panX) / viewState.zoom,
        y: (sy - rect.top - viewState.panY) / viewState.zoom,
      };
    },
    [viewState.panX, viewState.panY, viewState.zoom]
  );

  const canvasTransform = `translate(${viewState.panX}px, ${viewState.panY}px) scale(${viewState.zoom})`;

  // ── Mouse Handlers ────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle-click to pan
    if (e.button === 1) {
      e.preventDefault();
      isPanning.current = true;
      panMode.current = "middle";
      panStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: 0,
        panY: 0,
      };
      setViewState((v) => {
        panStart.current.panX = v.panX;
        panStart.current.panY = v.panY;
        return v;
      });
      return;
    }
    // Right-click to pan
    if (e.button === 2) {
      isPanning.current = true;
      panMode.current = "right";
      panStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: 0,
        panY: 0,
      };
      setViewState((v) => {
        panStart.current.panX = v.panX;
        panStart.current.panY = v.panY;
        return v;
      });
      return;
    }
    // Space + left-click to pan
    if (e.button === 0 && isSpaceDown.current) {
      isPanning.current = true;
      panMode.current = "space";
      panStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: 0,
        panY: 0,
      };
      setViewState((v) => {
        panStart.current.panX = v.panX;
        panStart.current.panY = v.panY;
        return v;
      });
    }
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.mouseX;
    const dy = e.clientY - panStart.current.mouseY;
    setViewState((v) => ({
      ...v,
      panX: panStart.current.panX + dx,
      panY: panStart.current.panY + dy,
    }));
  }, []);

  const onMouseUp = useCallback((_e: React.MouseEvent) => {
    isPanning.current = false;
    panMode.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Only zoom if Ctrl is held (or pinch gesture on trackpad)
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = -e.deltaY * ZOOM_WHEEL_SENSITIVITY;
    const rect = canvasRef.current?.getBoundingClientRect();
    const mouseX = rect ? e.clientX - rect.left : 0;
    const mouseY = rect ? e.clientY - rect.top : 0;

    setViewState((v) => {
      const newZoom = clampZoom(v.zoom + delta * v.zoom);
      const scale = newZoom / v.zoom;
      // Zoom toward mouse cursor
      const newPanX = mouseX - scale * (mouseX - v.panX);
      const newPanY = mouseY - scale * (mouseY - v.panY);
      return { ...v, zoom: newZoom, panX: newPanX, panY: newPanY };
    });
  }, []);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent context menu when right-click panning
    if (panMode.current === "right") {
      e.preventDefault();
    }
  }, []);

  return {
    viewState,
    canvasRef,
    zoomIn,
    zoomOut,
    resetZoom,
    fitView,
    toggleMiniMap,
    canvasTransform,
    screenToCanvas,
    wrapperHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onWheel,
      onContextMenu,
    },
  };
}

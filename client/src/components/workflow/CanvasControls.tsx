import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Map,
} from "lucide-react";

interface CanvasControlsProps {
  zoom: number;
  showMiniMap: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitView: () => void;
  onToggleMiniMap: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  zoom,
  showMiniMap,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitView,
  onToggleMiniMap,
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none select-none">
      {/* Keyboard shortcut hint */}
      <div className="text-[9px] font-mono text-zinc-600 pointer-events-none flex gap-3">
        <span>Ctrl+Scroll = zoom</span>
        <span>Space+Drag = pan</span>
        <span>Ctrl+0 = reset</span>
      </div>

      {/* Main controls row */}
      <div className="pointer-events-auto flex items-center gap-1 bg-[#0c0c0f]/90 border border-white/[0.08] rounded-xl px-2 py-1.5 backdrop-blur-md shadow-2xl">
        {/* Zoom out */}
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out (Ctrl+Scroll)"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom % readout + reset */}
        <button
          type="button"
          onClick={onReset}
          title="Reset Zoom (Ctrl+0)"
          className="min-w-[44px] h-7 px-2 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-zinc-300 hover:text-white transition text-[11px] font-mono font-semibold"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom in */}
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In (Ctrl+Scroll)"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* Fit View */}
        <button
          type="button"
          onClick={onFitView}
          title="Fit View (Ctrl+Shift+F)"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Reset Layout */}
        <button
          type="button"
          onClick={onReset}
          title="Reset to Default"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* MiniMap toggle */}
        <button
          type="button"
          onClick={onToggleMiniMap}
          title="Toggle Mini-Map"
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            showMiniMap
              ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
              : "hover:bg-white/[0.08] text-zinc-500 hover:text-white"
          }`}
        >
          <Map className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

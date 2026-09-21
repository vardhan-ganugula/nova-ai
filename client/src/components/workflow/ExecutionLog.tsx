import React, { useRef, useEffect } from "react";
import { Terminal, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { LogEntry } from "./ExecutionEngine";

const LEVEL_STYLES: Record<LogEntry["level"], { text: string; dot: string; prefix: string }> = {
  info:    { text: "text-zinc-300",    dot: "bg-zinc-500",   prefix: "→" },
  success: { text: "text-emerald-300", dot: "bg-emerald-400", prefix: "✓" },
  error:   { text: "text-red-300",     dot: "bg-red-400",    prefix: "✕" },
  data:    { text: "text-cyan-300",    dot: "bg-cyan-400",   prefix: "◆" },
};

interface ExecutionLogProps {
  logs: LogEntry[];
  isRunning: boolean;
  onClear: () => void;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs, isRunning, onClear }) => {
  const [expanded, setExpanded] = React.useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new log entries
  useEffect(() => {
    if (scrollRef.current && expanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, expanded]);

  const height = expanded ? "h-44" : "h-9";

  return (
    <div
      className={`flex-shrink-0 border-t border-white/[0.07] bg-[#09090b] transition-all duration-300 ${height} flex flex-col`}
    >
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-white/[0.05] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[11px] font-mono font-semibold text-zinc-300">Execution Log</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              RUNNING
            </span>
          )}
          {logs.length > 0 && (
            <span className="text-[9px] font-mono text-zinc-600 bg-white/[0.04] px-1.5 py-0.5 rounded-full border border-white/5">
              {logs.length} events
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {logs.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 hover:text-red-400 transition px-1.5 py-0.5 rounded hover:bg-red-500/10"
            >
              <Trash2 className="w-2.5 h-2.5" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log entries */}
      {expanded && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 font-mono text-[11px]"
        >
          {logs.length === 0 ? (
            <div className="flex items-center gap-2 text-zinc-700 py-2">
              <Terminal className="w-3 h-3" />
              <span>Run the pipeline to see execution logs here…</span>
            </div>
          ) : (
            logs.map((entry) => {
              const s = LEVEL_STYLES[entry.level];
              return (
                <div key={entry.id} className="flex items-start gap-2 py-0.5 group/log">
                  {/* Timestamp */}
                  <span className="text-zinc-700 flex-shrink-0 w-14">{entry.ts}</span>
                  {/* Level dot */}
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${s.dot}`} />
                  {/* Node label */}
                  <span className="text-zinc-500 flex-shrink-0 max-w-[100px] truncate" title={entry.nodeLabel}>
                    [{entry.nodeLabel}]
                  </span>
                  {/* Prefix icon */}
                  <span className={`flex-shrink-0 ${s.text}`}>{s.prefix}</span>
                  {/* Message */}
                  <span className={`flex-1 break-all ${s.text}`}>{entry.message}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import {
  Globe,
  Play,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code2,
} from "lucide-react";
import type { HttpNodeData } from "../types";

const METHOD_COLORS = {
  GET: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  POST: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  PUT: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  PATCH: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  DELETE: "bg-red-500/20 text-red-300 border-red-500/40",
} as const;

const STATUS_COLOR = (code: number | null) => {
  if (!code) return "text-zinc-500";
  if (code < 300) return "text-emerald-400";
  if (code < 400) return "text-amber-400";
  return "text-red-400";
};

interface HttpNodeProps {
  data: HttpNodeData;
  onChange: (patch: Partial<HttpNodeData>) => void;
  isExecuting?: boolean;
}

const METHODS: HttpNodeData["method"][] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const HttpNode: React.FC<HttpNodeProps> = ({ data, onChange, isExecuting = false }) => {
  const [showHeaders, setShowHeaders] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleExecute = async () => {
    onChange({ isExecuting: true, response: null, statusCode: null, latencyMs: null });
    const start = Date.now();
    // Simulated API call with mock response
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    const mockResponse = JSON.stringify(
      {
        success: true,
        data: {
          message: "Mock API response from Nova AI workflow engine",
          timestamp: new Date().toISOString(),
          endpoint: data.url || "/api/mock",
          method: data.method,
        },
        meta: { version: "v2", latency: "—" },
      },
      null,
      2
    );
    onChange({
      isExecuting: false,
      response: mockResponse,
      statusCode: 200,
      latencyMs: Date.now() - start,
    });
    setShowResponse(true);
  };

  const addHeader = () =>
    onChange({ headers: [...data.headers, { key: "", value: "" }] });
  const removeHeader = (i: number) =>
    onChange({ headers: data.headers.filter((_, idx) => idx !== i) });
  const setHeader = (i: number, field: "key" | "value", val: string) => {
    const next = [...data.headers];
    next[i] = { ...next[i], [field]: val };
    onChange({ headers: next });
  };

  const addParam = () =>
    onChange({ queryParams: [...data.queryParams, { key: "", value: "" }] });
  const removeParam = (i: number) =>
    onChange({ queryParams: data.queryParams.filter((_, idx) => idx !== i) });
  const setParam = (i: number, field: "key" | "value", val: string) => {
    const next = [...data.queryParams];
    next[i] = { ...next[i], [field]: val };
    onChange({ queryParams: next });
  };

  return (
    <div
      className={`w-[340px] rounded-2xl border bg-[#0f0f13]/95 backdrop-blur-md shadow-2xl transition-all duration-300 ${
        data.isExecuting
          ? "border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          : "border-orange-500/40 hover:border-orange-500/70"
      } p-4 space-y-3`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">HTTP Request</h3>
            <p className="text-[10px] text-orange-400/80 font-mono">API REQUEST NODE</p>
          </div>
        </div>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20">
          TRIGGER
        </span>
      </div>

      {/* ── Method + URL ── */}
      <div className="space-y-2">
        {/* Method switcher */}
        <div className="flex gap-1 flex-wrap">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ method: m })}
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition ${
                data.method === m
                  ? METHOD_COLORS[m]
                  : "border-white/10 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={data.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://api.example.com/endpoint"
          className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 font-mono transition"
        />
      </div>

      {/* ── Headers (collapsible) ── */}
      <div className="rounded-lg border border-white/[0.06] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHeaders((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] text-[11px] font-mono text-zinc-400 transition"
        >
          <span>Headers ({data.headers.length})</span>
          {showHeaders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showHeaders && (
          <div className="p-2 space-y-1.5 bg-black/30">
            {data.headers.map((h, i) => (
              <div key={i} className="flex gap-1.5 items-center">
                <input
                  value={h.key}
                  onChange={(e) => setHeader(i, "key", e.target.value)}
                  placeholder="Key"
                  className="flex-1 bg-black/50 border border-white/[0.06] rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-orange-500/40 placeholder-zinc-700"
                />
                <input
                  value={h.value}
                  onChange={(e) => setHeader(i, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-black/50 border border-white/[0.06] rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-orange-500/40 placeholder-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(i)}
                  className="p-1 text-zinc-600 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addHeader}
              className="flex items-center gap-1 text-[10px] text-orange-400/80 hover:text-orange-300 font-mono transition"
            >
              <Plus className="w-3 h-3" /> Add Header
            </button>
          </div>
        )}
      </div>

      {/* ── Query Params (collapsible) ── */}
      <div className="rounded-lg border border-white/[0.06] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowParams((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] text-[11px] font-mono text-zinc-400 transition"
        >
          <span>Query Params ({data.queryParams.length})</span>
          {showParams ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showParams && (
          <div className="p-2 space-y-1.5 bg-black/30">
            {data.queryParams.map((p, i) => (
              <div key={i} className="flex gap-1.5 items-center">
                <input
                  value={p.key}
                  onChange={(e) => setParam(i, "key", e.target.value)}
                  placeholder="param"
                  className="flex-1 bg-black/50 border border-white/[0.06] rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-orange-500/40 placeholder-zinc-700"
                />
                <input
                  value={p.value}
                  onChange={(e) => setParam(i, "value", e.target.value)}
                  placeholder="value"
                  className="flex-1 bg-black/50 border border-white/[0.06] rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-orange-500/40 placeholder-zinc-700"
                />
                <button type="button" onClick={() => removeParam(i)} className="p-1 text-zinc-600 hover:text-red-400 transition">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addParam} className="flex items-center gap-1 text-[10px] text-orange-400/80 hover:text-orange-300 font-mono transition">
              <Plus className="w-3 h-3" /> Add Param
            </button>
          </div>
        )}
      </div>

      {/* ── Body (collapsible, hidden for GET) ── */}
      {data.method !== "GET" && (
        <div className="rounded-lg border border-white/[0.06] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowBody((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] text-[11px] font-mono text-zinc-400 transition"
          >
            <span className="flex items-center gap-1.5"><Code2 className="w-3 h-3" />Request Body (JSON)</span>
            {showBody ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showBody && (
            <div className="p-2 bg-black/30">
              <textarea
                rows={5}
                value={data.body}
                onChange={(e) => onChange({ body: e.target.value })}
                placeholder={'{\n  "key": "value"\n}'}
                className="w-full bg-black/60 border border-white/[0.06] rounded-lg px-2.5 py-2 text-[11px] text-zinc-300 font-mono placeholder-zinc-700 focus:outline-none focus:border-orange-500/40 resize-none"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Execute Button ── */}
      <button
        type="button"
        onClick={handleExecute}
        disabled={data.isExecuting || !data.url}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(249,115,22,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {data.isExecuting ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Executing Request...</span></>
        ) : (
          <><Play className="w-3.5 h-3.5 fill-black" /><span>Execute Request</span></>
        )}
      </button>

      {/* ── Response Drawer ── */}
      {data.response !== null && (
        <div className="rounded-lg border border-white/[0.06] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowResponse((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] text-[11px] font-mono transition"
          >
            <span className="flex items-center gap-1.5">
              {data.statusCode && data.statusCode < 300 ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-400" />
              )}
              <span className={STATUS_COLOR(data.statusCode)}>
                {data.statusCode ?? "—"}
              </span>
              <span className="text-zinc-500">
                {data.latencyMs !== null ? `${data.latencyMs}ms` : ""}
              </span>
            </span>
            {showResponse ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
          </button>
          {showResponse && (
            <div className="p-2 bg-black/40 max-h-40 overflow-auto">
              <pre className="text-[10px] text-emerald-300 font-mono whitespace-pre-wrap break-all">{data.response}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── Port ── */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.07] text-[10px] font-mono">
        <span className="text-zinc-600">No inputs</span>
        <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
          <span>RESPONSE OUT</span>
          <span className="w-2.5 h-2.5 rounded-full border border-orange-400 bg-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
        </div>
      </div>
    </div>
  );
};

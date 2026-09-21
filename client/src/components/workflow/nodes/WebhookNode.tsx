import React, { useState } from "react";
import {
  Webhook,
  ArrowRightLeft,
  Copy,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Radio,
  Clock,
  Zap,
} from "lucide-react";
import type { WebhookNodeData, WebhookMode } from "../types";
import toast from "react-hot-toast";

interface WebhookNodeProps {
  data: WebhookNodeData;
  onChange: (patch: Partial<WebhookNodeData>) => void;
  isExecuting?: boolean;
}

export const WebhookNode: React.FC<WebhookNodeProps> = ({
  data,
  onChange,
  isExecuting = false,
}) => {
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(data.webhookUrl).then(() => {
      setCopied(true);
      toast.success("Webhook URL copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const addMapping = () =>
    onChange({ mappings: [...data.mappings, { from: "", to: "" }] });

  const removeMapping = (i: number) =>
    onChange({ mappings: data.mappings.filter((_, idx) => idx !== i) });

  const setMapping = (i: number, field: "from" | "to", val: string) => {
    const next = [...data.mappings];
    next[i] = { ...next[i], [field]: val };
    onChange({ mappings: next });
  };

  const simulateTrigger = () => {
    onChange({
      lastTriggeredAt: new Date().toISOString(),
      payloadPreview: JSON.stringify(
        {
          event: data.eventFilter || "nova.workflow.trigger",
          timestamp: new Date().toISOString(),
          data: { imageId: "img_demo_01", platform: "instagram", status: "queued" },
        },
        null,
        2
      ),
    });
    setShowPayload(true);
    toast.success("Webhook triggered with mock payload!");
  };

  const isTransform = data.mode === "transform";

  return (
    <div
      className={`w-[320px] rounded-2xl border bg-[#0f0f13]/95 backdrop-blur-md shadow-2xl transition-all duration-300 ${
        isExecuting
          ? "border-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.3)]"
          : "border-violet-500/40 hover:border-violet-500/70"
      } p-4 space-y-3`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
            {isTransform ? (
              <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400" />
            ) : (
              <Webhook className="w-3.5 h-3.5 text-violet-400" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">
              {isTransform ? "JSON Transform" : "Webhook Trigger"}
            </h3>
            <p className="text-[10px] text-violet-400/80 font-mono">
              {isTransform ? "DATA TRANSFORM NODE" : "EVENT TRIGGER NODE"}
            </p>
          </div>
        </div>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
          {isTransform ? "TRANSFORM" : "TRIGGER"}
        </span>
      </div>

      {/* ── Mode Toggle ── */}
      <div className="flex rounded-lg overflow-hidden border border-white/[0.07] text-[11px] font-mono">
        {(["trigger", "transform"] as WebhookMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange({ mode: m })}
            className={`flex-1 py-1.5 transition flex items-center justify-center gap-1.5 ${
              data.mode === m
                ? "bg-violet-500/20 text-violet-300 font-semibold"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            {m === "trigger" ? <Radio className="w-3 h-3" /> : <ArrowRightLeft className="w-3 h-3" />}
            {m === "trigger" ? "Webhook" : "Transform"}
          </button>
        ))}
      </div>

      {/* ── WEBHOOK TRIGGER MODE ── */}
      {!isTransform && (
        <div className="space-y-2.5">
          {/* Endpoint URL */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Endpoint URL
            </label>
            <div className="flex items-center gap-1.5 bg-black/50 border border-white/[0.07] rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-zinc-300 font-mono flex-1 truncate">
                {data.webhookUrl || "https://nova.ai/webhook/…"}
              </span>
              <button
                type="button"
                onClick={copyUrl}
                className="flex-shrink-0 text-zinc-500 hover:text-violet-400 transition"
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Event Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Event Filter
            </label>
            <input
              type="text"
              value={data.eventFilter}
              onChange={(e) => onChange({ eventFilter: e.target.value })}
              placeholder="nova.workflow.*"
              className="w-full bg-black/50 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 font-mono placeholder-zinc-700 focus:outline-none focus:border-violet-500/50 transition"
            />
          </div>

          {/* Last Triggered */}
          {data.lastTriggeredAt && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
              <Clock className="w-3 h-3 text-violet-400" />
              <span>Last: {new Date(data.lastTriggeredAt).toLocaleTimeString()}</span>
              <span className="ml-auto text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          )}

          {/* Simulate Trigger */}
          <button
            type="button"
            onClick={simulateTrigger}
            className="w-full py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[11px] font-semibold font-mono transition flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Simulate Trigger
          </button>

          {/* Payload Preview */}
          {data.payloadPreview && (
            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPayload((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] text-[11px] font-mono text-zinc-400 transition"
              >
                <span>Payload Preview</span>
                {showPayload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showPayload && (
                <div className="p-2 bg-black/40 max-h-32 overflow-auto">
                  <pre className="text-[10px] text-violet-300 font-mono whitespace-pre-wrap">
                    {data.payloadPreview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── JSON TRANSFORM MODE ── */}
      {isTransform && (
        <div className="space-y-2.5">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Field Mappings (from → to)
          </div>

          {data.mappings.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={m.from}
                onChange={(e) => setMapping(i, "from", e.target.value)}
                placeholder="$.source.key"
                className="flex-1 bg-black/50 border border-white/[0.06] rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-violet-500/40 placeholder-zinc-700"
              />
              <ArrowRightLeft className="w-3 h-3 text-zinc-600 flex-shrink-0" />
              <input
                value={m.to}
                onChange={(e) => setMapping(i, "to", e.target.value)}
                placeholder="output.field"
                className="flex-1 bg-black/50 border border-white/[0.06] rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-violet-500/40 placeholder-zinc-700"
              />
              <button
                type="button"
                onClick={() => removeMapping(i)}
                className="p-1 text-zinc-600 hover:text-red-400 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addMapping}
            className="flex items-center gap-1 text-[10px] text-violet-400/80 hover:text-violet-300 font-mono transition"
          >
            <Plus className="w-3 h-3" /> Add Mapping
          </button>

          {/* Output Preview */}
          {data.outputPreview && (
            <div className="rounded-lg bg-black/40 border border-white/[0.06] p-2 max-h-24 overflow-auto">
              <pre className="text-[10px] text-violet-300 font-mono whitespace-pre-wrap">
                {data.outputPreview}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── Ports ── */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.07] text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-violet-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full border border-violet-400 bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
          <span>{isTransform ? "PAYLOAD IN" : "EVENT IN"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-violet-300 font-semibold">
          <span>{isTransform ? "TRANSFORMED OUT" : "PAYLOAD OUT"}</span>
          <span className="w-2.5 h-2.5 rounded-full border border-violet-300 bg-violet-300 shadow-[0_0_6px_rgba(196,181,253,0.7)]" />
        </div>
      </div>
    </div>
  );
};

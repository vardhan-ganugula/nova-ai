import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Send,
  Workflow,
  Sparkles,
  Key,
  ShieldCheck,
  RefreshCw,
  Code2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  useGetWebhookConfigQuery,
  useSaveWebhookConfigMutation,
  useTestWebhookConfigMutation,
} from "@/store/socialSlice";

interface WorkflowWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowWebhookModal: React.FC<WorkflowWebhookModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { data: webhookData } = useGetWebhookConfigQuery();
  const [saveWebhook, { isLoading: isSaving }] = useSaveWebhookConfigMutation();
  const [testWebhook, { isLoading: isTestingPayload }] = useTestWebhookConfigMutation();

  const [webhookUrl, setWebhookUrl] = useState(
    () => webhookData?.webhook?.webhookUrl || "https://your-webhook-endpoint.com/nova-dispatch"
  );
  const [webhookSecret, setWebhookSecret] = useState(
    () => webhookData?.webhook?.secret || "whsec_nova_984f82a17cb6e15904de2"
  );
  const [triggers, setTriggers] = useState({
    imageCompleted: true,
    videoCompleted: true,
    upscaleCompleted: false,
    audioCompleted: true,
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [lastPingResponse, setLastPingResponse] = useState<any | null>(null);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegenerateSecret = () => {
    const newSecret = `whsec_nova_${Math.random().toString(36).substring(2, 12)}${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    setWebhookSecret(newSecret);
    toast.success("Regenerated webhook signing secret!");
  };

  const handleSaveConfig = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a valid webhook URL");
      return;
    }

    try {
      const activeEvents: string[] = [];
      if (triggers.imageCompleted) activeEvents.push("image.generated");
      if (triggers.videoCompleted) activeEvents.push("video.generated");
      if (triggers.audioCompleted) activeEvents.push("audio.generated");
      if (triggers.upscaleCompleted) activeEvents.push("upscale.completed");
      activeEvents.push("post.published");

      await saveWebhook({
        webhookUrl: webhookUrl.trim(),
        secret: webhookSecret,
        isActive: true,
        events: activeEvents,
      }).unwrap();

      toast.success("Automation webhook settings saved successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to save webhook configuration");
    }
  };

  const handleTestPing = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setLastPingResponse(null);
    const toastId = toast.loading("Dispatching test sample payload to webhook endpoint...");

    try {
      const res = await testWebhook({
        webhookUrl: webhookUrl.trim(),
        secret: webhookSecret,
      }).unwrap();

      setLastPingResponse({
        status: 200,
        message: res.message || "Webhook reachable",
        receivedAt: new Date().toISOString(),
      });
      toast.success(res.message || "Webhook received payload with HTTP 200 OK!", {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to reach webhook endpoint", {
        id: toastId,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0e0e12] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Workflow & Automation Webhook</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                  PIPELINE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dispatch completed AI generations directly to your external workflow pipelines.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Webhook Endpoint Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                <span>Inbound Webhook URL</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-webhook-endpoint.com/nova-dispatch"
                  className="flex-1 px-3.5 py-2.5 bg-[#141418] border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookUrl, "url")}
                  className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Copy URL"
                >
                  {copiedField === "url" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Nova AI will send an HTTP POST request to this endpoint whenever generation events trigger.
              </p>
            </div>

            {/* HMAC Secret */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-orange-400" />
                  <span>Webhook Signing Secret (HMAC-SHA256)</span>
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateSecret}
                  className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate Secret</span>
                </button>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={webhookSecret}
                  readOnly
                  className="flex-1 px-3.5 py-2.5 bg-[#141418] border border-white/10 rounded-xl text-xs font-mono text-zinc-300 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookSecret, "secret")}
                  className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Copy Secret"
                >
                  {copiedField === "secret" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Requests will include a <code className="text-zinc-400 font-mono">x-nova-signature</code> header to verify origin authenticity.
              </span>
            </div>
          </div>

          {/* Trigger Subscriptions */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Subscribed Event Triggers
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "imageCompleted", label: "Image Rendered", desc: "Flux & SDXL image completions", tag: "image.generated" },
                { key: "videoCompleted", label: "Video Rendered", desc: "Kling & Hailuo video clips", tag: "video.generated" },
                { key: "audioCompleted", label: "Audio Synthesized", desc: "Speech & voice clone tracks", tag: "audio.generated" },
                { key: "upscaleCompleted", label: "8K UHD Upscaled", desc: "Clarity enhanced masters", tag: "upscale.completed" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-[#141418] hover:border-white/15 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(triggers as any)[item.key]}
                    onChange={(e) =>
                      setTriggers((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="mt-1 rounded bg-zinc-800 border-zinc-700 text-orange-500 focus:ring-orange-500/20"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                      <span className="text-[9px] font-mono text-zinc-500">({item.tag})</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Telemetry Output / Test Ping */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-orange-400" />
                <span>Test Telemetry Verification</span>
              </span>

              <button
                type="button"
                onClick={handleTestPing}
                disabled={isTestingPayload}
                className="px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-3 w-3" />
                <span>{isTestingPayload ? "Dispatching..." : "Send Test Ping"}</span>
              </button>
            </div>

            {lastPingResponse && (
              <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#09090c] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> HTTP {lastPingResponse.status} OK
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">{lastPingResponse.receivedAt}</span>
                </div>
                <div className="text-[11px] text-zinc-300 font-mono">{lastPingResponse.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/[0.08] flex items-center justify-end gap-3 bg-[#0a0a0d] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold text-xs shadow-lg shadow-orange-500/25 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Webhook Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

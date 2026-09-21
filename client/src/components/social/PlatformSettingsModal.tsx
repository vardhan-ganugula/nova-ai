import React, { useState } from "react";
import {
  X,
  Trash2,
  Check,
  Save,
  Sliders,
  Sparkles,
  Hash,
  AlertTriangle,
  RotateCw,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import type { SocialPlatformConfig } from "./types";

interface PlatformSettingsModalProps {
  isOpen: boolean;
  platform: SocialPlatformConfig | null;
  onClose: () => void;
  onUpdate: (platformId: string, updates: Partial<SocialPlatformConfig>) => void;
  onDisconnect: (platformId: string) => void;
}

export const PlatformSettingsModal: React.FC<PlatformSettingsModalProps> = ({
  isOpen,
  platform,
  onClose,
  onUpdate,
  onDisconnect,
}) => {
  if (!isOpen || !platform) return null;

  const [hashtags, setHashtags] = useState(platform.defaultHashtags?.join(" ") || "");
  const [autoPostEnabled, setAutoPostEnabled] = useState(platform.autoPostEnabled);
  const [includeAiDisclaimer, setIncludeAiDisclaimer] = useState(platform.includeAiDisclaimer);
  const [postFormat, setPostFormat] = useState(platform.postFormat);
  const [handle, setHandle] = useState(platform.handle || "");
  const [displayName, setDisplayName] = useState(platform.displayName || "");
  const [newToken, setNewToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = hashtags
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    const updates: Partial<SocialPlatformConfig> = {
      defaultHashtags: tagArray,
      autoPostEnabled,
      includeAiDisclaimer,
      postFormat,
      handle: handle.trim(),
      displayName: displayName.trim(),
    };

    if (newToken.trim()) {
      updates.accessToken = newToken.trim();
      updates.hasToken = true;
    }

    onUpdate(platform.id, updates);
    toast.success(`Settings & credentials for ${platform.name} updated!`);
    onClose();
  };

  const handleDisconnectAccount = () => {
    onDisconnect(platform.id);
    toast.success(`Disconnected from ${platform.name}.`);
    onClose();
  };

  const Icon = platform.icon;

  const getDaysRemaining = () => {
    if (!platform.tokenExpiresAt) return null;
    const diff = new Date(platform.tokenExpiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0e12] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center border shadow-md"
              style={{
                backgroundColor: `${platform.brandColor}18`,
                borderColor: `${platform.brandColor}40`,
                color: platform.brandColor,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{platform.name} Settings</span>
                {platform.handle && (
                  <span className="text-xs font-mono text-zinc-400 font-normal">
                    ({platform.handle})
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage publishing credentials, AI disclaimer & distribution tags.
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

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Real Credential & Connection Status Card */}
          <div className="rounded-xl border border-white/10 bg-[#141418] p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>{platform.name} Connection</span>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                  Account Handle
                </span>
                <span className="font-mono text-orange-400 font-bold">
                  {platform.handle || "@connected"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                  Credential Storage
                </span>
                <span className="text-zinc-300 flex items-center gap-1 text-[11px]">
                  <Key className="h-3 w-3 text-emerald-400" />
                  Securely stored (AES-256-GCM)
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                  Token Status
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Active
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                  Token Expiration
                </span>
                <span className="text-zinc-300 font-mono text-[11px]">
                  {platform.tokenExpiresAt
                    ? new Date(platform.tokenExpiresAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Not provided by platform"}
                </span>
              </div>
            </div>

            {/* Reconnect / Refresh Session Action */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                Need to re-authorize or renew scopes?
              </span>

              {platform.id === "instagram" ? (
                <a
                  href={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/integrations/instagram/connect`}
                  className="px-2.5 py-1 rounded-lg border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>Reconnect with Meta</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium transition cursor-pointer"
                >
                  {showToken ? "Cancel Credential Update" : "Update API Credential"}
                </button>
              )}
            </div>

            {/* Optional credential update for non-OAuth platforms (e.g. Discord webhook) */}
            {platform.id !== "instagram" && showToken && (
              <div className="pt-3 border-t border-white/5">
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  New Access Token or Webhook URL
                </label>
                <input
                  type="password"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  placeholder="Paste new token or webhook URL to update"
                  className="w-full px-3 py-2 bg-[#101014] border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 font-mono"
                />
              </div>
            )}
          </div>

          {/* Auto Post Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-[#141418]">
            <div>
              <div className="text-xs font-semibold text-white">Enable Auto-Distribution</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Automatically queue generated content for this channel upon render completion.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPostEnabled}
                onChange={(e) => setAutoPostEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
            </label>
          </div>

          {/* AI Disclosure Label Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-[#141418]">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>AI Attribution & Transparency Tag</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  COMPLIANT
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Attach #MadeWithAI / synthetic media disclosure in caption as required by platform policies.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeAiDisclaimer}
                onChange={(e) => setIncludeAiDisclaimer(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
            </label>
          </div>

          {/* Default Post Format */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Preferred Media Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {platform.supportedFormats.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setPostFormat(fmt)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    postFormat === fmt
                      ? "border-orange-500 bg-orange-500/15 text-orange-400 font-bold"
                      : "border-white/[0.08] bg-[#141418] text-zinc-400 hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Default Hashtags */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Default Preset Hashtags</span>
              <span className="text-[10px] text-zinc-500 font-mono">Separated by space</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <textarea
                rows={2}
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#AIArt #DigitalArt #NovaStudio"
                className="w-full pl-9 pr-3 py-2.5 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>
          </div>

          {/* Save button & Disconnect */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>

            {!isConfirmingDisconnect ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDisconnect(true)}
                className="py-2.5 px-3 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDisconnectAccount}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDisconnect(false)}
                  className="py-2.5 px-2.5 rounded-xl border border-white/10 text-zinc-400 text-xs hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

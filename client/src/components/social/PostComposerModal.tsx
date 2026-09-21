import React, { useState } from "react";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Send,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  Hash,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
  FaPinterestP,
  FaFacebookF,
} from "react-icons/fa6";
import { useGetUserHistoryQuery } from "@/store/authSlice";
import { useCreateSocialPostMutation } from "@/store/socialSlice";
import toast from "react-hot-toast";

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedPlatforms: string[];
}

const SUPPORTED_CHANNELS = [
  { id: "instagram", name: "Instagram", icon: FaInstagram, color: "#E1306C", maxChars: 2200 },
  { id: "x", name: "X (Twitter)", icon: FaXTwitter, color: "#ffffff", maxChars: 280 },
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedinIn, color: "#0A66C2", maxChars: 3000 },
  { id: "youtube", name: "YouTube Shorts", icon: FaYoutube, color: "#FF0000", maxChars: 1000 },
  { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "#00F2FE", maxChars: 2200 },
  { id: "pinterest", name: "Pinterest", icon: FaPinterestP, color: "#BD081C", maxChars: 500 },
  { id: "facebook", name: "Facebook", icon: FaFacebookF, color: "#1877F2", maxChars: 2000 },
];

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  connectedPlatforms,
}) => {
  if (!isOpen) return null;

  const { data: historyData } = useGetUserHistoryQuery();
  const [createPost, { isLoading: isCreating }] = useCreateSocialPostMutation();

  const userGenerations = historyData?.images || [];

  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>(() => {
    return userGenerations[0]?.r2Url || userGenerations[0]?.watermarkedR2Url || "";
  });
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video" | "audio">("image");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(() => {
    return userGenerations[0]?.id || null;
  });

  const [mediaTab, setMediaTab] = useState<"library" | "custom">("library");
  const [customMediaUrl, setCustomMediaUrl] = useState("");

  const [selectedChannels, setSelectedChannels] = useState<string[]>(() => {
    return connectedPlatforms.length > 0
      ? connectedPlatforms.slice(0, 2)
      : ["instagram", "x"];
  });

  const [caption, setCaption] = useState(
    "✨ Check out this new visual conceptualized with Nova AI! The future of creative intelligence is here.\n\n#AIArt #NovaAI #GenerativeAI"
  );
  const [previewTab, setPreviewTab] = useState<"instagram" | "x" | "linkedin">("instagram");

  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(() => {
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    nextHour.setMinutes(0, 0, 0);
    return nextHour.toISOString().slice(0, 16);
  });

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      if (selectedChannels.length === 1) {
        toast.error("Please select at least one channel");
        return;
      }
      setSelectedChannels(selectedChannels.filter((id) => id !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handleAppendAiDisclaimer = () => {
    const disclaimer = "\n\n🤖 Created with @NovaAI | #MadeWithAI #GenerativeArt";
    if (!caption.includes("#MadeWithAI")) {
      setCaption((prev) => prev.trim() + disclaimer);
    }
  };

  const activeMedia = mediaTab === "library" ? selectedMediaUrl : customMediaUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeMedia) {
      toast.error("Please select or provide a media asset");
      return;
    }

    if (!caption.trim()) {
      toast.error("Please enter a caption");
      return;
    }

    if (selectedChannels.length === 0) {
      toast.error("Please choose at your target channels");
      return;
    }

    let scheduledForIso: string | null = null;
    if (scheduleMode === "later") {
      const selectedTime = new Date(scheduledDateTime).getTime();
      if (isNaN(selectedTime) || selectedTime <= Date.now()) {
        toast.error("Please select a future scheduled date and time");
        return;
      }
      scheduledForIso = new Date(scheduledDateTime).toISOString();
    }

    try {
      await createPost({
        mediaUrl: activeMedia,
        mediaType: selectedMediaType,
        caption: caption.trim(),
        targetPlatforms: selectedChannels,
        scheduledFor: scheduledForIso,
        imageId: selectedImageId,
      }).unwrap();

      toast.success(
        scheduleMode === "later"
          ? "Post scheduled to queue successfully!"
          : "Post queued for immediate distribution!"
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to create post");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#111115] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#141419]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Publish & Schedule Social Content
              </h2>
              <p className="text-[11px] text-zinc-400">
                Distribute your AI creations across connected social channels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Left Column: Form & Configuration */}
          <div className="lg:col-span-7 p-6 space-y-6 border-r border-zinc-800/80">
            {/* 1. Target Channels */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Target Channels
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {selectedChannels.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUPPORTED_CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = selectedChannels.includes(channel.id);
                  const isConnected = connectedPlatforms.includes(channel.id);

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? "border-orange-500/50 bg-orange-500/10 text-white"
                          : "border-zinc-800 bg-[#16161c] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: channel.color }} />
                      <span>{channel.name}</span>
                      {isSelected && <Check className="h-3 w-3 text-orange-400" />}
                      {!isConnected && (
                        <span className="text-[9px] text-zinc-500 font-mono">(Unlinked)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Media Asset Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Media Asset</label>
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setMediaTab("library")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      mediaTab === "library"
                        ? "bg-zinc-800 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    My AI Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTab("custom")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      mediaTab === "custom"
                        ? "bg-zinc-800 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Direct URL
                  </button>
                </div>
              </div>

              {mediaTab === "library" ? (
                <div>
                  {userGenerations.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 text-center space-y-2">
                      <ImageIcon className="h-8 w-8 text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400">No generated images found yet.</p>
                      <span className="text-[11px] text-zinc-500">
                        Generate artwork in the Studio first or enter a direct URL.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
                      {userGenerations.map((img: any) => {
                        const url = img.r2Url || img.watermarkedR2Url;
                        const isChosen = activeMedia === url;

                        return (
                          <div
                            key={img.id}
                            onClick={() => {
                              setSelectedMediaUrl(url);
                              setSelectedImageId(img.id);
                              setSelectedMediaType(img.generationType === "video" ? "video" : "image");
                            }}
                            className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer group transition ${
                              isChosen
                                ? "border-orange-500 ring-2 ring-orange-500/40"
                                : "border-zinc-800 hover:border-zinc-600"
                            }`}
                          >
                            <img
                              src={url}
                              alt={img.prompt}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            {isChosen && (
                              <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                                <div className="h-5 w-5 rounded-full bg-orange-500 text-black flex items-center justify-center">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={customMediaUrl}
                    onChange={(e) => setCustomMediaUrl(e.target.value)}
                    placeholder="https://example.com/asset.jpg or .mp4"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">Asset Type:</span>
                    {(["image", "video"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedMediaType(type)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono capitalize ${
                          selectedMediaType === type
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Caption & AI Tagging */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Post Caption & Copy
                </label>
                <button
                  type="button"
                  onClick={handleAppendAiDisclaimer}
                  className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
                >
                  <Hash className="h-3 w-3" />
                  <span>+ AI Disclaimer Tag</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write an engaging caption for your audience..."
                className="w-full p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60 leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>
                  {caption.length} / 2,200 chars
                  {selectedChannels.includes("x") && caption.length > 280 && (
                    <span className="text-amber-400 ml-2">
                      (Exceeds 280-char X.com limit)
                    </span>
                  )}
                </span>
                <span>Aspect: 16:9 / 1:1 auto-crop</span>
              </div>
            </div>

            {/* 4. Scheduling Mode */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <label className="text-xs font-semibold text-zinc-300">Publishing Timeline</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleMode("now")}
                  className={`p-3 rounded-xl border text-left transition ${
                    scheduleMode === "now"
                      ? "border-orange-500/50 bg-orange-500/10 text-white"
                      : "border-zinc-800 bg-[#16161c] text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Send className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-xs font-bold">Publish Immediately</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Async dispatch to selected platforms now
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleMode("later")}
                  className={`p-3 rounded-xl border text-left transition ${
                    scheduleMode === "later"
                      ? "border-orange-500/50 bg-orange-500/10 text-white"
                      : "border-zinc-800 bg-[#16161c] text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-xs font-bold">Schedule for Later</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Queued via Inngest automated timer
                  </p>
                </button>
              </div>

              {scheduleMode === "later" && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <Clock className="h-4 w-4 text-orange-400 shrink-0" />
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">
                      Pick Date & Time (Your Local Time)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Multi-Channel Live Preview */}
          <div className="lg:col-span-5 p-6 bg-[#0c0c0f] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Live Platform Preview</span>
                </span>

                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-[11px]">
                  {(["instagram", "x", "linkedin"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPreviewTab(tab)}
                      className={`px-2 py-0.5 rounded capitalize font-medium transition ${
                        previewTab === tab
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Card Mockup */}
              {previewTab === "instagram" && (
                <div className="rounded-xl border border-zinc-800 bg-[#121216] overflow-hidden shadow-lg max-w-sm mx-auto">
                  {/* Mock IG Header */}
                  <div className="flex items-center justify-between p-3 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-fuchsia-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                          N
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">nova.generative</span>
                    </div>
                    <span className="text-zinc-500 text-xs">•••</span>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-square bg-zinc-900">
                    {activeMedia ? (
                      <img
                        src={activeMedia}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-1">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-[11px]">Select media to preview</span>
                      </div>
                    )}
                  </div>

                  {/* Mock Caption */}
                  <div className="p-3 space-y-1.5 text-xs">
                    <div className="font-bold text-white">342 likes</div>
                    <p className="text-zinc-300 line-clamp-3 text-[11px] leading-relaxed">
                      <strong className="text-white mr-1.5">nova.generative</strong>
                      {caption || "Your post caption will appear here..."}
                    </p>
                    <span className="text-[9px] uppercase font-mono text-zinc-500 block pt-1">
                      Just now • Feed post
                    </span>
                  </div>
                </div>
              )}

              {previewTab === "x" && (
                <div className="rounded-xl border border-zinc-800 bg-[#121216] p-4 space-y-3 max-w-sm mx-auto">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                      N
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">Nova AI Studio</span>
                        <span className="text-[11px] text-zinc-500 font-mono">@NovaStudio_AI</span>
                      </div>
                      <p className="text-xs text-zinc-200 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {caption || "Your post caption will appear here..."}
                      </p>
                    </div>
                  </div>

                  {activeMedia && (
                    <div className="rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-900">
                      <img
                        src={activeMedia}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-zinc-500 text-[11px] pt-2 border-t border-zinc-800/60 font-mono">
                    <span>12:00 PM • View post</span>
                    <span className="text-orange-400">Twitter v2</span>
                  </div>
                </div>
              )}

              {previewTab === "linkedin" && (
                <div className="rounded-xl border border-zinc-800 bg-[#121216] p-4 space-y-3 max-w-sm mx-auto">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      IN
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Nova AI Labs</div>
                      <span className="text-[10px] text-zinc-500 block">Generative AI • 12,400 followers</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                    {caption || "Your post caption will appear here..."}
                  </p>

                  {activeMedia && (
                    <div className="rounded-lg overflow-hidden border border-zinc-800 aspect-video bg-zinc-900">
                      <img
                        src={activeMedia}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {scheduleMode === "later" ? (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{isCreating ? "Scheduling..." : "Schedule Post"}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{isCreating ? "Publishing..." : "Publish Now"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

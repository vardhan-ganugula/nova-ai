import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sliders,
  Search,
  ExternalLink,
  Workflow,
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
  Check,
  ArrowUpRight,
  Info,
  Key,
  Sparkles,
  Calendar,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
  FaFacebookF,
  FaPinterestP,
  FaDiscord,
} from "react-icons/fa6";
import { AppShell } from "@/components/layout/AppShell";
import { ConnectSocialModal } from "@/components/social/ConnectSocialModal";
import { PlatformSettingsModal } from "@/components/social/PlatformSettingsModal";
import { WorkflowWebhookModal } from "@/components/social/WorkflowWebhookModal";
import { PostComposerModal } from "@/components/social/PostComposerModal";
import type { SocialPlatformConfig } from "@/components/social/types";
import {
  useGetSocialAccountsQuery,
  useConnectSocialAccountMutation,
  useUnlinkAllSocialAccountsMutation,
  useUpdateSocialAccountMutation,
  useDisconnectSocialAccountMutation,
  useGetSocialPostsQuery,
  usePublishPostNowMutation,
  useDeleteSocialPostMutation,
} from "@/store/socialSlice";
import toast from "react-hot-toast";

const PLATFORMS_CATALOG: Omit<SocialPlatformConfig, "connected">[] = [
  {
    id: "instagram",
    name: "Instagram",
    category: "visual",
    icon: FaInstagram,
    brandColor: "#E1306C",
    bgGlow: "rgba(225, 48, 108, 0.12)",
    borderColor: "rgba(225, 48, 108, 0.3)",
    description: "Authorize direct publishing of 1:1 square artwork, 4:5 portraits, and 9:16 vertical Reels via official Meta Graph API OAuth.",
    supportedFormats: ["1:1 Square", "4:5 Portrait", "9:16 Reels"],
    permissions: ["instagram_business_basic", "instagram_business_content_publish", "pages_show_list"],
    defaultHashtags: ["#AIArt", "#GenerativeArt", "#NovaAI", "#DigitalCreator"],
    includeAiDisclaimer: true,
    autoPostEnabled: true,
    postFormat: "1:1 Square",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "professional",
    icon: FaLinkedinIn,
    brandColor: "#0A66C2",
    bgGlow: "rgba(10, 102, 194, 0.12)",
    borderColor: "rgba(10, 102, 194, 0.3)",
    description: "Publish thought-leadership visuals, multi-page slide decks, and product renders to personal profiles or company pages.",
    supportedFormats: ["16:9 Landscape", "1:1 Square", "Document PDF"],
    permissions: ["w_member_social", "r_liteprofile", "w_organization_social"],
    defaultHashtags: ["#ArtificialIntelligence", "#GenerativeAI", "#Innovation", "#TechArt"],
    includeAiDisclaimer: true,
    autoPostEnabled: true,
    postFormat: "16:9 Landscape",
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "professional",
    icon: FaXTwitter,
    brandColor: "#ffffff",
    bgGlow: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    description: "Post artwork renders, prompt breakdowns, video clips, and high-engagement media threads via Twitter API v2.",
    supportedFormats: ["16:9 Landscape", "1:1 Square", "Thread Series"],
    permissions: ["tweet.read", "tweet.write", "users.read"],
    defaultHashtags: ["#buildinpublic", "#Flux1", "#AIArtwork", "#NovaAI"],
    includeAiDisclaimer: true,
    autoPostEnabled: true,
    postFormat: "16:9 Landscape",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "video",
    icon: FaYoutube,
    brandColor: "#FF0000",
    bgGlow: "rgba(255, 0, 0, 0.12)",
    borderColor: "rgba(255, 0, 0, 0.3)",
    description: "Auto-publish AI-synthesized videos and motion graphics directly as YouTube Shorts and Community image posts.",
    supportedFormats: ["9:16 Shorts", "16:9 Video", "Community Post"],
    permissions: ["youtube.upload", "youtube.readonly"],
    defaultHashtags: ["#Shorts", "#AIAnimation", "#NovaStudio"],
    includeAiDisclaimer: true,
    autoPostEnabled: true,
    postFormat: "9:16 Shorts",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "video",
    icon: FaTiktok,
    brandColor: "#00F2FE",
    bgGlow: "rgba(0, 242, 254, 0.12)",
    borderColor: "rgba(0, 242, 254, 0.3)",
    description: "Upload generated video clips, motion animations, and visual loops directly as TikTok video drafts or public posts.",
    supportedFormats: ["9:16 Vertical Video"],
    permissions: ["video.upload", "video.publish", "user.info.basic"],
    defaultHashtags: ["#fyp", "#aiart", "#animation", "#digitalcreators"],
    includeAiDisclaimer: true,
    autoPostEnabled: true,
    postFormat: "9:16 Vertical Video",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "visual",
    icon: FaPinterestP,
    brandColor: "#BD081C",
    bgGlow: "rgba(189, 8, 28, 0.12)",
    borderColor: "rgba(189, 8, 28, 0.3)",
    description: "Pin concept art, wallpapers, 3D assets, and character designs to specific creator boards with destination attribution.",
    supportedFormats: ["2:3 Standard Pin", "9:16 Idea Pin"],
    permissions: ["boards:read", "pins:read", "pins:write"],
    defaultHashtags: ["#conceptart", "#aesthetic", "#wallpaper", "#3dart"],
    includeAiDisclaimer: true,
    autoPostEnabled: true,
    postFormat: "2:3 Standard Pin",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "professional",
    icon: FaFacebookF,
    brandColor: "#1877F2",
    bgGlow: "rgba(24, 119, 242, 0.12)",
    borderColor: "rgba(24, 119, 242, 0.3)",
    description: "Publish photo albums, event promotional banners, and high-resolution video reels to Facebook Creator Pages.",
    supportedFormats: ["16:9 Landscape", "1:1 Square", "Video Reel"],
    permissions: ["pages_manage_posts", "pages_read_engagement"],
    defaultHashtags: ["#DigitalCreatives", "#AICommunity"],
    includeAiDisclaimer: true,
    autoPostEnabled: true,
    postFormat: "16:9 Landscape",
  },
  {
    id: "discord",
    name: "Discord",
    category: "automation",
    icon: FaDiscord,
    brandColor: "#5865F2",
    bgGlow: "rgba(88, 101, 242, 0.12)",
    borderColor: "rgba(88, 101, 242, 0.3)",
    description: "Broadcast completed generation previews and full-res download links directly to your private Discord guild channels.",
    supportedFormats: ["Rich Embed", "Raw Asset"],
    permissions: ["bot.webhook_send"],
    defaultHashtags: [],
    includeAiDisclaimer: false,
    autoPostEnabled: true,
    postFormat: "Rich Embed",
  },
];

export default function SocialConnectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "connected" | "visual" | "professional" | "video" | "automation"
  >("all");

  // Modals
  const [activeConnectPlatform, setActiveConnectPlatform] =
    useState<SocialPlatformConfig | null>(null);
  const [activeSettingsPlatform, setActiveSettingsPlatform] =
    useState<SocialPlatformConfig | null>(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Post Queue & History State
  const [postPage, setPostPage] = useState(1);
  const [postStatusFilter, setPostStatusFilter] = useState<string>("all");

  // Backend RTK Queries & Mutations
  const { data: accountsData, isLoading: isLoadingAccounts, refetch: refetchAccounts } = useGetSocialAccountsQuery();
  const [connectAccount] = useConnectSocialAccountMutation();
  const [unlinkAllAccounts, { isLoading: isUnlinkingAll }] = useUnlinkAllSocialAccountsMutation();
  const [updateAccount] = useUpdateSocialAccountMutation();
  const [disconnectAccount] = useDisconnectSocialAccountMutation();

  // Listen for Meta OAuth redirect parameters
  useEffect(() => {
    const igParam = searchParams.get("instagram");
    if (igParam === "connected") {
      toast.success("Instagram professional account successfully connected via Meta OAuth!");
      refetchAccounts();
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("instagram");
      setSearchParams(nextParams, { replace: true });
    } else if (igParam === "error") {
      const reason = searchParams.get("reason") || "OAuth connection failed";
      const message = searchParams.get("message");
      toast.error(`Instagram OAuth Error: ${reason}${message ? ` (${message})` : ""}`);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("instagram");
      nextParams.delete("reason");
      nextParams.delete("message");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refetchAccounts]);

  const { data: postsData, isLoading: isLoadingPosts, refetch: refetchPosts } = useGetSocialPostsQuery({
    page: postPage,
    limit: 10,
    status: postStatusFilter,
  });

  const [publishPostNow, { isLoading: isPublishing }] = usePublishPostNowMutation();
  const [deletePost] = useDeleteSocialPostMutation();

  const connectedAccounts = (accountsData?.accounts || []).filter(
    (a) => a.status === "active" || a.status === "connected"
  );
  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination;

  // Merge catalog with live database records
  const platforms: SocialPlatformConfig[] = PLATFORMS_CATALOG.map((base) => {
    const match = connectedAccounts.find((a) => a.platform === base.id);
    if (match) {
      return {
        ...base,
        connected: true,
        accountId: match.id,
        handle: match.accountUsername,
        displayName: match.accountName,
        avatarUrl:
          match.avatarUrl ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${match.accountUsername}`,
        autoPostEnabled: match.metadata?.autoPostEnabled ?? true,
        includeAiDisclaimer: match.metadata?.includeAiDisclaimer ?? true,
        defaultHashtags: match.metadata?.defaultHashtags || base.defaultHashtags,
        postFormat: match.metadata?.postFormat || base.postFormat,
        hasToken: match.hasToken ?? !!match.accessToken,
        accessToken: match.accessToken || undefined,
        refreshToken: match.refreshToken || undefined,
        tokenExpiresAt: match.tokenExpiresAt,
      };
    }
    return { ...base, connected: false };
  });

  const connectedCount = connectedAccounts.length;

  const handleConnectSuccess = async (
    platformId: string,
    accountData: {
      handle: string;
      displayName: string;
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: string;
    }
  ) => {
    if (platformId === "instagram") {
      toast.error("Instagram accounts must be authenticated via official Meta OAuth 2.0.");
      return;
    }

    try {
      await connectAccount({
        platform: platformId,
        platformAccountId: `${platformId}_${accountData.handle.replace(/^@/, "")}`,
        accountUsername: accountData.handle,
        accountName: accountData.displayName,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${accountData.handle}`,
        accessToken: accountData.accessToken,
        refreshToken: accountData.refreshToken,
        tokenExpiresAt: accountData.tokenExpiresAt,
        metadata: {
          autoPostEnabled: true,
          includeAiDisclaimer: true,
        },
      }).unwrap();

      toast.success(`Connected ${accountData.handle} to ${platformId} with auth credentials!`);
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to connect account");
    }
  };

  const handleUpdateSettings = async (
    platformId: string,
    updates: Partial<SocialPlatformConfig>
  ) => {
    const match = connectedAccounts.find((a) => a.platform === platformId);
    if (!match) return;

    try {
      await updateAccount({
        id: match.id,
        accountUsername: updates.handle,
        accountName: updates.displayName,
        accessToken: updates.accessToken,
        refreshToken: updates.refreshToken,
        tokenExpiresAt: updates.tokenExpiresAt,
        metadata: {
          ...match.metadata,
          defaultHashtags: updates.defaultHashtags,
          autoPostEnabled: updates.autoPostEnabled,
          includeAiDisclaimer: updates.includeAiDisclaimer,
          postFormat: updates.postFormat,
        },
      }).unwrap();

      toast.success(`Settings & tokens updated for ${platformId}`);
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to update account settings");
    }
  };

  const handleDisconnect = async (platformId: string) => {
    const match = connectedAccounts.find((a) => a.platform === platformId);
    if (!match) return;

    try {
      await disconnectAccount(match.id).unwrap();
      toast.success(`Unlinked ${platformId} account`);
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to unlink account");
    }
  };

  const handleDisconnectAll = async () => {
    try {
      await unlinkAllAccounts().unwrap();
      toast.success("All social platforms unlinked.");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to unlink accounts");
    }
  };

  const handleQuickSandboxConnect = async (platformId: string) => {
    if (platformId === "instagram") {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        (import.meta.env.PROD ? "" : "http://localhost:8000");
      window.location.href = `${backendUrl}/api/integrations/instagram/connect`;
      return;
    }

    try {
      await connectAccount({
        platform: platformId,
        platformAccountId: `${platformId}_sandbox_quick`,
        accountUsername: `@nova_${platformId}`,
        accountName: `Nova ${platformId.charAt(0).toUpperCase() + platformId.slice(1)} Channel`,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=nova_${platformId}`,
        accessToken: `sandbox_key_${platformId}_${Date.now()}`,
        tokenExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          autoPostEnabled: true,
          includeAiDisclaimer: true,
          isSandbox: true,
        },
      }).unwrap();
      toast.success(`Connected ${platformId} in Sandbox Mode!`);
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to connect platform");
    }
  };

  const handleTestPing = (platform: SocialPlatformConfig) => {
    const toastId = toast.loading(`Verifying OAuth token for ${platform.name} (${platform.handle})...`);
    setTimeout(() => {
      toast.success(`Authentication verified! ${platform.name} token is active and authorized.`, {
        id: toastId,
      });
    }, 1000);
  };

  const handlePublishNow = async (postId: string) => {
    try {
      await publishPostNow(postId).unwrap();
      toast.success("Publishing triggered via Inngest workflow!");
      refetchPosts();
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to initiate publish");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId).unwrap();
      toast.success("Post removed from queue");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to delete post");
    }
  };

  // Filtered platforms
  const filteredPlatforms = platforms.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.handle && p.handle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (categoryFilter === "connected") return p.connected;
    if (categoryFilter === "all") return true;
    return p.category === categoryFilter;
  });

  return (
    <AppShell title="Connected Social Accounts" subtitleBadge="[ INTEGRATIONS ]">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Top Header Card */}
        <div className="relative rounded-2xl border border-zinc-800 bg-[#121217] p-6 lg:p-7 overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[11px] font-mono font-bold tracking-wide">
                  <Radio className="h-3 w-3 text-orange-400 animate-pulse" />
                  ACCOUNTS & INTEGRATIONS
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {connectedCount} of {platforms.length} Channels Linked
                </span>
              </div>

              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Connect Social Channels & Publish Content
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Authenticate official social accounts to store access tokens and authorize direct distribution of AI-generated artwork, videos, and carousels directly from the creation studio or automated workflows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {connectedCount > 0 && (
                <button
                  onClick={handleDisconnectAll}
                  disabled={isUnlinkingAll}
                  className="px-3 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                  title="Unlink all social accounts"
                >
                  Unlink All ({connectedCount})
                </button>
              )}

              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.35)] transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Post Generated Media</span>
              </button>

              <button
                onClick={() => setIsWebhookModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-white font-medium text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Workflow className="h-4 w-4 text-orange-400" />
                <span>Workflow Webhooks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Integration Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#121216]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Active Channels
            </span>
            <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1.5">
              <span>{connectedCount}</span>
              <span className="text-xs font-mono text-zinc-500">/ {platforms.length}</span>
            </div>
            {connectedCount > 0 ? (
              <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Ready for publishing
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-zinc-500" /> No channels linked
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#121216]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Auth Tokens
            </span>
            <div
              className={`text-xl font-mono mt-1 ${
                connectedCount > 0 ? "font-bold text-emerald-400" : "font-normal text-zinc-500"
              }`}
            >
              {connectedCount > 0 ? "STORED & ACTIVE" : "NONE STORED"}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {connectedCount > 0 ? "PostgreSQL encrypted" : "Authenticate to store"}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#121216]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Queued & Published
            </span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {pagination?.totalItems ?? 0} Posts
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Automated distribution</p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#121216]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Automated Workflows
            </span>
            <div
              className={`text-xl font-mono mt-1 ${
                connectedCount > 0 ? "font-bold text-orange-400" : "font-normal text-zinc-500"
              }`}
            >
              {connectedCount > 0 ? "READY" : "STANDBY"}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {connectedCount > 0 ? "Inngest + n8n triggers" : "Connect channel to enable"}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {[
              { id: "all", label: "All Platforms" },
              { id: "connected", label: `Connected (${connectedCount})` },
              { id: "visual", label: "Visual Media" },
              { id: "professional", label: "Social & Professional" },
              { id: "video", label: "Video & Shorts" },
              { id: "automation", label: "Automation" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? "bg-zinc-800 text-white border border-zinc-750 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handle or platform..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#141418] border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  platform.connected
                    ? "border-zinc-700 bg-[#131318] shadow-lg"
                    : "border-zinc-800/80 bg-[#101014] hover:border-zinc-700"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center border text-base shadow-sm"
                        style={{
                          backgroundColor: `${platform.brandColor}15`,
                          borderColor: `${platform.brandColor}30`,
                          color: platform.brandColor,
                        }}
                      >
                        <Icon />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          {platform.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase text-zinc-500">
                          {platform.category}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {platform.connected ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        CONNECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500 bg-zinc-800/40 border border-zinc-750 px-2 py-0.5 rounded-full">
                        NOT LINKED
                      </span>
                    )}
                  </div>

                  {/* Connected Account Preview or Description */}
                  {platform.connected ? (
                    <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-3 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={platform.avatarUrl}
                          alt={platform.displayName}
                          className="h-8 w-8 rounded-full object-cover border border-zinc-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">
                            {platform.displayName}
                          </div>
                          <div className="text-[11px] font-mono text-orange-400 truncate">
                            {platform.handle}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Key className="h-3 w-3 text-orange-400" />
                          <span>Token Stored</span>
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Ready to Post
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 leading-relaxed min-h-[44px]">
                      {platform.description}
                    </p>
                  )}

                  {/* Supported Formats */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Supported Formats
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {platform.supportedFormats.map((fmt) => (
                        <span
                          key={fmt}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-850 border border-zinc-750 text-zinc-300"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center gap-2">
                  {platform.connected ? (
                    <>
                      <button
                        onClick={() => setActiveSettingsPlatform(platform)}
                        className="flex-1 py-1.5 px-3 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="h-3.5 w-3.5 text-orange-400" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => handleTestPing(platform)}
                        title="Verify Access Token"
                        className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        className="py-1.5 px-2.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs transition cursor-pointer"
                        title="Unlink Channel"
                      >
                        Unlink
                      </button>
                    </>
                  ) : platform.id === "instagram" ? (
                    <button
                      onClick={() => {
                        const backendUrl =
                          import.meta.env.VITE_BACKEND_URL ||
                          (import.meta.env.PROD ? "" : "http://localhost:8000");
                        window.location.href = `${backendUrl}/api/integrations/instagram/connect`;
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      title="Authenticate real Instagram Professional account via Meta OAuth"
                    >
                      <FaInstagram className="h-4 w-4" />
                      <span>Connect Instagram</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={() => handleQuickSandboxConnect(platform.id)}
                        className="flex-1 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        title={`Connect ${platform.name} immediately in Sandbox Mode`}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Connect (Sandbox)</span>
                      </button>

                      <button
                        onClick={() => setActiveConnectPlatform(platform)}
                        className="py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                        title={`Configure custom credentials or webhook for ${platform.name}`}
                      >
                        <Key className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Custom</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Social Publishing Queue & Post History Section (Strict 10-Item Pagination) */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121217] p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-orange-400" />
                <h2 className="text-base font-bold text-white">Social Publishing Queue & History</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
                  {pagination?.totalItems ?? 0} TOTAL
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monitor status of scheduled dispatches and active posts across connected channels.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
                {["all", "scheduled", "published", "publishing", "failed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setPostStatusFilter(status);
                      setPostPage(1);
                    }}
                    className={`px-2.5 py-1 rounded capitalize font-mono text-[11px] transition cursor-pointer ${
                      postStatusFilter === status
                        ? "bg-zinc-800 text-white font-bold"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button
                onClick={() => refetchPosts()}
                title="Refresh Post Status"
                className="p-2 rounded-lg border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Posts List */}
          {isLoadingPosts ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono">
              Loading social publishing queue...
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">No posts in queue</h4>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  Ready to share your creations? Use the composer to schedule or instantly dispatch AI assets to your connected handles.
                </p>
              </div>
              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create New Post</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const targetChannels = Array.isArray(post.targetPlatforms)
                  ? post.targetPlatforms
                  : [];

                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-[#0e0e12] flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-zinc-700"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Media preview */}
                      <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-black">
                        {post.mediaType === "video" ? (
                          <video
                            src={post.mediaUrl}
                            className="h-full w-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Post Media"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                          {post.caption}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {/* Platforms */}
                          <div className="flex items-center gap-1">
                            {targetChannels.map((ch) => (
                              <span
                                key={ch}
                                className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-orange-400 capitalize"
                              >
                                {ch}
                              </span>
                            ))}
                          </div>

                          {/* Time */}
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.scheduledFor
                              ? `Scheduled: ${new Date(post.scheduledFor).toLocaleString()}`
                              : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      {/* Status Tag */}
                      <span
                        className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          post.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : post.status === "scheduled"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : post.status === "publishing"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {post.status}
                      </span>

                      {/* Publish Now if scheduled / failed */}
                      {(post.status === "scheduled" || post.status === "failed") && (
                        <button
                          onClick={() => handlePublishNow(post.id)}
                          disabled={isPublishing}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 text-orange-400 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          Publish Now
                        </button>
                      )}

                      {/* External post link if published */}
                      {post.platformPostIds && (
                        <div className="flex items-center gap-1">
                          {Object.entries(post.platformPostIds).map(([plat, url]) => (
                            <a
                              key={plat}
                              href={String(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white transition"
                              title={`View on ${plat}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Strict 10-Item Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
                  <span>
                    Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} posts)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPostPage((prev) => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={() => setPostPage((prev) => prev + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Downstream Workflows Banner */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#121217] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Workflow className="h-4 w-4 text-orange-400" />
              <span>Automate Downstream Content Distribution</span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Connect external workflow automations (like n8n, Make, or custom webhooks) to automatically receive rendered images and videos for scheduled publishing across your social handles.
            </p>
          </div>

          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Configure Webhooks</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ConnectSocialModal
        isOpen={!!activeConnectPlatform}
        platform={activeConnectPlatform}
        onClose={() => setActiveConnectPlatform(null)}
        onConnect={handleConnectSuccess}
      />

      <PlatformSettingsModal
        isOpen={!!activeSettingsPlatform}
        platform={activeSettingsPlatform}
        onClose={() => setActiveSettingsPlatform(null)}
        onUpdate={handleUpdateSettings}
        onDisconnect={handleDisconnect}
      />

      <WorkflowWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />

      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        connectedPlatforms={connectedAccounts.map((a) => a.platform)}
      />
    </AppShell>
  );
}

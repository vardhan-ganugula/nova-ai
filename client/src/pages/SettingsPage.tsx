import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  Coins,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  KeyRound,
  Save,
  ImageIcon,
  Video,
  Wand2,
  Scissors,
  FileText,
  Sliders,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  useGetUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetTokenUsageQuery,
} from "@/store/authSlice";

export default function SettingsPage() {
  const { data: userData } = useGetUserQuery();
  const { data: tokenUsageData, isLoading: isUsageLoading } = useGetTokenUsageQuery();
  const [updateProfileApi, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePasswordApi, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const user = userData?.user;
  const credits = user?.credits ?? tokenUsageData?.credits ?? 100;

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "tokens">("profile");

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || "Nova Creator");
  const [username, setUsername] = useState(user?.username || "");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) {
      toast.error("Display name and username cannot be empty.");
      return;
    }

    try {
      const res = await updateProfileApi({ displayName, username }).unwrap();
      toast.success(res.message || "Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      const res = await changePasswordApi({ currentPassword, newPassword }).unwrap();
      toast.success(res.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to change password.");
    }
  };

  const tokenCostList = [
    {
      service: "Standard Image Generation",
      cost: 10,
      icon: ImageIcon,
      desc: "Flux Schnell high-speed neural render",
    },
    {
      service: "8K UHD Neural Upscaling",
      cost: 5,
      icon: Wand2,
      desc: "Clarity neural 2x super-resolution",
    },
    {
      service: "Background Removal",
      cost: 5,
      icon: Scissors,
      desc: "BiRefNet high-fidelity alpha transparency",
    },
    {
      service: "Video Generation",
      cost: 25,
      icon: Video,
      desc: "Kling text-to-video cinematic camera sweep",
    },
    {
      service: "Text & Prompt Expansion",
      cost: 2,
      icon: FileText,
      desc: "OpenRouter LLM prompt enhancement",
    },
  ];

  return (
    <AppShell title="Account & Settings" subtitleBadge="[ CONFIGURATION ]">
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-orange-500 text-black shadow-xs"
                : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile Identity</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "security"
                ? "bg-orange-500 text-black shadow-xs"
                : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("tokens")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "tokens"
                ? "bg-orange-500 text-black shadow-xs"
                : "bg-[#121215] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white"
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            <span>Token Usage & Logs</span>
          </button>
        </div>

        {/* TAB 1: Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-6 space-y-6 max-w-2xl">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-base font-bold text-white">Creator Profile</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage your public creator identity and account credentials.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="e.g. Elena Rostova"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Username (Handle)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-orange-500/50"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full px-3 py-2 bg-[#18181b]/50 border border-white/5 rounded-lg text-xs text-zinc-400 cursor-not-allowed"
                    />
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      VERIFIED
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 text-xs font-semibold shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isUpdatingProfile ? "Saving..." : "Save Profile"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: Password Reset */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-6 space-y-6 max-w-2xl">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-base font-bold text-white">Change Password</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Protect your account with a secure authentication credential.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 text-xs font-semibold shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-colors disabled:opacity-50"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Token Usage & History */}
        {activeTab === "tokens" && (
          <div className="space-y-6">
            {/* Realtime Balance */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 font-bold">
                  [ REALTIME TOKEN BALANCE ]
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{credits}</span>
                  <span className="text-xs font-mono text-zinc-400">Tokens available</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Tokens are deducted dynamically as you synthesize images and upscale assets.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3.5 py-2.5">
                <Zap className="h-4 w-4 text-orange-400" />
                <div>
                  <div className="text-xs font-bold text-white">Standard Tier Active</div>
                  <div className="text-[10px] text-orange-400 font-mono">100 Starter Tokens Included</div>
                </div>
              </div>
            </div>

            {/* Modality Rates Card */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Modality Generation Rates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tokenCostList.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.service}
                      className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-7 w-7 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          {item.cost} TOKENS
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.service}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Telemetry Logs */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Recent Generation Activity
              </h3>

              {isUsageLoading ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  Loading telemetry logs...
                </div>
              ) : tokenUsageData?.history && tokenUsageData.history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-zinc-500 font-mono uppercase text-[10px]">
                        <th className="py-2.5 pr-4">Artwork / Prompt</th>
                        <th className="py-2.5 px-4">Modality</th>
                        <th className="py-2.5 px-4">Tokens Spent</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 pl-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {tokenUsageData.history.map((row: any) => (
                        <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 pr-4 font-medium text-white max-w-xs truncate">
                            "{row.prompt}"
                          </td>
                          <td className="py-3 px-4 font-mono uppercase text-[11px]">
                            {row.type || "generate"}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-orange-400">
                            -{row.tokensDeducted} Tokens
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {row.status || "completed"}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-zinc-500 font-mono text-[11px]">
                            {new Date(row.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                  No generation records logged yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

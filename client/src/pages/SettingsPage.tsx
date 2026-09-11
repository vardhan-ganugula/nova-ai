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
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
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
  const [displayName, setDisplayName] = useState(user?.displayName || "Vandron");
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
    { service: "Standard Image Generation", cost: 10, icon: ImageIcon, desc: "Flux Schnell high-speed neural render" },
    { service: "8K UHD Neural Upscaling", cost: 5, icon: Wand2, desc: "Fal AI Clarity neural 2x super-resolution" },
    { service: "Background Removal", cost: 5, icon: Scissors, desc: "BiRefNet high-fidelity alpha transparency" },
    { service: "Video Generation", cost: 25, icon: Video, desc: "Kling text-to-video cinematic camera sweep" },
    { service: "Text & Prompt Expansion", cost: 2, icon: FileText, desc: "OpenRouter LLM prompt enhancement" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <div className="flex min-h-screen w-full">
        <DashboardSidebar activeItem="Settings" />

        <div className="flex flex-1 flex-col md:pl-64">
          <DashboardHeader
            title="Account Settings & Telemetry"
            subtitleBadge="[ CONTROL PANEL ]"
            tokens={credits}
          />

          <main className="flex-1 space-y-8 p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "security"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Password & Security</span>
              </button>

              <button
                onClick={() => setActiveTab("tokens")}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "tokens"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Coins className="h-4 w-4" />
                <span>Token Usage & Logs</span>
              </button>
            </div>

            {/* TAB 1: Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your public creator identity and account credentials.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        placeholder="e.g. Elena Rostova"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username (Handle)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          disabled
                          value={user?.email || ""}
                          className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                        />
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl whitespace-nowrap">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Email is linked to your account session and cannot be modified.</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{isUpdatingProfile ? "Saving..." : "Save Profile Changes"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: Password Reset */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Ensure your account is protected with a strong, distinct password.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        placeholder="Re-enter new password"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>{isChangingPassword ? "Updating Password..." : "Update Password"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: Token Usage & History */}
            {activeTab === "tokens" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Available Balance Header */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-purple-700 font-bold">
                      [ REALTIME TOKEN BALANCE ]
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-slate-900">{credits}</span>
                      <span className="text-sm font-mono text-slate-500">Credits available</span>
                    </div>
                    <p className="text-xs text-slate-500">Tokens are deducted dynamically as you generate media and upscale assets.</p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-purple-50 border border-purple-200 px-4 py-3">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-xs font-bold text-purple-900">Standard Tier Active</div>
                      <div className="text-[11px] text-purple-700 font-mono">100 Starter Tokens Included</div>
                    </div>
                  </div>
                </div>

                {/* Service Token Rate Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Modality Generation Rates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokenCostList.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.service} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-600 shadow-xs">
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                              {item.cost} TOKENS
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{item.service}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Generation Logs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Generation Activity</h3>

                  {isUsageLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-mono">Loading telemetry logs...</div>
                  ) : tokenUsageData?.history && tokenUsageData.history.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                            <th className="py-2.5 pr-4">Artwork / Prompt</th>
                            <th className="py-2.5 px-4">Modality</th>
                            <th className="py-2.5 px-4">Tokens Spent</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 pl-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {tokenUsageData.history.map((row: any) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 pr-4 font-medium text-slate-900 max-w-xs truncate">
                                "{row.prompt}"
                              </td>
                              <td className="py-3 px-4 font-mono uppercase text-[11px]">
                                {row.type || "generate"}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-purple-700">
                                -{row.tokensDeducted} Tokens
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {row.status || "completed"}
                                </span>
                              </td>
                              <td className="py-3 pl-4 text-slate-400 font-mono text-[11px]">
                                {new Date(row.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs font-mono">
                      No generation records logged yet. Try generating an artwork!
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

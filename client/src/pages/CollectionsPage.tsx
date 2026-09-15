import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bookmark,
  Plus,
  Sparkles,
  FolderHeart,
  Image as ImageIcon,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useGetUserCollectionsQuery } from "@/store/authSlice";

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { data: collectionsData, isLoading } = useGetUserCollectionsQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const sampleCollections = [
    {
      id: "col-1",
      name: "Cyberpunk Characters",
      count: 14,
      cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      createdAt: "2026-09-10",
    },
    {
      id: "col-2",
      name: "Sci-Fi Environments",
      count: 9,
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      createdAt: "2026-09-12",
    },
    {
      id: "col-3",
      name: "Celestial Guardians",
      count: 6,
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      createdAt: "2026-09-14",
    },
    {
      id: "col-4",
      name: "Solarpunk Architecture",
      count: 8,
      cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      createdAt: "2026-09-15",
    },
  ];

  const collections = collectionsData?.collections?.length
    ? collectionsData.collections
    : sampleCollections;

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    toast.success(`Created collection: "${newCollectionName}"`);
    setNewCollectionName("");
    setShowCreateModal(false);
  };

  return (
    <AppShell title="Collections" subtitleBadge="[ CURATED ALBUMS ]">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Bookmark className="h-6 w-6 text-orange-400" />
              <span>Personal Collections</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Organize your creative concepts, style explorations, and character series into albums.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {collections.map((col: any) => (
            <div
              key={col.id}
              onClick={() => {
                toast(`Opened collection: ${col.name}`);
                navigate("/library");
              }}
              className="group rounded-xl border border-white/[0.08] bg-[#121215] hover:border-orange-500/40 transition-all cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                <img
                  src={col.cover}
                  alt={col.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 right-2.5 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/10">
                  {col.count} items
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-orange-400 transition-colors">
                    {col.name}
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Created {col.createdAt}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Modal for creating collection */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="w-full max-w-md bg-[#121215] border border-white/10 rounded-xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-white">Create New Collection</h3>
              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Collection Name</label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g. Cyberpunk Environments"
                    className="w-full bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

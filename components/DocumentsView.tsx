"use client";

import { useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { createFolder, deleteFolder, renameFolder } from "@/app/actions/folders";
import DocumentCard from "@/components/DocumentCard";
import UploadModal from "@/components/UploadModal";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { Plus, LogOut, Search, X, Check, FolderPlus, Loader2, Pencil } from "lucide-react";

interface Document {
  id: string;
  name: string;
  display_name: string | null;
  storage_path: string;
  folder_id: string | null;
  folderName: string | null;
  size: number;
  mime_type: string;
  created_at: string;
}

interface StoredFolder {
  id: string;
  name: string;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

export default function DocumentsView({
  documents,
  storedFolders,
  userEmail,
}: {
  documents: Document[];
  storedFolders: StoredFolder[];
  userEmail: string;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");

  // Sidebar create-folder state
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  // Folder delete loading state (keyed by folder id)
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);

  // Folder rename state (keyed by folder id)
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderValue, setEditFolderValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const editFolderRef = useRef<HTMLInputElement>(null);

  // storedFolders is now the complete, authoritative folder list
  const docCount = (folderId: string) => documents.filter((d) => d.folder_id === folderId).length;
  const isDeletable = (folderId: string) => docCount(folderId) === 0;

  const filtered = documents.filter((d) => {
    const matchFolder = activeFolder === "all" || d.folderName === activeFolder;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.display_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

  async function handleCreateFolder() {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    setCreateLoading(true);
    setCreateError(null);
    const result = await createFolder(trimmed);
    setCreateLoading(false);
    if (result.error) {
      setCreateError(result.error);
    } else {
      setCreatingFolder(false);
      setNewFolderName("");
      if (result.name) setActiveFolder(result.name);
    }
  }

  function startCreatingFolder() {
    setCreatingFolder(true);
    setNewFolderName("");
    setCreateError(null);
    setTimeout(() => newFolderInputRef.current?.focus(), 0);
  }

  function cancelCreatingFolder() {
    setCreatingFolder(false);
    setNewFolderName("");
    setCreateError(null);
  }

  async function handleDeleteFolder(id: string, name: string) {
    setDeletingFolder(id);
    await deleteFolder(id);
    setDeletingFolder(null);
    if (activeFolder === name) setActiveFolder("all");
  }

  function startEditingFolder(id: string, currentName: string) {
    setEditingFolder(id);
    setEditFolderValue(capitalize(currentName));
    setRenameError(null);
    setTimeout(() => { editFolderRef.current?.focus(); editFolderRef.current?.select(); }, 0);
  }

  async function commitFolderRename(id: string, currentName: string) {
    const trimmed = editFolderValue.trim();
    if (!trimmed) { setEditingFolder(null); return; }
    setRenameLoading(true);
    setRenameError(null);
    const result = await renameFolder(id, trimmed);
    setRenameLoading(false);
    if (result.error) {
      setRenameError(result.error);
    } else {
      setEditingFolder(null);
      // keep activeFolder in sync using the name (activeFolder tracks by name)
      if (activeFolder === currentName && result.name) setActiveFolder(result.name);
    }
  }

  const navItemCls = (active: boolean) =>
    `w-full flex items-center justify-between pl-4 pr-2 py-2 text-sm transition-colors border-l-2 -ml-px group/item ${
      active
        ? "border-violet-500 dark:border-violet-400 text-stone-900 dark:text-zinc-100 font-medium"
        : "border-transparent text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-600"
    }`;

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <header className="bg-white/75 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-stone-200/60 dark:border-zinc-800/50 sticky top-0 z-30 transition-colors">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-semibold text-stone-900 dark:text-zinc-50 text-sm">Family Docs</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="hidden sm:block text-stone-400 dark:text-zinc-500 text-xs mr-2">{userEmail}</span>
            <ThemeToggle />
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 dark:hover:bg-violet-500 text-white text-xs font-medium rounded-lg px-3 py-2 transition ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden md:block w-44 flex-shrink-0">
          <nav className="border-l border-stone-200 dark:border-zinc-800">
            {/* All files */}
            <button
              onClick={() => setActiveFolder("all")}
              className={navItemCls(activeFolder === "all")}
            >
              <span>All files</span>
              {documents.length > 0 && (
                <span className="text-[11px] tabular-nums text-stone-400 dark:text-zinc-600 ml-2">
                  {documents.length}
                </span>
              )}
            </button>

            {/* Folder list — sourced entirely from storedFolders */}
            {storedFolders.map(({ id, name }) =>
              editingFolder === id ? (
                <div key={id} className="pl-4 pr-2 py-1.5 border-l-2 border-violet-500 dark:border-violet-400 -ml-px">
                  <div className="flex items-center gap-1">
                    <input
                      ref={editFolderRef}
                      value={editFolderValue}
                      onChange={(e) => { setEditFolderValue(e.target.value); setRenameError(null); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitFolderRename(id, name);
                        if (e.key === "Escape") setEditingFolder(null);
                      }}
                      className="flex-1 min-w-0 text-sm font-medium text-stone-900 dark:text-zinc-100 bg-transparent focus:outline-none border-b border-violet-400 dark:border-violet-500 pb-px"
                    />
                    <button
                      onClick={() => commitFolderRename(id, name)}
                      disabled={!editFolderValue.trim() || renameLoading}
                      className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-30 transition"
                    >
                      {renameLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Check className="w-3.5 h-3.5" />
                      }
                    </button>
                    <button
                      onClick={() => setEditingFolder(null)}
                      className="text-stone-300 dark:text-zinc-600 hover:text-stone-500 dark:hover:text-zinc-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {renameError && <p className="text-red-400 text-[11px] mt-1">{renameError}</p>}
                </div>
              ) : (
                <button
                  key={id}
                  onClick={() => setActiveFolder(name)}
                  className={navItemCls(activeFolder === name)}
                >
                  <span className="truncate flex-1 text-left">{capitalize(name)}</span>
                  <span className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {docCount(id) > 0 && (
                      <span className="text-[11px] tabular-nums text-stone-400 dark:text-zinc-600">
                        {docCount(id)}
                      </span>
                    )}
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); startEditingFolder(id, name); }}
                      className="opacity-0 group-hover/item:opacity-100 text-stone-300 dark:text-zinc-600 hover:text-violet-500 dark:hover:text-violet-400 transition p-0.5 rounded"
                      title="Rename folder"
                    >
                      <Pencil className="w-3 h-3" />
                    </span>
                    {isDeletable(id) && (
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(id, name); }}
                        className="opacity-0 group-hover/item:opacity-100 text-stone-300 dark:text-zinc-600 hover:text-red-400 dark:hover:text-red-400 transition p-0.5 rounded"
                        title="Delete folder"
                      >
                        {deletingFolder === id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <X className="w-3 h-3" />
                        }
                      </span>
                    )}
                  </span>
                </button>
              )
            )}

            {/* Inline create-folder */}
            {creatingFolder ? (
              <div className="pl-4 pr-2 py-1.5 border-l-2 border-transparent -ml-px">
                <div className="flex items-center gap-1">
                  <input
                    ref={newFolderInputRef}
                    value={newFolderName}
                    onChange={(e) => { setNewFolderName(e.target.value); setCreateError(null); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder();
                      if (e.key === "Escape") cancelCreatingFolder();
                    }}
                    placeholder="folder-name"
                    className="flex-1 min-w-0 text-sm bg-transparent text-stone-800 dark:text-zinc-200 placeholder-stone-300 dark:placeholder-zinc-600 focus:outline-none border-b border-violet-400 dark:border-violet-500 pb-px"
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || createLoading}
                    className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-30 transition"
                  >
                    {createLoading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Check className="w-3.5 h-3.5" />
                    }
                  </button>
                  <button
                    onClick={cancelCreatingFolder}
                    className="text-stone-300 dark:text-zinc-600 hover:text-stone-500 dark:hover:text-zinc-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {createError && (
                  <p className="text-red-400 text-[11px] mt-1">{createError}</p>
                )}
              </div>
            ) : (
              <button
                onClick={startCreatingFolder}
                className="pl-4 pr-2 py-2 border-l-2 border-transparent -ml-px w-full flex items-center gap-1.5 text-xs text-stone-300 dark:text-zinc-600 hover:text-violet-500 dark:hover:text-violet-400 transition"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                New folder
              </button>
            )}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300 dark:text-zinc-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-300 dark:placeholder-zinc-600 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition"
              />
            </div>
            <div className="md:hidden">
              <select
                value={activeFolder}
                onChange={(e) => setActiveFolder(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All files</option>
                {storedFolders.map(({ id, name }) => (
                  <option key={id} value={name}>{capitalize(name)}</option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-stone-400 dark:text-zinc-500 text-sm font-medium">
                {search ? "No results" : "No documents yet"}
              </p>
              {!search && (
                <p className="text-stone-300 dark:text-zinc-600 text-xs mt-1">
                  Upload your first file to get started
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          existingFolders={storedFolders}
        />
      )}
    </div>
  );
}

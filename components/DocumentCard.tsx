"use client";

import { useRef, useState } from "react";
import { deleteDocument, renameDocument } from "@/app/actions/documents";
import {
  FileText, Image, FileArchive, Film, Music, FileSpreadsheet,
  Download, Trash2, Eye, Loader2, Share2, Pencil,
} from "lucide-react";

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

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <Image className="w-4 h-4 text-blue-400" />;
  if (mimeType.startsWith("video/")) return <Film className="w-4 h-4 text-violet-400" />;
  if (mimeType.startsWith("audio/")) return <Music className="w-4 h-4 text-pink-400" />;
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("gzip"))
    return <FileArchive className="w-4 h-4 text-amber-400" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
  return <FileText className="w-4 h-4 text-stone-400 dark:text-zinc-500" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({ doc }: { doc: Document }) {
  const displayName = doc.display_name || doc.name;

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(displayName);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sharing, setSharing] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  function startRename() {
    setRenameValue(displayName);
    setRenaming(true);
    setTimeout(() => { renameRef.current?.focus(); renameRef.current?.select(); }, 0);
  }

  async function commitRename() {
    setRenaming(false);
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === displayName) return;
    await renameDocument(doc.id, trimmed);
  }

  function handleRenameKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = `/api/documents/${doc.id}?dl=1`;
    a.download = displayName;
    a.click();
  }

  function handleView() {
    window.open(`/api/documents/${doc.id}`, "_blank");
  }

  async function handleShare() {
    setSharing(true);
    try {
      const response = await fetch(`/api/documents/${doc.id}`);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const shareFile = new File([blob], displayName, { type: blob.type });
      if (navigator.canShare?.({ files: [shareFile] })) {
        await navigator.share({ files: [shareFile], title: displayName });
      } else {
        handleView();
      }
    } catch {
      // user cancelled or share unsupported — silently fall through
    } finally {
      setSharing(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await deleteDocument(doc.id, doc.storage_path);
  }

  const date = new Date(doc.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const ghostBtn = "flex items-center justify-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-transparent hover:border-violet-200 dark:hover:border-violet-800 rounded-lg py-1.5 transition";
  const iconBtn = "flex items-center justify-center text-stone-300 dark:text-zinc-600 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-transparent hover:border-violet-200 dark:hover:border-violet-800 rounded-lg p-1.5 transition";

  return (
    <div
      className="group bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-xl p-4 hover:border-stone-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
      onMouseLeave={() => setConfirmDelete(false)}
    >
      {/* File icon + name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700 rounded-lg flex items-center justify-center">
          <FileIcon mimeType={doc.mime_type} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          {renaming ? (
            <input
              ref={renameRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKey}
              className="w-full text-sm font-medium text-stone-800 dark:text-zinc-200 bg-transparent border-b border-violet-400 dark:border-violet-500 focus:outline-none pb-px"
            />
          ) : (
            <div className="flex items-start gap-1 group/name">
              <p
                className="text-stone-800 dark:text-zinc-200 font-medium text-sm truncate leading-tight cursor-text"
                title={displayName}
                onClick={startRename}
              >
                {displayName}
              </p>
              <button
                onClick={startRename}
                className="flex-shrink-0 opacity-0 group-hover/name:opacity-100 text-stone-300 dark:text-zinc-600 hover:text-stone-600 dark:hover:text-zinc-300 transition mt-0.5"
                title="Rename"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-stone-400 dark:text-zinc-500 text-xs mt-0.5">
            {formatSize(doc.size)} · {date}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button onClick={handleView} className={`flex-1 ${ghostBtn}`}>
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button onClick={handleDownload} className={`flex-1 ${ghostBtn}`}>
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button onClick={handleShare} disabled={sharing} className={iconBtn} title="Share">
          {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete"
          className={`flex items-center justify-center gap-1 text-xs rounded-lg py-1.5 px-2.5 transition disabled:opacity-40 border ${
            confirmDelete
              ? "text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40"
              : "text-stone-300 dark:text-zinc-600 border-transparent hover:text-red-400 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-stone-200 dark:hover:border-zinc-700"
          }`}
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          {confirmDelete && !deleting && <span>Sure?</span>}
        </button>
      </div>
    </div>
  );
}

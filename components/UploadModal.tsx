"use client";

import { useRef, useState } from "react";
import { uploadDocument } from "@/app/actions/documents";
import { createFolder } from "@/app/actions/folders";
import { Upload, X, Camera } from "lucide-react";

interface Folder {
  id: string;
  name: string;
}

interface Props {
  onClose: () => void;
  existingFolders: Folder[];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function stemName(filename: string) {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

export default function UploadModal({ onClose, existingFolders }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [folderId, setFolderId] = useState(existingFolders[0]?.id ?? "");
  const [newFolderMode, setNewFolderMode] = useState(existingFolders.length === 0);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  function pickFile(picked: File) {
    setFile(picked);
    if (!displayName) setDisplayName(stemName(picked.name));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }

  function handleFolderSelect(value: string) {
    if (value === "__new__") {
      setNewFolderMode(true);
      setNewFolderName("");
      setTimeout(() => folderInputRef.current?.focus(), 0);
    } else {
      setFolderId(value);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    let resolvedFolderId = folderId;

    if (newFolderMode) {
      const result = await createFolder(newFolderName);
      if (result.error) { setError(result.error); setLoading(false); return; }
      resolvedFolderId = result.id!;
    }

    if (!resolvedFolderId) { setError("Please select a folder"); setLoading(false); return; }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", resolvedFolderId);
    formData.append("display_name", displayName.trim());

    const result = await uploadDocument(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  const inputCls = "w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-300 dark:placeholder-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto shadow-xl transition-colors">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Upload document</h2>
          <button onClick={onClose} className="text-stone-300 dark:text-zinc-600 hover:text-stone-600 dark:hover:text-zinc-300 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              dragging ? "border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/20"
              : file    ? "border-stone-300 dark:border-zinc-600 bg-stone-50 dark:bg-zinc-800/40"
                        : "border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600 hover:bg-stone-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <input ref={fileInputRef} type="file" className="hidden"
              onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])} />
            <Upload className={`w-5 h-5 mx-auto mb-2 transition-colors ${dragging ? "text-violet-400 dark:text-violet-500" : "text-stone-300 dark:text-zinc-600"}`} />
            {file ? (
              <div>
                <p className="text-stone-700 dark:text-zinc-200 font-medium text-sm truncate">{file.name}</p>
                <p className="text-stone-400 dark:text-zinc-500 text-xs mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-stone-500 dark:text-zinc-400 text-sm font-medium">Drop a file or click to browse</p>
                <p className="text-stone-300 dark:text-zinc-600 text-xs mt-0.5">Any file type</p>
              </div>
            )}
          </div>

          <button type="button" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
            className="w-full flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 border border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600 rounded-lg py-2.5 transition">
            <Camera className="w-4 h-4" />
            Take a photo
          </button>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1.5">Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Dad's passport" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1.5">Folder</label>
            {newFolderMode ? (
              <div className="flex gap-2">
                <input ref={folderInputRef} type="text" value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. passport, recipes…"
                  className={inputCls + " border-violet-300 dark:border-violet-700"} />
                {existingFolders.length > 0 && (
                  <button type="button" onClick={() => { setNewFolderMode(false); setNewFolderName(""); }}
                    className="flex-shrink-0 p-2 text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-200 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg transition"
                    title="Back to folder list">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <select value={folderId} onChange={(e) => handleFolderSelect(e.target.value)} className={inputCls}>
                {existingFolders.map(({ id, name }) => (
                  <option key={id} value={id}>{capitalize(name)}</option>
                ))}
                {existingFolders.length > 0 && <option disabled>──────────</option>}
                <option value="__new__">+ New folder…</option>
              </select>
            )}
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 text-sm font-medium rounded-lg py-2.5 transition">
              Cancel
            </button>
            <button type="submit"
              disabled={!file || loading || (newFolderMode && !newFolderName.trim()) || (!newFolderMode && !folderId)}
              className="flex-1 bg-violet-600 hover:bg-violet-700 dark:hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2.5 transition">
              {loading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

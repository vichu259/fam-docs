"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File;
  const folderId = formData.get("folder_id") as string;
  const displayName = (formData.get("display_name") as string)?.trim() || null;

  if (!file || file.size === 0) return { error: "No file selected" };
  if (!folderId) return { error: "No folder selected" };

  // Look up folder name for a human-readable storage path
  const { data: folder } = await supabase
    .from("folders")
    .select("name")
    .eq("id", folderId)
    .single();

  const folderName = folder?.name ?? "uploads";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${folderName}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await supabase.from("documents").insert({
    name: file.name,
    display_name: displayName,
    storage_path: storagePath,
    folder_id: folderId,
    size: file.size,
    mime_type: file.type,
    uploaded_by: user.id,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath("/");
  return { success: true };
}

export async function deleteDocument(id: string, storagePath: string) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([storagePath]);

  if (storageError) return { error: storageError.message };

  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (dbError) return { error: dbError.message };

  revalidatePath("/");
  return { success: true };
}

export async function renameDocument(id: string, displayName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("documents")
    .update({ display_name: displayName.trim() || null })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

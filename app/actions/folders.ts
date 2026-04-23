"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function sanitizeFolder(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function createFolder(name: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const sanitized = sanitizeFolder(name);
  if (!sanitized) return { error: "Invalid folder name" };

  const { data, error } = await supabase
    .from("folders")
    .insert({ name: sanitized, created_by: user.id })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Folder already exists" };
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true, id: data.id, name: data.name };
}

export async function renameFolder(id: string, newName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const sanitized = sanitizeFolder(newName);
  if (!sanitized) return { error: "Invalid folder name" };

  const { data, error } = await supabase
    .from("folders")
    .update({ name: sanitized })
    .eq("id", id)
    .select("name")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A folder with that name already exists" };
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true, name: data.name };
}

export async function deleteFolder(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("folder_id", id);

  if (count && count > 0) return { error: "Folder is not empty" };

  const { error } = await supabase.from("folders").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

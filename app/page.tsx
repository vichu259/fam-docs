import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DocumentsView from "@/components/DocumentsView";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: documents }, { data: folders }] = await Promise.all([
    supabase.from("documents").select("*").order("created_at", { ascending: false }),
    supabase.from("folders").select("id, name").order("name"),
  ]);

  const folderMap = new Map((folders ?? []).map((f) => [f.id, f.name]));

  const enrichedDocs = (documents ?? []).map((doc) => ({
    ...doc,
    folderName: doc.folder_id ? (folderMap.get(doc.folder_id) ?? null) : null,
  }));

  return (
    <DocumentsView
      documents={enrichedDocs}
      storedFolders={folders ?? []}
      userEmail={user.email ?? ""}
    />
  );
}

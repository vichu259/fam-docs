import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const download = request.nextUrl.searchParams.get("dl") === "1";

  const { data: doc, error: dbError } = await supabase
    .from("documents")
    .select("name, storage_path, mime_type")
    .eq("id", id)
    .single();

  if (dbError || !doc) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 60);

  if (signError || !signed) {
    return new NextResponse("Could not generate download URL", { status: 500 });
  }

  const fileResponse = await fetch(signed.signedUrl);

  if (!fileResponse.ok) {
    return new NextResponse("Failed to fetch file", { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", doc.mime_type || "application/octet-stream");
  headers.set("Cache-Control", "private, no-store");

  if (download) {
    headers.set("Content-Disposition", `attachment; filename="${doc.name}"`);
  } else {
    headers.set("Content-Disposition", `inline; filename="${doc.name}"`);
  }

  const contentLength = fileResponse.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(fileResponse.body, { headers });
}

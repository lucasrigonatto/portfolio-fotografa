import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getServerEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase";

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unexpected server error." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const place = String(formData.get("place") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const image = formData.get("image");

    if (!title || !category || !place || !description || !(image instanceof File)) {
      return NextResponse.json(
        { error: "Título, categoria, local, descrição e imagem são obrigatórios." },
        { status: 400 },
      );
    }

    const env = getServerEnv();
    const supabase = getSupabaseAdmin();
    const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = slugifyFileName(image.name.replace(/\.[^.]+$/, ""));
    const filePath = `portfolio/${Date.now()}-${baseName}.${extension}`;
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await supabase.storage
      .from(env.storageBucket)
      .upload(filePath, buffer, {
        contentType: image.type || "image/jpeg",
        upsert: false,
      });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const imageUrl = supabase.storage
      .from(env.storageBucket)
      .getPublicUrl(filePath).data.publicUrl;

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert({ title, category, place, description, image_url: imageUrl })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unexpected server error." },
      { status: 500 },
    );
  }
}

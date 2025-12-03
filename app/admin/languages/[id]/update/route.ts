import { NextResponse } from "next/server";
import { updateLanguage } from "@/app/lib/crud/language";

export async function POST(req: Request, ctx: { params?: { id?: string } }) {
  try {
    const form = await req.formData();
    const name = (form.get("name") as string)?.trim();
    const level = form.get("level") as "Beginner" | "Intermediate" | "Advanced";
    const fromForm = (form.get("id") as string) || undefined;
    const fromParams = ctx?.params?.id;
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/languages/[id]/update
    const id = fromParams || fromForm || fromPath;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    if (!name || !level) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await updateLanguage(id, { name, level });

    return NextResponse.redirect(new URL(`/admin/languages/${id}`, req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
  }
}

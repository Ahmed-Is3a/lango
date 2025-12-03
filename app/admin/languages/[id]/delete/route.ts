import { NextResponse } from "next/server";
import { deleteLanguage } from "@/app/lib/crud/language";

export async function POST(req: Request, ctx: { params?: { id?: string } }) {
  try {
    const form = await req.formData().catch(() => null);
    const fromForm = (form?.get("id") as string) || undefined;
    const fromParams = ctx?.params?.id;
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/languages/[id]/delete
    const id = fromParams || fromForm || fromPath;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await deleteLanguage(id);
    return NextResponse.redirect(new URL("/admin/languages", req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete language" }, { status: 500 });
  }
}

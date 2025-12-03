import { NextResponse } from "next/server";
import { updateLesson } from "@/app/lib/crud/lesson";

export async function POST(req: Request, ctx: { params?: { id?: string } }) {
  try {
    const form = await req.formData();
    const fromForm = (form.get("id") as string) || undefined;
    const fromParams = ctx?.params?.id;
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/lessons/[id]/update
    const id = fromParams || fromForm || fromPath;

    const title = (form.get("title") as string) || "";
    const description = (form.get("description") as string) || "";
    const content = (form.get("content") as string) || "";
    const languageId = (form.get("languageId") as string) || undefined;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!title || !description || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await updateLesson(id, { title, description, content, ...(languageId ? { languageId } as any : {}) });
    return NextResponse.redirect(new URL(`/admin/lessons/${id}`, req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}

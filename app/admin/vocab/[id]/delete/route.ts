import { NextResponse } from "next/server";
import { deleteVocabulary } from "@/app/lib/crud/vocabulary";
import { getLessonById } from "@/app/lib/crud/lesson";

export async function POST(req: Request, ctx: { params?: { id?: string } }) {
  try {
    const form = await req.formData().catch(() => null);
    const fromForm = (form?.get("id") as string) || undefined;
    const id = ctx?.params?.id || fromForm;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Find lesson id before delete to redirect back
    const vocabLesson = await (async () => {
      try {
        const url = new URL(req.url);
        // we don't have a direct fetch by vocab id to lesson, so we'll delete then redirect to referer fallback
      } catch {}
      return null as any;
    })();

    const referer = (req.headers as any).get?.("referer") || undefined;
    await deleteVocabulary(id);
    if (referer) return NextResponse.redirect(referer);
    return NextResponse.redirect(new URL("/admin/lessons", req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete vocabulary" }, { status: 500 });
  }
}

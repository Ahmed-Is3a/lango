import { NextResponse } from "next/server";
import { createVocabulary } from "@/app/lib/crud/vocabulary";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const lessonId = (form.get("lessonId") as string) || "";
    const term = (form.get("term") as string) || "";
    const definition = (form.get("definition") as string) || "";

    if (!lessonId || !term || !definition) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await createVocabulary({ lessonId, term, definition });
    return NextResponse.redirect(new URL(`/admin/lessons/${lessonId}`, req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to create vocabulary" }, { status: 500 });
  }
}

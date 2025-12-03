import { NextResponse } from "next/server";
import { createLesson } from "@/app/lib/crud/lesson";

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(async () => {
      // Allow URL-encoded bodies too
      const text = await req.text();
      return new URLSearchParams(text);
    });

    const languageId = (form.get("languageId") as string) || (form as any).get?.("languageId");
    const title = (form.get("title") as string) || (form as any).get?.("title");
    const description = (form.get("description") as string) || (form as any).get?.("description");
    const content = (form.get("content") as string) || (form as any).get?.("content");

    if (!languageId || !title || !description || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await createLesson({ languageId, title, description, content });
    return NextResponse.redirect(new URL("/admin/lessons", req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}

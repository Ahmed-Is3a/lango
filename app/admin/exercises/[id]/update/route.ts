import { NextResponse } from "next/server";
import { updateExercise } from "@/app/lib/crud/exercise";

export async function POST(req: Request, ctx: { params?: { id?: string } }) {
  try {
    const form = await req.formData();
    const fromForm = (form.get("id") as string) || undefined;
    const fromParams = ctx?.params?.id;
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/exercises/[id]/update
    const id = fromParams || fromForm || fromPath;

    const prompt = (form.get("prompt") as string) || "";
    const type = (form.get("type") as "mcq" | "fill") || "mcq";
    const optionsStr = (form.get("options") as string) || "";
    const answer = (form.get("answer") as string) || "";
    const lessonId = (form.get("lessonId") as string) || undefined;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!prompt || !answer) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await updateExercise(id, {
      prompt,
      type,
      options: optionsStr,
      answer,
      ...(lessonId ? ({ lessonId } as any) : {}),
    });
    return NextResponse.redirect(new URL(`/admin/exercises/${id}`, req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

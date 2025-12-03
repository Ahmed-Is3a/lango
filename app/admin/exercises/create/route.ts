import { NextResponse } from "next/server";
import { createExercise } from "@/app/lib/crud/exercise";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const lessonId = params.get("lessonId") || "";
    const type = (params.get("type") as "mcq" | "fill") || "mcq";
    const prompt = params.get("prompt") || "";
    const options = params.get("options") || ""; // stored as string or JSON depending on schema
    const answer = params.get("answer") || "";

    if (!lessonId || !prompt || !answer) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await createExercise({ lessonId, type, prompt, options, answer } as any);
    return NextResponse.redirect(new URL("/admin/exercises", req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}

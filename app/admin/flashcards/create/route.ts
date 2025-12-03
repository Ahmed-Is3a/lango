import { NextResponse } from "next/server";
import { createFlashcard } from "@/app/lib/crud/flashcard";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const languageId = params.get("languageId") || "";
    const term = params.get("term") || "";
    const definition = params.get("definition") || "";

    if (!languageId || !term || !definition) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await createFlashcard({ languageId, term, definition });
    return NextResponse.redirect(new URL("/admin/flashcards", req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to create flashcard" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { updateFlashcard } from "@/app/lib/crud/flashcard";

export async function POST(req: Request, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const form = await req.formData();
    const fromForm = (form.get("id") as string) || undefined;
    const { id: fromParams } = (await params) || {} as any;
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/flashcards/[id]/update
    const id = fromParams || fromForm || fromPath;

    const term = (form.get("term") as string) || "";
    const definition = (form.get("definition") as string) || "";
    const languageId = (form.get("languageId") as string) || undefined;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!term || !definition) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await updateFlashcard(id, { term, definition, ...(languageId ? ({ languageId } as any) : {}) });
    return NextResponse.redirect(new URL(`/admin/flashcards/${id}`, req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to update flashcard" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { deleteFlashcard } from "@/app/lib/crud/flashcard";

export async function POST(req: Request, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const form = await req.formData().catch(() => null);
    const fromForm = (form?.get("id") as string) || undefined;
    const { id: fromParams } = (await params) || {} as any;
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/flashcards/[id]/delete
    const id = fromParams || fromForm || fromPath;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteFlashcard(id);
    return NextResponse.redirect(new URL("/admin/flashcards", req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete flashcard" }, { status: 500 });
  }
}

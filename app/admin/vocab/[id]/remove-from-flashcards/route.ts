import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(req: Request, ctx: { params?: { id?: string } }) {
  try {
    const form = await req.formData().catch(() => null);
    const fromForm = (form?.get("id") as string) || undefined;
    const vocabId = ctx?.params?.id || fromForm;
    if (!vocabId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const vocab = await prisma.vocabulary.findUnique({
      where: { id: vocabId },
      include: { lesson: true },
    });
    if (!vocab) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const fc = await prisma.flashcard.findFirst({ where: { languageId: vocab.lesson.languageId, term: vocab.term } });
    if (fc) {
      await prisma.flashcard.delete({ where: { id: fc.id } });
    }

    const referer = (req.headers as any).get?.("referer") || undefined;
    if (referer) return NextResponse.redirect(referer);
    return NextResponse.redirect(new URL(`/admin/lessons/${vocab.lessonId}`, req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to remove from flashcards" }, { status: 500 });
  }
}

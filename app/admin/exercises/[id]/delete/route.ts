import { NextResponse } from "next/server";
import { deleteExercise } from "@/app/lib/crud/exercise";

export async function POST(req: Request, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const form = await req.formData().catch(() => null);
    const fromForm = (form?.get("id") as string) || undefined;
    const { id: fromParams } = (await params) || {} as any;
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/exercises/[id]/delete
    const id = fromParams || fromForm || fromPath;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteExercise(id);
    return NextResponse.redirect(new URL("/admin/exercises", req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { updateLesson } from "@/app/lib/crud/lesson";

// Next.js 16: params is a Promise and must be awaited
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }  // Ensure id is required, not optional
) {
  try {
    // Parse form data
    const form = await req.formData();
    const fromForm = (form.get("id") as string) || undefined;
    
    // Await the params promise
    const { id: fromParams } = await ctx.params;
    
    // Extract ID from URL if not provided in form or params
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const fromPath = parts.length >= 4 ? parts[3] : undefined; // /admin/lessons/[id]/update
    const id = fromParams || fromForm || fromPath;

    // Extract other fields from form
    const title = (form.get("title") as string) || "";
    const description = (form.get("description") as string) || "";
    const content = (form.get("content") as string) || "";
    const languageId = (form.get("languageId") as string) || undefined;

    // Validate required fields
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!title || !description || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Update the lesson
    await updateLesson(id, { title, description, content, ...(languageId ? { languageId } : {}) });
    
    // Redirect to the updated lesson page
    return NextResponse.redirect(new URL(`/admin/lessons/${id}`, req.url));
  } catch (e) {
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}

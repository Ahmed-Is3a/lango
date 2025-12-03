import { NextResponse } from "next/server";
import { getAllLessons } from "@/app/lib/crud/lesson";

export async function GET() {
  try {
    const lessons = await getAllLessons();
    return NextResponse.json(lessons.map((l: any) => ({ id: l.id, title: l.title })));
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

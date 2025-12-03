import { NextResponse } from "next/server";
import { createLanguage, getAllLanguages } from "@/app/lib/crud/language";

export async function GET() {
  const data = await getAllLanguages();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await createLanguage(body);
  return NextResponse.json(created);
}

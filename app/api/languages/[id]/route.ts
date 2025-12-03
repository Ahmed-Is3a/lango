import { NextResponse } from "next/server";
import {
  getLanguageById,
  updateLanguage,
  deleteLanguage,
} from "@/app/lib/crud/language";

export async function GET(_: any, { params }: any) {
  try {
    const language = await getLanguageById(params.id);
    
    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }
    
    return NextResponse.json(language);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch language" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const data = await req.json();
    const updatedLanguage = await updateLanguage(params.id, data);
    
    if (!updatedLanguage) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    return NextResponse.json(updatedLanguage);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
  }
}

export async function DELETE(_: any, { params }: any) {
  try {
    const language = await deleteLanguage(params.id);

    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Return 204 (No Content) status to indicate successful deletion with no content in the response body
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete language" }, { status: 500 });
  }
}

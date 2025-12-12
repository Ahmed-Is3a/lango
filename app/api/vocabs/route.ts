import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma'
import getSupabaseClient from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET() {
  try {
    const vocabularies = await prisma.vocabulary.findMany({
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(vocabularies), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err, message: "Failed to fetch vocab" }), {
      status: 500,
    });
  }
}



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { term, definition, language, exampleGerman, exampleEnglish } = body;

    if (!term || !definition || !language) {
      return NextResponse.json(
        { error: "term, definition, and language are required" },
        { status: 400 }
      );
    }

    const vocab = await prisma.vocabulary.create({
      data: {
        term,
        definition,
        language,
      },
    });

    return NextResponse.json(vocab, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create vocabulary" },
      { status: 500 }
    );
  }
}





export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, term, definition, language, exampleGerman, exampleEnglish } = body || {};
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('vocabularies')
        .update({
          term,
          definition,
          language,
          // optional examples
          exampleGerman: exampleGerman ?? null,
          exampleEnglish: exampleEnglish ?? null,
        })
        .eq('id', id)
        .select('id, term, definition, language, exampleGerman, exampleEnglish, created_at')
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      const updated = {
        id: Number(data!.id),
        term: data!.term,
        definition: data!.definition,
        language: data!.language,
        exampleGerman: data!.exampleGerman ?? null,
        exampleEnglish: data!.exampleEnglish ?? null,
        createdAt: data!.created_at,
      };
      return Response.json({ data: updated });
    } else {
      const updated = await prisma.vocabulary.update({
        where: { id: Number(id) },
        data: {
          term,
          definition,
          language,
        },
      });
      return Response.json({ data: updated });
    }
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

import { NextResponse } from "next/server";


export async function DELETE(req: Request) {
  try {
    // Expect query parameter: /api/vocabulary?id=1
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "id must be a number" }, { status: 400 });
    }

    const deleted = await prisma.vocabulary.delete({
      where: { id },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete vocabulary" }, { status: 500 });
  }
}

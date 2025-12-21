import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic';


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

    // Support both single object and array of objects
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ error: "No items provided" }, { status: 400 });
      }

      const data = body.map((item) => {
        const { term, definition, language, exampleGerman, exampleEnglish } = item || {};
        if (!term || !definition || !language) {
          throw new Error("Each item requires term, definition, and language");
        }
        return {
          term,
          definition,
          language,
          exampleGerman: exampleGerman ?? null,
          exampleEnglish: exampleEnglish ?? null,
        };
      });

      const result = await prisma.vocabulary.createMany({ data, skipDuplicates: true });
      return NextResponse.json({ count: result.count }, { status: 201 });
    }

    const { term, definition, language, exampleGerman, exampleEnglish, imageUrl } = body;

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
        // optional examples; store null when not provided
        exampleGerman: exampleGerman ?? null,
        exampleEnglish: exampleEnglish ?? null,
        imageUrl: imageUrl ?? null
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

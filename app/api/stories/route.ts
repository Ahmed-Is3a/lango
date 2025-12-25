import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(stories), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err, message: "Failed to fetch stories" }), {
      status: 500,
    });
  }
}



export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, content, slug, translation } = body;

    const story = await prisma.story.create({
      data: {
        title,
        content,
        slug,
        translation,
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err, message: "Failed to create story" },
      { status: 500 }
    );
  }
}


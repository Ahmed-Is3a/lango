import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const id = url.searchParams.get('id') ? Number(url.searchParams.get('id')) : null;
  const levelId = url.searchParams.get('levelId') ? Number(url.searchParams.get('levelId')) : null;
  const levelSlug = url.searchParams.get('levelSlug');

  if (slug || id) {
    const lesson = await prisma.lesson.findUnique({
      where: slug ? { slug } : { id: id! },
      include: { level: true },
    });
    return NextResponse.json(lesson, { status: lesson ? 200 : 404 });
  }

  const where: any = {};
  if (levelId) where.levelId = levelId;
  if (levelSlug) {
    const level = await prisma.level.findUnique({ where: { slug: levelSlug } });
    where.levelId = level?.id ?? -1;
  }

  const lessons = await prisma.lesson.findMany({
    where,
    orderBy: [{ levelId: 'asc' }, { order: 'asc' }],
  });
  return NextResponse.json(lessons);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { slug, title, levelId, language, levelTag, order, blocks } = body;
  if (!levelId) {
    return NextResponse.json({ error: 'levelId is required' }, { status: 400 });
  }
  if (!Array.isArray(blocks)) {
    return NextResponse.json({ error: 'blocks must be an array' }, { status: 400 });
  }
  
  const existingLesson = await prisma.lesson.findUnique({ where: { slug } });
  if (existingLesson) {
    return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
  }
  
  const lesson = await prisma.lesson.create({
    data: { slug, title, levelId, language, levelTag, order, blocks },
  });
  return NextResponse.json(lesson, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, slug, ...data } = body;
  if (data.blocks && !Array.isArray(data.blocks)) {
    return NextResponse.json({ error: 'blocks must be an array' }, { status: 400 });
  }
  const where = id ? { id } : { slug };
  const lesson = await prisma.lesson.update({ where, data });
  return NextResponse.json(lesson);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') ? Number(url.searchParams.get('id')) : null;
  const slug = url.searchParams.get('slug');
  const where = id ? { id } : { slug: slug! };
  const lesson = await prisma.lesson.delete({ where });
  return NextResponse.json(lesson);
}

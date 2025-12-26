import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const id = url.searchParams.get('id') ? Number(url.searchParams.get('id')) : null;

  if (slug || id) {
    const level = await prisma.level.findUnique({
      where: slug ? { slug } : { id: id! },
      include: { _count: { select: { lessons: true } } },
    });
    return NextResponse.json(level, { status: level ? 200 : 404 });
  }

  const levels = await prisma.level.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { lessons: true } } },
  });
  return NextResponse.json(levels);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { slug, title, description, order } = body;
  const level = await prisma.level.create({ data: { slug, title, description, order } });
  return NextResponse.json(level, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, slug, ...data } = body;
  const where = id ? { id } : { slug };
  const level = await prisma.level.update({ where, data });
  return NextResponse.json(level);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') ? Number(url.searchParams.get('id')) : null;
  const slug = url.searchParams.get('slug');
  const where = id ? { id } : { slug: slug! };
  const level = await prisma.level.delete({ where });
  return NextResponse.json(level);
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await prisma.vocabulary.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json({ data: items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { term, definition, language } = body || {};
    if (!term || !definition || !language) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }
    const created = await prisma.vocabulary.create({ data: { term, definition, language } });
    return Response.json({ data: created }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, term, definition, language } = body || {};
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const updated = await prisma.vocabulary.update({ where: { id: Number(id) }, data: { term, definition, language } });
    return Response.json({ data: updated });
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    await prisma.vocabulary.delete({ where: { id: Number(id) } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import { NextRequest } from 'next/server';
import { listVocabs, createVocab, updateVocab, deleteVocab } from '@/lib/vocab';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = listVocabs(200);
  return Response.json({ data: items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { term, definition, language } = body || {};

    if (!term || !definition || !language) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const created = createVocab({ term, definition, language });
    return Response.json({ data: created }, { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, term, definition, language } = body || {};
    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 });
    }
    const updated = updateVocab(Number(id), { term, definition, language });
    if (!updated) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json({ data: updated });
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 });
    }
    const ok = deleteVocab(Number(id));
    if (!ok) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

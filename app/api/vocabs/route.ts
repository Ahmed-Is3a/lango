import { NextRequest } from 'next/server';
import { listVocabs, createVocab } from '@/lib/vocab';

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

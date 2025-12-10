import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'
import getSupabaseClient from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('id, term, definition, language, created_at')
      .order('created_at', { ascending: false });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const mapped = (data || []).map((r: any) => ({
      id: Number(r.id),
      term: r.term,
      definition: r.definition,
      language: r.language,
      createdAt: r.created_at,
    }));
    return Response.json({ data: mapped });
  } else {
    const items = await prisma.vocabulary.findMany({ orderBy: { createdAt: 'desc' } });
    return Response.json({ data: items });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { term, definition, language } = body || {};
    if (!term || !definition || !language) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('vocabularies')
        .insert({ term, definition, language })
        .select('id, term, definition, language, created_at')
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      const created = { id: Number(data!.id), term: data!.term, definition: data!.definition, language: data!.language, createdAt: data!.created_at };
      return Response.json({ data: created }, { status: 201 });
    } else {
      const created = await prisma.vocabulary.create({ data: { term, definition, language } });
      return Response.json({ data: created }, { status: 201 });
    }
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, term, definition, language } = body || {};
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('vocabularies')
        .update({ term, definition, language })
        .eq('id', id)
        .select('id, term, definition, language, created_at')
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      const updated = { id: Number(data!.id), term: data!.term, definition: data!.definition, language: data!.language, createdAt: data!.created_at };
      return Response.json({ data: updated });
    } else {
      const updated = await prisma.vocabulary.update({ where: { id: Number(id) }, data: { term, definition, language } });
      return Response.json({ data: updated });
    }
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('vocabularies').delete().eq('id', id);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ success: true });
    } else {
      await prisma.vocabulary.delete({ where: { id: Number(id) } });
      return Response.json({ success: true });
    }
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

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
      include: { level: true, vocabularies: true },
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
    include: { vocabularies: true },
    orderBy: [{ levelId: 'asc' }, { order: 'asc' }],
  });
  return NextResponse.json(lessons);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { slug, title, levelId, language, levelTag, order, blocks, vocabularyIds, status = 'draft' } = body;
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

  // Resolve vocabulary blocks: use `terms` to find or create vocabulary, then fill `vocabIds`
  const lessonLanguage = language ?? 'de';
  const allTermsSet = new Set<string>();
  (blocks as any[]).forEach((b) => {
    if (b && b.type === 'vocabulary' && Array.isArray(b.terms)) {
      b.terms.forEach((t: string) => {
        if (typeof t === 'string' && t.trim()) allTermsSet.add(t.trim());
      });
    }
  });

  let termToId: Record<string, number> = {};
  if (allTermsSet.size > 0) {
    const allTerms = Array.from(allTermsSet);
    const existing = await prisma.vocabulary.findMany({
      where: { term: { in: allTerms }, language: lessonLanguage },
      select: { id: true, term: true },
    });
    termToId = Object.fromEntries(existing.map((v) => [v.term, v.id]));

    const missing = allTerms.filter((t) => termToId[t] === undefined);
    if (missing.length > 0) {
      // Create missing vocab with default definition equal to term
      await prisma.vocabulary.createMany({
        data: missing.map((t) => ({ term: t, definition: t, language: lessonLanguage })),
        skipDuplicates: true,
      });
      const refreshed = await prisma.vocabulary.findMany({
        where: { term: { in: allTerms }, language: lessonLanguage },
        select: { id: true, term: true },
      });
      termToId = Object.fromEntries(refreshed.map((v) => [v.term, v.id]));
    }
  }

  const resolvedBlocks = (blocks as any[]).map((b) => {
    if (!b || b.type !== 'vocabulary') return b;
    const hasIds = Array.isArray(b.vocabIds) && b.vocabIds.length > 0;
    const terms: string[] | undefined = Array.isArray(b.terms) ? b.terms : undefined;
    if (!hasIds && terms && terms.length > 0) {
      const ids = terms
        .map((t) => termToId[t.trim()])
        .filter((id): id is number => typeof id === 'number');
      return { ...b, vocabIds: Array.from(new Set(ids)), terms: undefined };
    }
    return b;
  });

  const blockVocabIds: number[] = resolvedBlocks
    .filter((b: any) => b && b.type === 'vocabulary' && Array.isArray(b.vocabIds))
    .flatMap((b: any) => b.vocabIds)
    .filter((id: any) => typeof id === 'number');
  
  const lesson = await prisma.lesson.create({
    data: {
      slug,
      title,
      levelId,
      language,
      levelTag,
      status,
      order,
      blocks: resolvedBlocks,
      vocabularies: (vocabularyIds && Array.isArray(vocabularyIds))
        ? { connect: vocabularyIds.map((id: number) => ({ id })) }
        : (blockVocabIds.length > 0
          ? { connect: Array.from(new Set(blockVocabIds)).map((id: number) => ({ id })) }
          : undefined),
    },
    include: { vocabularies: true },
  });
  return NextResponse.json(lesson, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, slug, vocabularyIds, ...data } = body;
  if (data.blocks && !Array.isArray(data.blocks)) {
    return NextResponse.json({ error: 'blocks must be an array' }, { status: 400 });
  }
  
  const where = id ? { id } : { slug };
  
  // Resolve vocabulary blocks using `terms`: find or create, then set ids
  if (Array.isArray(data.blocks)) {
    const lessonLanguage = (data.language as string | undefined) ?? 'de';
    const allTermsSet = new Set<string>();
    (data.blocks as any[]).forEach((b) => {
      if (b && b.type === 'vocabulary' && Array.isArray(b.terms)) {
        b.terms.forEach((t: string) => {
          if (typeof t === 'string' && t.trim()) allTermsSet.add(t.trim());
        });
      }
    });

    let termToId: Record<string, number> = {};
    if (allTermsSet.size > 0) {
      const allTerms = Array.from(allTermsSet);
      const existing = await prisma.vocabulary.findMany({
        where: { term: { in: allTerms }, language: lessonLanguage },
        select: { id: true, term: true },
      });
      termToId = Object.fromEntries(existing.map((v) => [v.term, v.id]));

      const missing = allTerms.filter((t) => termToId[t] === undefined);
      if (missing.length > 0) {
        await prisma.vocabulary.createMany({
          data: missing.map((t) => ({ term: t, definition: t, language: lessonLanguage })),
          skipDuplicates: true,
        });
        const refreshed = await prisma.vocabulary.findMany({
          where: { term: { in: allTerms }, language: lessonLanguage },
          select: { id: true, term: true },
        });
        termToId = Object.fromEntries(refreshed.map((v) => [v.term, v.id]));
      }
    }

    const resolvedBlocks = (data.blocks as any[]).map((b) => {
      if (!b || b.type !== 'vocabulary') return b;
      const hasIds = Array.isArray(b.vocabIds) && b.vocabIds.length > 0;
      const terms: string[] | undefined = Array.isArray(b.terms) ? b.terms : undefined;
      if (!hasIds && terms && terms.length > 0) {
        const ids = terms
          .map((t) => termToId[t.trim()])
          .filter((id): id is number => typeof id === 'number');
        return { ...b, vocabIds: Array.from(new Set(ids)), terms: undefined };
      }
      return b;
    });
    data.blocks = resolvedBlocks;

    // If vocabularyIds not provided, sync relation from blocks
    if (vocabularyIds === undefined) {
      const blockVocabIds: number[] = (data.blocks as any[])
        .filter((b: any) => b && b.type === 'vocabulary' && Array.isArray(b.vocabIds))
        .flatMap((b: any) => b.vocabIds)
        .filter((id: any) => typeof id === 'number');
      data.vocabularies = {
        set: Array.from(new Set(blockVocabIds)).map((id: number) => ({ id })),
      };
    }
  }

  // If vocabularyIds provided explicitly, override relation
  if (vocabularyIds !== undefined) {
    data.vocabularies = {
      set: Array.isArray(vocabularyIds) ? vocabularyIds.map((id: number) => ({ id })) : [],
    };
  }
  
  const lesson = await prisma.lesson.update({
    where,
    data,
    include: { vocabularies: true },
  });
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

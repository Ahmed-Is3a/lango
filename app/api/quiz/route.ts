import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Casted to allow use before prisma generate has been run after schema update.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = prisma;

type IncomingQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
};

const normalizeQuestion = (item: unknown): IncomingQuestion => {
  if (!item || typeof item !== 'object') {
    throw new Error('Invalid question payload');
  }
  const { question, options, correctAnswer, explanation } = item as Record<string, unknown>;
  if (typeof question !== 'string' || !Array.isArray(options) || options.length === 0 || typeof correctAnswer !== 'number') {
    throw new Error('question, options (non-empty array), and correctAnswer are required');
  }
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    throw new Error('correctAnswer index must be within options bounds');
  }
  return {
    question,
    options: options.map(String),
    correctAnswer,
    explanation: explanation === undefined ? null : (explanation as string),
  };
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const questions = await db.quizQuestion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(questions, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch quiz questions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Array support for bulk seed
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
      }
      const data = body.map(normalizeQuestion);
      const created = await db.quizQuestion.createMany({ data, skipDuplicates: true });
      return NextResponse.json({ count: created.count }, { status: 201 });
    }

    const data = normalizeQuestion(body);
    const created = await db.quizQuestion.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Failed to create quiz question';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

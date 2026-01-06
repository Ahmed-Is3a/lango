import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Casted to allow use before prisma generate has been run after schema update.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = prisma;

type MCQData = {
  question: string | { text: string; imageUrl?: string };
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type TrueFalseData = {
  question: string;
  correctAnswer: boolean;
  explanation?: string;
};

type FillInTheBlankData = {
  text: string;
  answers: string[];
  wordOptions?: string[];
  hints?: string[];
};

type MatchingData = {
  title?: string;
  pairs: Array<{ left: string; right: string }>;
};

const validateMCQ = (data: any): MCQData => {
  if (!data || typeof data !== 'object') throw new Error('Invalid MCQ data');
  const { question, options, correctAnswer, explanation } = data;
  if (!question || !Array.isArray(options) || options.length === 0 || typeof correctAnswer !== 'number') {
    throw new Error('MCQ requires: question (string or {text, imageUrl}), options (non-empty array), correctAnswer');
  }
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    throw new Error('correctAnswer must be within options range');
  }
  return {
    question: typeof question === 'string' ? question : (question as { text: string; imageUrl?: string }),
    options: options.map(String),
    correctAnswer,
    explanation,
  };
};

const validateTrueFalse = (data: any): TrueFalseData => {
  if (!data || typeof data !== 'object') throw new Error('Invalid True/False data');
  const { question, correctAnswer, explanation } = data;
  if (typeof question !== 'string' || typeof correctAnswer !== 'boolean') {
    throw new Error('True/False requires: question (string), correctAnswer (boolean)');
  }
  return { question, correctAnswer, explanation };
};

const validateFillInTheBlank = (data: any): FillInTheBlankData => {
  if (!data || typeof data !== 'object') throw new Error('Invalid Fill-in-the-blank data');
  const { text, answers, wordOptions, hints } = data;
  if (typeof text !== 'string' || !Array.isArray(answers)) {
    throw new Error('Fill-in-the-blank requires: text (string with ___), answers (array)');
  }
  const blanksCount = (text.match(/___/g) || []).length;
  if (blanksCount === 0) throw new Error('text must contain at least one blank (___)')
  if (answers.length !== blanksCount) {
    throw new Error(`answers array must match blank count (${blanksCount})`);
  }
  return {
    text,
    answers: answers.map(String),
    wordOptions: Array.isArray(wordOptions) ? wordOptions.map(String) : [],
    hints: Array.isArray(hints) ? hints.map(String) : [],
  };
};

const validateMatching = (data: any): MatchingData => {
  if (!data || typeof data !== 'object') throw new Error('Invalid Matching data');
  const { title, pairs } = data;
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error('Matching requires: pairs (non-empty array of {left, right})');
  }
  pairs.forEach((pair, idx) => {
    if (!pair.left || !pair.right) throw new Error(`Pair ${idx + 1} must have left and right values`);
  });
  return {
    title: typeof title === 'string' ? title : '',
    pairs: pairs.map((p) => ({ left: String(p.left), right: String(p.right) })),
  };
};

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const type = searchParams.get('type');
    const tags = searchParams.get('tags');

    const where: any = {};
    if (level && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) {
      where.level = level;
    }
    if (type && ['MCQ', 'TRUE_FALSE', 'FILL_IN_THE_BLANK', 'MATCHING'].includes(type)) {
      where.type = type;
    }
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagList };
    }

    const questions = await db.quizQuestion.findMany({
      where,
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
      const questions = body.map((item) => {
        const type = item.type?.toUpperCase() || 'MCQ';
        if (!['MCQ', 'TRUE_FALSE', 'FILL_IN_THE_BLANK', 'MATCHING'].includes(type)) {
          throw new Error(`Invalid type: ${type}`);
        }

        let data;
        switch (type) {
          case 'MCQ':
            data = validateMCQ(item.data);
            break;
          case 'TRUE_FALSE':
            data = validateTrueFalse(item.data);
            break;
          case 'FILL_IN_THE_BLANK':
            data = validateFillInTheBlank(item.data);
            break;
          case 'MATCHING':
            data = validateMatching(item.data);
            break;
          default:
            throw new Error(`Unknown type: ${type}`);
        }

        return {
          type,
          data,
          level: item.level?.toUpperCase() || 'A1',
          tags: Array.isArray(item.tags) ? item.tags : [],
        };
      });

      const created = await db.quizQuestion.createMany({ data: questions, skipDuplicates: true });
      return NextResponse.json({ count: created.count }, { status: 201 });
    }

    const type = body.type?.toUpperCase() || 'MCQ';
    if (!['MCQ', 'TRUE_FALSE', 'FILL_IN_THE_BLANK', 'MATCHING'].includes(type)) {
      return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
    }

    let data;
    switch (type) {
      case 'MCQ':
        data = validateMCQ(body.data);
        break;
      case 'TRUE_FALSE':
        data = validateTrueFalse(body.data);
        break;
      case 'FILL_IN_THE_BLANK':
        data = validateFillInTheBlank(body.data);
        break;
      case 'MATCHING':
        data = validateMatching(body.data);
        break;
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    const created = await db.quizQuestion.create({
      data: {
        type,
        data,
        level: body.level?.toUpperCase() || 'A1',
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Failed to create quiz question';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

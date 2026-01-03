import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import LessonRenderer from '@/app/lessons/LessonRenderer';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export default async function LessonPage({ params }: Params) {
  const slug = (await params).slug;
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: { level: true, vocabularies: true },
  });
  if (!lesson) notFound();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">

      <div className="container mx-auto p-4 md:px-6 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {lesson.levelTag}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Level: {lesson.level?.title} • Language: {lesson.language}
          </p>
          <LessonRenderer blocks={lesson.blocks as any} />
      </div>

    </main>
  );
}

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export default async function LevelPage({ params }: Params) {
  const slug = (await params).slug;
  const level = await prisma.level.findUnique({ where: { slug } });
  if (!level) notFound();

  const lessons = await prisma.lesson.findMany({
    where: { levelId: level.id },
    orderBy: { order: 'asc' },
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
        {level.description && <p className="text-gray-600 dark:text-gray-400 mb-6">{level.description}</p>}
        <div className="space-y-3">
          {lessons.map(lesson => (
            <Link key={lesson.slug} href={`/lessons/${lesson.slug}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md">
                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                <div className="text-sm text-gray-500">Order: {lesson.order} • Lang: {lesson.language} • {lesson.levelTag}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

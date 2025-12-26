'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Level = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  order: number;
  _count?: { lessons: number };
};

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/levels');
      const data = await res.json();
      setLevels(data ?? []);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Levels</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levels.map(l => (
            <Link key={l.slug} href={`/levels/${l.slug}`} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md">
                <h2 className="text-xl font-semibold group-hover:text-indigo-600">{l.title}</h2>
                {l.description && <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{l.description}</p>}
                <div className="text-sm mt-2 text-gray-500">{l._count?.lessons ?? 0} lessons</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState } from 'react';
import LessonRenderer from '@/app/lessons/LessonRenderer';
import { getLessonFromDB, saveLessonToDB } from '@/lib/indexeddb';

interface Lesson {
  id: number;
  slug: string;
  title: string;
  levelTag: string;
  language: string;
  blocks: any;
  level?: {
    title: string;
  };
  vocabularies?: any[];
}


type Params = { params: Promise<{ slug: string }> };


export default  function LessonPageClient({params}: Params) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
    const slug = (await params).slug;
      try {
        // First, try to get from IndexedDB
        const cachedLesson = await getLessonFromDB(slug);
        
        if (cachedLesson) {
          console.log('Loaded lesson from IndexedDB');
          setLesson(cachedLesson as Lesson);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        console.log('Fetching lesson from API');
        const response = await fetch(`/api/lessons?slug=${slug}`);
        
        if (!response.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (!data) {
          setError(true);
          setLoading(false);
          return;
        }

        // Save to IndexedDB for future use
        await saveLessonToDB(data);
        console.log('Saved lesson to IndexedDB');
        
        setLesson(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchLesson();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
        <div className="container mx-auto p-4 md:px-6 max-w-2xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !lesson) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
        <div className="container mx-auto p-4 md:px-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600">Lesson not found</h1>
        </div>
      </main>
    );
  }

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

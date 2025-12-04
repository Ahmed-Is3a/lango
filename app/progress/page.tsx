'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProgressData {
  totalWords: number;
  wordsLearned: number;
  quizzesCompleted: number;
  averageScore: number;
  streak: number;
  lastActivity: string;
  categories: {
    name: string;
    progress: number;
  }[];
}

export default function ProgressPage() {
  const [progress] = useState<ProgressData>({
    totalWords: 10,
    wordsLearned: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    streak: 0,
    lastActivity: 'Never',
    categories: [
      { name: 'Greetings', progress: 0 },
      { name: 'Common', progress: 0 },
      { name: 'Food & Drink', progress: 0 },
      { name: 'People', progress: 0 },
      { name: 'Places', progress: 0 },
      { name: 'Adjectives', progress: 0 },
      { name: 'Emotions', progress: 0 },
    ],
  });

  const overallProgress = (progress.wordsLearned / progress.totalWords) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Your Progress
          </h1>
        </div>

        {/* Overall Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Words Learned
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {progress.wordsLearned}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              of {progress.totalWords} total
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Quizzes Completed
            </div>
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {progress.quizzesCompleted}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Keep it up!
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Average Score
            </div>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {progress.averageScore > 0 ? `${progress.averageScore}%` : 'N/A'}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Quiz performance
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Day Streak
            </div>
            <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
              {progress.streak} 🔥
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {progress.streak > 0
                ? 'Great consistency!'
                : 'Start your streak today!'}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
            Overall Progress
          </h2>
          <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Learning Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-6 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${overallProgress}%` }}
            >
              {overallProgress > 10 && (
                <span className="text-xs font-semibold text-white">
                  {Math.round(overallProgress)}%
                </span>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Last activity: {progress.lastActivity}
          </p>
        </div>

        {/* Category Progress */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
            Progress by Category
          </h2>
          <div className="space-y-4">
            {progress.categories.map((category, index) => (
              <div key={category.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {category.progress}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${category.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
            Achievements
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border-2 border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 text-3xl">🎯</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                First Steps
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Learn your first word
              </div>
            </div>
            <div className="rounded-xl border-2 border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 text-3xl">📚</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                Vocabulary Master
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Learn 10 words
              </div>
            </div>
            <div className="rounded-xl border-2 border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 text-3xl">🔥</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                Streak Starter
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Maintain a 3-day streak
              </div>
            </div>
            <div className="rounded-xl border-2 border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 text-3xl">⭐</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                Quiz Champion
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Score 100% on a quiz
              </div>
            </div>
            <div className="rounded-xl border-2 border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 text-3xl">🏆</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                Perfect Week
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Practice 7 days in a row
              </div>
            </div>
            <div className="rounded-xl border-2 border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 text-3xl">💯</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                Centurion
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Complete 100 quizzes
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-8 text-center text-white shadow-xl">
          <h2 className="mb-4 text-3xl font-bold">Keep Learning!</h2>
          <p className="mb-6 text-lg opacity-90">
            Continue your language learning journey
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/learn"
              className="rounded-full bg-white px-8 py-3 font-semibold text-purple-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Learn Words
            </Link>
            <Link
              href="/quiz"
              className="rounded-full bg-white/20 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-white/30"
            >
              Take Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


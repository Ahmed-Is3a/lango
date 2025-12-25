'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [stats] = useState({
    wordsLearned: 0,
    quizzesCompleted: 0,
    streak: 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-2">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Lango
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Master languages one word at a time
          </p>
        </header>

        {/* Stats Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Words Learned
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {stats.wordsLearned}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Quizzes Completed
            </div>
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.quizzesCompleted}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Day Streak
            </div>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {stats.streak} 🔥
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/learn"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-4 text-5xl">📚</div>
              <h2 className="mb-2 text-2xl font-bold">Learn Vocabulary</h2>
              <p className="text-blue-100">
                Study new words with interactive flashcards
              </p>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform"></div>
          </Link>

          <Link
            href="/stories"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-4 text-5xl">📖</div>
              <h2 className="mb-2 text-2xl font-bold">Read Stories</h2>
              <p className="text-amber-100">
                Immerse yourself in short stories with translations
              </p>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform"></div>
          </Link>
          
          <Link
            href="/quiz"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-4 text-5xl">✏️</div>
              <h2 className="mb-2 text-2xl font-bold">Take Quiz</h2>
              <p className="text-indigo-100">
                Test your knowledge with interactive quizzes
              </p>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform"></div>
          </Link>

          <Link
            href="/progress"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-8 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-4 text-5xl">📊</div>
              <h2 className="mb-2 text-2xl font-bold">View Progress</h2>
              <p className="text-purple-100">
                Track your learning journey and achievements
              </p>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform"></div>
          </Link>
        </div>

        {/* Quick Start */}
        <div className="mt-12 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
            Quick Start
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            New to Lango? Start by learning some basic vocabulary words, then
            test your knowledge with a quiz!
          </p>
          <Link
            href="/learn"
            className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Start Learning →
          </Link>
        </div>
      </div>
    </div>
  );
}

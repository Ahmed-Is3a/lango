'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Word {
  id: number;
  word: string;
  translation: string;
  example: string;
  category: string;
}

const vocabulary: Word[] = [
  {
    id: 1,
    word: 'Hello',
    translation: 'Hola',
    example: 'Hello, how are you?',
    category: 'Greetings',
  },
  {
    id: 2,
    word: 'Thank you',
    translation: 'Gracias',
    example: 'Thank you for your help.',
    category: 'Common',
  },
  {
    id: 3,
    word: 'Please',
    translation: 'Por favor',
    example: 'Please, can you help me?',
    category: 'Common',
  },
  {
    id: 4,
    word: 'Goodbye',
    translation: 'Adiós',
    example: 'Goodbye, see you tomorrow!',
    category: 'Greetings',
  },
  {
    id: 5,
    word: 'Water',
    translation: 'Agua',
    example: 'I need a glass of water.',
    category: 'Food & Drink',
  },
  {
    id: 6,
    word: 'Food',
    translation: 'Comida',
    example: 'The food is delicious.',
    category: 'Food & Drink',
  },
  {
    id: 7,
    word: 'Friend',
    translation: 'Amigo',
    example: 'He is my best friend.',
    category: 'People',
  },
  {
    id: 8,
    word: 'House',
    translation: 'Casa',
    example: 'This is my house.',
    category: 'Places',
  },
  {
    id: 9,
    word: 'Beautiful',
    translation: 'Hermoso',
    example: 'What a beautiful day!',
    category: 'Adjectives',
  },
  {
    id: 10,
    word: 'Love',
    translation: 'Amor',
    example: 'I love learning languages.',
    category: 'Emotions',
  },
];

export default function LearnPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Set<number>>(new Set());

  const currentWord = vocabulary[currentIndex];

  const handleNext = () => {
    setLearnedWords((prev) => new Set([...prev, currentWord.id]));
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const progress = (learnedWords.size / vocabulary.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Learn Vocabulary
          </h1>
          <div className="w-24"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>
              Progress: {learnedWords.size} / {vocabulary.length} words
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8 flex justify-center">
          <div
            className="relative h-96 w-full max-w-2xl cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <div
              className={`absolute inset-0 preserve-3d transition-transform duration-700 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of card */}
              <div className="absolute inset-0 backface-hidden rounded-2xl bg-white p-12 shadow-2xl dark:bg-gray-800">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {currentWord.category}
                  </div>
                  <h2 className="mb-6 text-6xl font-bold text-gray-800 dark:text-gray-200">
                    {currentWord.word}
                  </h2>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    Click to reveal translation
                  </p>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-12 shadow-2xl">
                <div className="flex h-full flex-col items-center justify-center text-center text-white">
                  <div className="mb-4 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                    {currentWord.category}
                  </div>
                  <h2 className="mb-6 text-6xl font-bold">
                    {currentWord.translation}
                  </h2>
                  <p className="mb-4 text-xl opacity-90">{currentWord.example}</p>
                  <p className="text-sm opacity-75 italic">
                    "{currentWord.word}" in context
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="rounded-full bg-white px-6 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:text-gray-200"
          >
            ← Previous
          </button>
          <button
            onClick={handleFlip}
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            {isFlipped ? 'Show Word' : 'Show Translation'}
          </button>
          <button
            onClick={handleNext}
            className="rounded-full bg-white px-6 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:text-gray-200"
          >
            Next →
          </button>
        </div>

        {/* Word List */}
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
            All Words ({vocabulary.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {vocabulary.map((word, index) => (
              <button
                key={word.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsFlipped(false);
                }}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  index === currentIndex
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                } ${
                  learnedWords.has(word.id)
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {word.word}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {word.translation}
                    </div>
                  </div>
                  {learnedWords.has(word.id) && (
                    <span className="text-xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


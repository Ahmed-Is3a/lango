'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'What is the Spanish translation of "Hello"?',
    options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
    correctAnswer: 0,
    explanation: '"Hola" is the Spanish word for "Hello".',
  },
  {
    id: 2,
    question: 'How do you say "Thank you" in Spanish?',
    options: ['Por favor', 'Gracias', 'Adiós', 'Amigo'],
    correctAnswer: 1,
    explanation: '"Gracias" means "Thank you" in Spanish.',
  },
  {
    id: 3,
    question: 'What does "Agua" mean in English?',
    options: ['Food', 'Friend', 'Water', 'House'],
    correctAnswer: 2,
    explanation: '"Agua" is the Spanish word for "Water".',
  },
  {
    id: 4,
    question: 'Translate "Amigo" to English:',
    options: ['House', 'Friend', 'Love', 'Beautiful'],
    correctAnswer: 1,
    explanation: '"Amigo" means "Friend" in English.',
  },
  {
    id: 5,
    question: 'What is "Casa" in English?',
    options: ['Car', 'Cat', 'House', 'Case'],
    correctAnswer: 2,
    explanation: '"Casa" is the Spanish word for "House".',
  },
  {
    id: 6,
    question: 'How do you say "Please" in Spanish?',
    options: ['Por favor', 'Gracias', 'Hola', 'Adiós'],
    correctAnswer: 0,
    explanation: '"Por favor" means "Please" in Spanish.',
  },
  {
    id: 7,
    question: 'What does "Comida" mean?',
    options: ['Come', 'Food', 'Friend', 'Beautiful'],
    correctAnswer: 1,
    explanation: '"Comida" is the Spanish word for "Food".',
  },
  {
    id: 8,
    question: 'Translate "Hermoso" to English:',
    options: ['Hermit', 'Beautiful', 'Hero', 'Harmony'],
    correctAnswer: 1,
    explanation: '"Hermoso" means "Beautiful" in English.',
  },
  {
    id: 9,
    question: 'What is "Amor" in English?',
    options: ['Armor', 'Amour', 'Love', 'More'],
    correctAnswer: 2,
    explanation: '"Amor" is the Spanish word for "Love".',
  },
  {
    id: 10,
    question: 'How do you say "Goodbye" in Spanish?',
    options: ['Hola', 'Gracias', 'Adiós', 'Por favor'],
    correctAnswer: 2,
    explanation: '"Adiós" means "Goodbye" in Spanish.',
  },
];

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    setAnsweredQuestions((prev) => new Set([...prev, currentQuestion.id]));

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setAnsweredQuestions(new Set());
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/"
              className="mb-8 inline-block text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              ← Back to Home
            </Link>

            <div className="rounded-2xl bg-white p-12 text-center shadow-2xl dark:bg-gray-800">
              <div className="mb-6 text-8xl">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
              </div>
              <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-gray-200">
                Quiz Complete!
              </h1>
              <div className="mb-8">
                <div className="mb-2 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {score} / {questions.length}
                </div>
                <div className="text-2xl text-gray-600 dark:text-gray-400">
                  {percentage}% Correct
                </div>
              </div>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                {percentage >= 80
                  ? 'Excellent work! You have a great understanding!'
                  : percentage >= 60
                  ? 'Good job! Keep practicing to improve!'
                  : 'Keep learning! Review the vocabulary and try again!'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  Try Again
                </button>
                <Link
                  href="/learn"
                  className="rounded-full bg-white px-8 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-700 dark:text-gray-200"
                >
                  Review Words
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Quiz
            </h1>
            <div className="w-24 text-right text-sm text-gray-600 dark:text-gray-300">
              Score: {score} / {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
            <h2 className="mb-8 text-2xl font-bold text-gray-800 dark:text-gray-200">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                let buttonClass =
                  'w-full rounded-xl border-2 p-4 text-left font-semibold transition-all hover:scale-105 ';
                
                if (showResult) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300';
                  } else if (index === selectedAnswer && !isCorrect) {
                    buttonClass += 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300';
                  } else {
                    buttonClass += 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300';
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
                  } else {
                    buttonClass += 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-700 dark:hover:border-indigo-600';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && index === currentQuestion.correctAnswer && (
                        <span className="text-xl">✓</span>
                      )}
                      {showResult &&
                        index === selectedAnswer &&
                        !isCorrect && <span className="text-xl">✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div
                className={`mt-6 rounded-xl p-4 ${
                  isCorrect
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}
              >
                <div className="font-semibold">
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <div className="mt-2 text-sm">{currentQuestion.explanation}</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                {currentQuestionIndex < questions.length - 1
                  ? 'Next Question →'
                  : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


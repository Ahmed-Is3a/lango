'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import Link from 'next/link';


  import { 
  saveQuizzesToDB, 
  getQuizzesFromDB, 
  saveProgress 
} from '@/lib/indexeddb';



type MCQQuestion = {
  id: number;
  type: 'MCQ';
  data: {
    question: string | { text: string; imageUrl?: string };
    options: string[];
    correctAnswer: number;
    explanation?: string;
  };
  level: string;
};

type TrueFalseQuestion = {
  id: number;
  type: 'TRUE_FALSE';
  data: {
    question: string;
    correctAnswer: boolean;
    explanation?: string;
  };
  level: string;
};

type FillInTheBlankQuestion = {
  id: number;
  type: 'FILL_IN_THE_BLANK';
  data: {
    text: string;
    answers: string[];
    wordOptions?: string[];
    hints?: string[];
  };
  level: string;
};

type MatchingQuestion = {
  id: number;
  type: 'MATCHING';
  data: {
    title?: string;
    pairs: Array<{ left: string; right: string }>;
  };
  level: string;
};

type Question = MCQQuestion | TrueFalseQuestion | FillInTheBlankQuestion | MatchingQuestion;

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, any>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [matchingState, setMatchingState] = useState<Map<string, string>>(new Map());
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  const allAvailableTags = Array.from(
    new Set(questions.flatMap((q) => (q as any)?.tags || []))
  ).sort();




useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedLevel) params.append('level', selectedLevel);
      if (selectedTags.size > 0) {
        params.append('tags', Array.from(selectedTags).join(','));
      }
      const url = params.size > 0 ? `/api/quiz?${params}` : '/api/quiz';
      
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch quiz');
        const data = (await res.json()) as Question[];
        
        // Save to IndexedDB
        await saveQuizzesToDB(data);
        
        setQuestions(data);
        setError(null);
      } catch (fetchError) {
        // Fallback to IndexedDB
        const cachedQuizzes = await getQuizzesFromDB(selectedLevel || undefined);
        if (cachedQuizzes && (cachedQuizzes as any[]).length > 0) {
          setQuestions(cachedQuizzes as Question[]);
          setError('Using offline data. Unable to fetch latest quizzes.');
        } else {
          throw fetchError;
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };
  load();
}, [selectedLevel, selectedTags]);




  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedLevel) params.append('level', selectedLevel);
        if (selectedTags.size > 0) {
          params.append('tags', Array.from(selectedTags).join(','));
        }
        const url = params.size > 0 ? `/api/quiz?${params}` : '/api/quiz';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch quiz');
        const data = (await res.json()) as Question[];
        setQuestions(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Unable to load quiz questions; using fallback data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedLevel, selectedTags]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [error]);

  const currentQuestion = questions[currentQuestionIndex];

  const checkAnswer = (): boolean => {
    if (!currentQuestion) return false;
    const answer = selectedAnswers.get(currentQuestion.id);
    const data = (currentQuestion.data as any);

    switch (currentQuestion.type) {
      case 'MCQ':
        return answer === data.correctAnswer;
      case 'TRUE_FALSE':
        return answer === data.correctAnswer;
      case 'FILL_IN_THE_BLANK': {
        const userAnswers = answer as string[];
        return userAnswers.every((ans, idx) =>
          ans.toLowerCase().trim() === data.answers[idx].toLowerCase().trim()
        );
      }
      case 'MATCHING': {
        const matched = answer as Map<string, string>;
        return Array.from(matched.entries()).every(
          ([left, right]) =>
            data.pairs.some((p: any) => p.left === left && p.right === right)
        );
      }
      default:
        return false;
    }
  };

  const handleAnswerSelect = (answer: any) => {
    if (showResult) return;
    setSelectedAnswers(new Map(selectedAnswers).set(currentQuestion.id, answer));
  };

  const handleSubmit = () => {
  const answer = selectedAnswers.get(currentQuestion.id);
  if (answer === undefined && currentQuestion.type !== 'MATCHING') return;
  if (currentQuestion.type === 'MATCHING' && (!answer || answer.size === 0)) return;

  setShowResult(true);

  const isCorrect = checkAnswer();
  if (isCorrect) {
    setScore((prev) => prev + 1);
  }
  
  // Save progress to IndexedDB
  saveProgress(currentQuestion.id, answer, isCorrect).catch(err => 
    console.error('Failed to save progress', err)
  );
};

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowResult(false);
      setMatchingState(new Map());
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Map());
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setMatchingState(new Map());
    setSelectedTags(new Set());
    setSelectedLevel('');
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Map());
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setMatchingState(new Map());
  };

  const handleTagToggle = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Map());
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setMatchingState(new Map());
  };

  const progress = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl text-center text-gray-600 dark:text-gray-300">
            Loading quiz...
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl text-center text-gray-600 dark:text-gray-300">
            No quiz questions available.
          </div>
        </div>
      </div>
    );
  }

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
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="text-gray-600 dark:text-gray-300"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
            </Link>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Quiz
            </h1>
            <div className="w-24 text-right text-sm text-gray-600 dark:text-gray-300">
              Score: {score} / {questions.length}
            </div>
          </div>

          {/* Level Filter */}
          <div className="flex items-center justify-center gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filters:
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="p-1 rounded border border-gray-200 bg-white text-gray-700 transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-indigo-600 dark:focus:border-indigo-500 dark:focus:ring-indigo-800"
            >
              <option value="">All Levels</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>

          {/* Tag Filter */}
          {allAvailableTags.length > 0 && (
            <div className="mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tags:
              </label>
              <div className="flex flex-wrap gap-1">
                {allAvailableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    disabled={loading}
                    className={`rounded-lg p-1 text-sm transition-all ${
                      selectedTags.has(tag)
                        ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                        : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-indigo-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed dark:text-white`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="mb-4 rounded-lg bg-white p-4 shadow-2xl dark:bg-gray-800">
            {/* Question Content */}
            {currentQuestion.type === 'MCQ' && (
              <>
                {typeof currentQuestion.data.question === 'string' ? (
                  <h2 className="mb-2 text-2xl text-gray-800 dark:text-gray-200">
                    {currentQuestion.data.question}
                  </h2>
                ) : (
                  <>
                    {currentQuestion.data.question.imageUrl && (
                      <div className="mb-2 overflow-hidden rounded-lg">
                        <img
                          src={currentQuestion.data.question.imageUrl}
                          alt="Question"
                          className="w-full max-h-80 object-cover"
                        />
                      </div>
                    )}
                    <h2 className="mb-8 text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {currentQuestion.data.question.text}
                    </h2>
                  </>
                )}
                <div className="space-y-1">
                  {currentQuestion.data.options.map((option, index) => {
                    const isCorrect = index === currentQuestion.data.correctAnswer;
                    const isSelected = selectedAnswers.get(currentQuestion.id) === index;
                    let buttonClass = 'w-full rounded-lg border px-2 py-1 text-left font-semibold transition-all hover:scale-101 ';
                    
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass += 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300';
                      } else if (isSelected && !isCorrect) {
                        buttonClass += 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300';
                      } else {
                        buttonClass += 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300';
                      }
                    } else {
                      if (isSelected) {
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
                          {showResult && isCorrect && <span className="text-xl">✓</span>}
                          {showResult && isSelected && !isCorrect && <span className="text-xl">✗</span>}
                        </div> 
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {currentQuestion.type === 'TRUE_FALSE' && (
              <>
                <h2 className="mb-8 text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {currentQuestion.data.question}
                </h2>
                <div className="space-y-4">
                  {[true, false].map((value) => {
                    const isCorrect = value === currentQuestion.data.correctAnswer;
                    const isSelected = selectedAnswers.get(currentQuestion.id) === value;
                    let buttonClass = 'w-full rounded-xl border-2 p-4 text-left font-semibold transition-all hover:scale-105 ';
                    
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass += 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300';
                      } else if (isSelected && !isCorrect) {
                        buttonClass += 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300';
                      } else {
                        buttonClass += 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300';
                      }
                    } else {
                      if (isSelected) {
                        buttonClass += 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
                      } else {
                        buttonClass += 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-700 dark:hover:border-indigo-600';
                      }
                    }

                    return (
                      <button
                        key={String(value)}
                        onClick={() => handleAnswerSelect(value)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{value ? 'True' : 'False'}</span>
                          {showResult && isCorrect && <span className="text-xl">✓</span>}
                          {showResult && isSelected && !isCorrect && <span className="text-xl">✗</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {currentQuestion.type === 'FILL_IN_THE_BLANK' && (() => {
              const blanks = (currentQuestion.data.text || "").split("___");
              const answers = selectedAnswers.get(currentQuestion.id) || Array(blanks.length - 1).fill("");
              
              const handleWordClick = (word: string) => {
                const blanksCount = Math.max(blanks.length - 1, 0);
                const current = selectedAnswers.get(currentQuestion.id) || Array(blanksCount).fill("");
                const targetIdx = current.findIndex((val: string) => !val);
                if (targetIdx === -1) return; // no empty slot
                const newAnswers = [...current];
                newAnswers[targetIdx] = word;
                handleAnswerSelect(newAnswers);
              };

              return (
                <>
                  {currentQuestion.data.wordOptions && currentQuestion.data.wordOptions.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Drag words or click to fill blanks:
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {currentQuestion.data.wordOptions.map((word, wordIdx) => (
                          <div
                            key={wordIdx}
                            draggable
                            onDragStart={() => setDraggedWord(word)}
                            onDragEnd={() => setDraggedWord(null)}
                            onClick={() => handleWordClick(word)}
                            className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-sm font-medium cursor-move hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            {word}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-lg text-gray-900 dark:text-white leading-relaxed mb-6 whitespace-pre-wrap">
                    {blanks.map((segment, idx) => (
                      <span key={idx}>
                        {segment}
                        {idx < blanks.length - 1 && (
                          <input
                            type="text"
                            value={answers[idx] || ""}
                            onChange={(e) => {
                              const newAnswers = [...answers];
                              newAnswers[idx] = e.target.value;
                              handleAnswerSelect(newAnswers);
                            }}
                            onClick={() => {
                              if (showResult) return;
                              if (!answers[idx]) return;
                              const newAnswers = [...answers];
                              newAnswers[idx] = "";
                              handleAnswerSelect(newAnswers);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const word = draggedWord;
                              if (word) {
                                const newAnswers = [...answers];
                                newAnswers[idx] = word;
                                handleAnswerSelect(newAnswers);
                                setDraggedWord(null);
                              }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            disabled={showResult}
                            className={`inline-block w-32 mx-1 px-2 py-1 border-b-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                              showResult
                                ? answers[idx]?.toLowerCase().trim() === currentQuestion.data.answers[idx]?.toLowerCase().trim()
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                                  : "border-red-500 bg-red-50 dark:bg-red-900/30"
                                : "border-indigo-400 focus:border-indigo-600"
                            }`}
                          />
                        )}
                      </span>
                    ))}
                  </div>

                  {currentQuestion.data.hints && currentQuestion.data.hints.length > 0 && !showResult && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Hints:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {currentQuestion.data.hints.map((hint, idx) => (
                          <li key={idx}>• {hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}

            {currentQuestion.type === 'MATCHING' && (
              <>
                <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {currentQuestion.data.title || 'Match the pairs'}
                </h2>
                <div className="space-y-3">
                  {currentQuestion.data.pairs.map((pair, idx) => {
                    const matched = matchingState.get(pair.left);
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="flex-1 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{pair.left}</p>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                        <select
                          value={matched || ''}
                          onChange={(e) => {
                            const newState = new Map(matchingState);
                            if (e.target.value) {
                              newState.set(pair.left, e.target.value);
                            } else {
                              newState.delete(pair.left);
                            }
                            setMatchingState(newState);
                            handleAnswerSelect(newState);
                          }}
                          disabled={showResult}
                          className="flex-1 rounded-lg border-2 border-indigo-300 bg-white px-4 py-2 font-medium dark:border-indigo-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        >
                          <option value="">Select match...</option>
                          {currentQuestion.data.pairs.map((p, pIdx) => (
                            <option key={pIdx} value={p.right}>
                              {p.right}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {showResult && (
              <div
                className={`mt-6 rounded-xl p-4 ${
                  checkAnswer()
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}
              >
                <div className="font-semibold">
                  {checkAnswer() ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                {currentQuestion.data.explanation && (
                  <div className="mt-2 text-sm">{currentQuestion.data.explanation}</div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={
                  selectedAnswers.get(currentQuestion?.id) === undefined &&
                  currentQuestion?.type !== 'MATCHING'
                }
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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


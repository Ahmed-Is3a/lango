'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vocab {
  id: number;
  term: string;
  definition: string;
  language: string;
  created_at: string;
  // add optional example fields
  exampleGerman?: string | null;
  exampleEnglish?: string | null;
}

export default function LearnPage() {
  const [items, setItems] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Set<number>>(new Set());

  const currentItem = items[currentIndex];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/vocabs');
        if (!res.ok) throw new Error('Network');
        const data = await res.json() || [];
        setItems(data);
        // Cache snapshot locally for offline usage
        try {
          localStorage.setItem('vocabs-cache', JSON.stringify(data));
        } catch {}
      } catch {
        // Fallback: use last cached snapshot
        try {
          const raw = localStorage.getItem('vocabs-cache');
          if (raw) {
            const cached = JSON.parse(raw) as Vocab[];
            setItems(cached);
          }
        } catch {}
      }
      setCurrentIndex(0);
      setIsFlipped(false);
    };
    load();
  }, []);

  const handleNext = () => {
    if (!items.length) return;
    setLearnedWords((prev) => new Set([...prev, currentItem.id]));
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrevious = () => {
    if (!items.length) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const progress = items.length ? (learnedWords.size / items.length) * 100 : 0;

  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newLanguage, setNewLanguage] = useState('en');
  // add optional inputs for creation
  const [newExampleGerman, setNewExampleGerman] = useState('');
  const [newExampleEnglish, setNewExampleEnglish] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editDefinition, setEditDefinition] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  // add optional inputs for editing
  const [editExampleGerman, setEditExampleGerman] = useState('');
  const [editExampleEnglish, setEditExampleEnglish] = useState('');

  const addItem = async () => {
    const res = await fetch('/api/vocabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term: newTerm,
        definition: newDefinition,
        language: newLanguage,
        // send only if provided
        exampleGerman: newExampleGerman.trim() || undefined,
        exampleEnglish: newExampleEnglish.trim() || undefined,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setItems((prev) => {
        const updated = [json.data, ...prev];
        try {
          localStorage.setItem('vocabs-cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setNewTerm('');
      setNewDefinition('');
      setNewExampleGerman('');
      setNewExampleEnglish('');
    }
  };

  const startEdit = (v: Vocab) => {
    setEditTerm(v.term);
    setEditDefinition(v.definition);
    setEditLanguage(v.language);
    // prefill optional fields
    setEditExampleGerman(v.exampleGerman ?? '');
    setEditExampleEnglish(v.exampleEnglish ?? '');
    setEditingId(v.id);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const res = await fetch('/api/vocabs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        term: editTerm,
        definition: editDefinition,
        language: editLanguage,
        // send only if provided
        exampleGerman: editExampleGerman.trim() || undefined,
        exampleEnglish: editExampleEnglish.trim() || undefined,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setItems((prev) => {
        const updated = prev.map((p) => (p.id === editingId ? json.data : p));
        try { localStorage.setItem('vocabs-cache', JSON.stringify(updated)); } catch {}
        return updated;
      });
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTerm('');
    setEditDefinition('');
    setEditLanguage('');
    setEditExampleGerman('');
    setEditExampleEnglish('');
  };

  const removeItem = async (id: number) => {
    const res = await fetch(`/api/vocabs?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete vocabulary");
  }
    if (res.ok) {
      setItems((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        try { localStorage.setItem('vocabs-cache', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setLearnedWords((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (currentIndex >= items.length - 1) setCurrentIndex(0);
    }
  };

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
              Progress: {learnedWords.size} / {items.length} words
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
                    {currentItem?.language?.toUpperCase() || 'LANG'}
                  </div>
                  <h2 className="mb-6 text-6xl font-bold text-gray-800 dark:text-gray-200">
                    {currentItem?.term || 'No items yet'}
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
                    {currentItem?.language?.toUpperCase()}
                  </div>
                  <h2 className="mb-4 text-6xl font-bold">
                    {currentItem?.definition || ''}
                  </h2>
                  {/* show examples if present */}
                  {currentItem?.exampleGerman && (
                    <p className="text-sm opacity-80">DE: {currentItem.exampleGerman}</p>
                  )}
                  {currentItem?.exampleEnglish && (
                    <p className="text-sm opacity-80">EN: {currentItem.exampleEnglish}</p>
                  )}
                  <p className="mt-2 text-sm opacity-75 italic">"{currentItem?.term}"</p>
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

        {/* Add New Vocab */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">Add New Term</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Term"
              className="rounded-md border px-3 py-2 dark:bg-gray-900"
            />
            <input
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              placeholder="Definition"
              className="rounded-md border px-3 py-2 dark:bg-gray-900"
            />
            <input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Language (e.g., en, es)"
              className="rounded-md border px-3 py-2 dark:bg-gray-900"
            />
            <button onClick={addItem} className="rounded-md bg-blue-600 px-4 py-2 text-white">Add</button>
          </div>
          {/* optional examples */}
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={newExampleGerman}
              onChange={(e) => setNewExampleGerman(e.target.value)}
              placeholder="Example (German) — optional"
              className="rounded-md border px-3 py-2 dark:bg-gray-900"
            />
            <input
              value={newExampleEnglish}
              onChange={(e) => setNewExampleEnglish(e.target.value)}
              placeholder="Example (English) — optional"
              className="rounded-md border px-3 py-2 dark:bg-gray-900"
            />
          </div>
        </div>

        {/* Word List */}
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
            All Words ({items.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((word, index) => (
              <div
                key={word.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsFlipped(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentIndex(index);
                    setIsFlipped(false);
                  }
                }}
                className={`rounded-lg border-2 p-4 text-left transition-all cursor-pointer ${
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
                      {word.term}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {word.definition}
                    </div>
                    {/* inline examples if present */}
                    {word.exampleGerman && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">DE: {word.exampleGerman}</div>
                    )}
                    {word.exampleEnglish && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">EN: {word.exampleEnglish}</div>
                    )}
                  </div>
                  {learnedWords.has(word.id) && (
                    <span className="text-xl">✓</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); startEdit(word); }} className="rounded-md border px-3 py-1 text-sm">Edit</button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeItem(word.id); }} className="rounded-md border px-3 py-1 text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
          {editingId !== null && (
            <div className="mt-6 rounded-lg border p-4">
              <h4 className="mb-3 font-semibold">Edit Term</h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <input value={editTerm} onChange={(e) => setEditTerm(e.target.value)} className="rounded-md border px-3 py-2 dark:bg-gray-900" />
                <input value={editDefinition} onChange={(e) => setEditDefinition(e.target.value)} className="rounded-md border px-3 py-2 dark:bg-gray-900" />
                <input value={editLanguage} onChange={(e) => setEditLanguage(e.target.value)} className="rounded-md border px-3 py-2 dark:bg-gray-900" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="rounded-md bg-blue-600 px-4 py-2 text-white">Save</button>
                  <button onClick={cancelEdit} className="rounded-md border px-4 py-2">Cancel</button>
                </div>
              </div>
              {/* optional examples edit */}
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={editExampleGerman}
                  onChange={(e) => setEditExampleGerman(e.target.value)}
                  placeholder="Example (German) — optional"
                  className="rounded-md border px-3 py-2 dark:bg-gray-900"
                />
                <input
                  value={editExampleEnglish}
                  onChange={(e) => setEditExampleEnglish(e.target.value)}
                  placeholder="Example (English) — optional"
                  className="rounded-md border px-3 py-2 dark:bg-gray-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


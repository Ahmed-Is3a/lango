"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowLeftIcon from "../components/icons/arrow-left";
import DeleteIcon from "../components/icons/delete";
import EditIcon from "../components/icons/edit";
import { getAllVocabsFromDB, saveVocabsToDB, deleteVocabFromDB } from "@/lib/indexeddb";

interface Vocab {
  id: number;
  term: string;
  definition: string;
  language: string;
  created_at: string;
  // add optional example fields
  exampleGerman?: string | null;
  exampleEnglish?: string | null;
  imageUrl?: string | null;
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
        // Load from cache
        const cachedVocabs = await getAllVocabsFromDB();

        if (Array.isArray(cachedVocabs) && cachedVocabs.length > 0) {
          console.log("Loaded vocabularies from IndexedDB");
          setItems(cachedVocabs as Vocab[]);
          return;
        }
        const res = await fetch("/api/vocabs");
        if (!res.ok) throw new Error("Network");
        const data = (await res.json()) || [];
        // Save to IndexedDB
        await saveVocabsToDB(data);
        setItems(data);
      } catch {}
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

  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newLanguage, setNewLanguage] = useState("de");
  // add optional inputs for creation
  const [newExampleGerman, setNewExampleGerman] = useState("");
  const [newExampleEnglish, setNewExampleEnglish] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  // add optional inputs for editing
  const [editExampleGerman, setEditExampleGerman] = useState("");
  const [editExampleEnglish, setEditExampleEnglish] = useState("");

  const addItem = async () => {
    saveVocabsToDB([
      ...items,
      {
        id: Date.now(), // temporary ID
        term: newTerm,
        definition: newDefinition,
        language: newLanguage,
        exampleGerman: newExampleGerman.trim() || undefined,
        exampleEnglish: newExampleEnglish.trim() || undefined,
        imageUrl: newImageUrl.trim() || undefined,
      },
    ]);

      setNewTerm("");
      setNewDefinition("");
      setNewExampleGerman("");
      setNewExampleEnglish("");
      const data = await getAllVocabsFromDB()
      setItems(data as Vocab[])
  };

  const startEdit = (v: Vocab) => {
    setEditTerm(v.term);
    setEditDefinition(v.definition);
    setEditLanguage(v.language);
    // prefill optional fields
    setEditExampleGerman(v.exampleGerman ?? "");
    setEditExampleEnglish(v.exampleEnglish ?? "");
    setEditingId(v.id);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const res = await fetch("/api/vocabs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
        try {
          localStorage.setItem("vocabs-cache", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTerm("");
    setEditDefinition("");
    setEditLanguage("");
    setEditExampleGerman("");
    setEditExampleEnglish("");
  };

  const removeItem = async (id: number) => {
    deleteVocabFromDB(id);
    const data = await getAllVocabsFromDB()
    setItems(data as Vocab[])
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              className="text-gray-600 dark:text-gray-300"
            >
              <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Learn Vocabularies
          </h1>
          <div className="w-16"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
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
        <div className=" mb-2 flex justify-center">
          <div
            className="relative h-90 w-full max-w-2xl cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <div
              className={`absolute inset-0 preserve-3d transition-transform duration-700 ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front of card */}
              <div className="absolute inset-0 backface-hidden rounded-2xl border border-gray-300 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <h2 className="mb-6 text-5xl font-bold text-gray-800 dark:text-gray-200">
                    {currentItem?.term || "No items yet"}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click to reveal translation
                  </p>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 shadow-2xl">
                <div className="flex h-full flex-col items-center justify-center text-center text-white">
                  {/* <div className="mb-2 rounded-full bg-white/20 px-4 py-2  font-semibold">
                    {currentItem?.language?.toUpperCase()}
                  </div> */}
                  <h2 className="mb-4 text-5xl font-bold">
                    {currentItem?.definition || ""}
                  </h2>
                  {currentItem?.imageUrl && (
                    <Image
                      src={currentItem.imageUrl}
                      alt={currentItem.term}
                      className="mb-2 h-35 rounded-lg"
                    />
                  )}
                  {/* show examples if present, aligned to the same start */}
                  {currentItem?.exampleGerman && (
                    <div className="opacity-80 w-full max-w-md mx-auto text-left flex gap-2">
                      <span className="">DE: </span>
                      <span className="flex-1">
                        {currentItem.exampleGerman}
                      </span>
                    </div>
                  )}
                  {currentItem?.exampleEnglish && (
                    <div className="opacity-80 w-full max-w-md mx-auto text-left flex gap-2">
                      <span className="">EN:</span>
                      <span className="flex-1">
                        {currentItem.exampleEnglish}
                      </span>
                    </div>
                  )}
                  <p className="mt-3 text-sm opacity-70 italic">
                    &ldquo;{currentItem?.term}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex justify-center gap-5">
          <button
            onClick={handlePrevious}
            className="flex gap-1 rounded-full bg-white px-4 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:text-gray-200"
          >
            <ArrowLeftIcon />
            Prev
          </button>
          <button
            onClick={handleFlip}
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 w-42 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            {isFlipped ? "Show Word" : "Translation"}
          </button>
          <button
            onClick={handleNext}
            className="flex gap-1 rounded-full bg-white px-4 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:text-gray-200"
          >
            Next
            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#000000"></path> </g></svg>
          </button>
        </div>

        {/* Add New Vocab */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
            Add New Term
          </h3>
          <div className="grid grid-cols-1 gap-1 md:grid-cols-4">
            <input
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Term"
              className="rounded-md border border-blue-300 focus:border-blue-500 focus:outline-none px-3 py-2 dark:bg-gray-900 dark:text-gray-600"
            />
            <input
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              placeholder="Definition"
              className="rounded-md border border-blue-300 focus:border-blue-500 focus:outline-none px-3 py-2 dark:bg-gray-900 dark:text-gray-600"
            />
            <select
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="rounded-md border border-blue-300 focus:border-blue-500 focus:outline-none px-3 py-2 dark:bg-gray-900 dark:text-gray-600"
            >
              <option value="en">English</option>
              <option value="de">German</option>
            </select>
            <input
              value={newExampleGerman}
              onChange={(e) => setNewExampleGerman(e.target.value)}
              placeholder="Example — optional"
              className="rounded-md border border-blue-300 focus:border-blue-500 focus:outline-none px-3 py-2 dark:bg-gray-900 dark:text-gray-600"
            />
            <input
              value={newExampleEnglish}
              onChange={(e) => setNewExampleEnglish(e.target.value)}
              placeholder="Example Translation — optional"
              className="rounded-md border border-blue-300 focus:border-blue-500 focus:outline-none px-3 py-2 dark:bg-gray-900 dark:text-gray-600"
            />
            <input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Image URL — optional"
              className="rounded-md border border-blue-300 focus:border-blue-500 focus:outline-none px-3 py-2 dark:bg-gray-900 dark:text-gray-600"
            />
            <button
              onClick={addItem}
              className="rounded-md bg-blue-600 px-4 py-3 text-white font-bold"
            >
              {" "}
              + Add
            </button>
          </div>
        </div>

        {/* Word List */}
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
            All Words ({items.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.filter(Boolean).map((word, index) => (
              <div
                key={word.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsFlipped(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setCurrentIndex(index);
                    setIsFlipped(false);
                  }
                }}
                className={`flex justify-between rounded-lg border-2 p-2 text-left transition-all cursor-pointer ${
                  index === currentIndex
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                } ${
                  learnedWords.has(word?.id)
                    ? "bg-green-50 dark:bg-green-900/20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {word?.term}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {word?.definition}
                    </div>
                    {/* inline examples if present */}
                    {/* {word?.exampleGerman && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">DE: {word.exampleGerman}</div>
                    )}
                    {word?.exampleEnglish && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">EN: {word.exampleEnglish}</div>
                    )} */}
                  </div>
                  {learnedWords.has(word?.id) && (
                    <span className="text-xl">✓</span>
                  )}
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(word);
                    }}
                    className="rounded-md border p-1 text-sm text-gray-200"
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(word.id);
                    }}
                    className="rounded-md border p-1 text-sm text-red-400 hover:bg-red-100"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Modal Popup */}
          {editingId !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={cancelEdit}
            >
              <div
                className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={cancelEdit}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h4 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Edit Term
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Term
                      </label>
                      <input
                        value={editTerm}
                        onChange={(e) => setEditTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Definition
                      </label>
                      <input
                        value={editDefinition}
                        onChange={(e) => setEditDefinition(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <input
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Example (German) — optional
                    </label>
                    <input
                      value={editExampleGerman}
                      onChange={(e) => setEditExampleGerman(e.target.value)}
                      placeholder="Enter German example sentence"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Example (English) — optional
                    </label>
                    <input
                      value={editExampleEnglish}
                      onChange={(e) => setEditExampleEnglish(e.target.value)}
                      placeholder="Enter English example sentence"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={saveEdit}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";

export type Flashcard = { id: string; term: string; definition: string };

export default function FlashcardsView({
  languageName,
  cards,
}: {
  languageName: string;
  cards: Flashcard[];
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = cards[index];

  const next = () => {
    setIndex((i) => (i + 1) % cards.length);
    setFlipped(false);
  };
  const prev = () => {
    setIndex((i) => (i - 1 + cards.length) % cards.length);
    setFlipped(false);
  };

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-6">{languageName} Flashcards</h1>
      {current ? (
        <div className="card mb-6 text-center" onClick={() => setFlipped((f) => !f)}>
          <div>
            <p className="text-2xl font-semibold mb-2">{flipped ? current.definition : current.term}</p>
            <p className="text-sm text-gray-600">Tap to flip</p>
          </div>
        </div>
      ) : (
        <p>No flashcards available.</p>
      )}
      <div className="flex items-center gap-4">
        <button className="btn" onClick={prev}>Prev</button>
        <span className="text-sm text-gray-700">{cards.length ? index + 1 : 0}/{cards.length}</span>
        <button className="btn" onClick={next}>Next</button>
      </div>
    </main>
  );
}

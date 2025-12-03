"use client";
import { useEffect, useState } from "react";

type Language = { id: string; name: string };

export default function NewFlashcardPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageId, setLanguageId] = useState("");
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/languages");
      const data = await res.json();
      setLanguages(data || []);
      if (data?.length) setLanguageId(data[0].id);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = new URLSearchParams({ languageId, term, definition });
    await fetch("/admin/flashcards/create", { method: "POST", body });
    window.location.href = "/admin/flashcards";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Flashcard</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="block text-sm mb-1">Language</span>
          <select className="border p-2 w-full" value={languageId} onChange={(e) => setLanguageId(e.target.value)}>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
        <input className="border p-2 w-full" placeholder="Term" value={term} onChange={(e) => setTerm(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Definition" value={definition} onChange={(e) => setDefinition(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Save</button>
      </form>
    </div>
  );
}

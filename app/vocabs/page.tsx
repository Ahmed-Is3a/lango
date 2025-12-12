"use client"; // needed because we now have a client-side form

import { useState, useEffect } from "react";

type Vocabulary = {
  id: number;
  term: string;
  definition: string;
  language: string;
  createdAt: string;
  exampleGerman?: string | null;
  exampleEnglish?: string | null;
};

export default function VocabularyPage() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [language, setLanguage] = useState("");
  const [exampleGerman, setExampleGerman] = useState("");
  const [exampleEnglish, setExampleEnglish] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch vocabularies from API
  async function fetchVocabularies() {
    const res = await fetch("/api/vocabs");
    if (!res.ok) {
      console.error("Failed to fetch vocabularies");
      return;
    }
    const data: Vocabulary[] = await res.json();
    setVocabularies(data);
  }

  useEffect(() => {
    fetchVocabularies();
  }, []);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!term || !definition || !language) return;

    setLoading(true);
    try {
      const res = await fetch("/api/vocabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term,
          definition,
          language,
          exampleGerman: exampleGerman.trim() || undefined,
          exampleEnglish: exampleEnglish.trim() || undefined,
        }),
      });
      console.log(res);
      if (!res.ok) throw new Error("Failed to cccreate vocabulary");
      console.log("res", res);

      const newVocab: Vocabulary = await res.json();
      setVocabularies([newVocab, ...vocabularies]);

      // Reset form
      setTerm("");
      setDefinition("");
      setLanguage("");
      setExampleGerman("");
      setExampleEnglish("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>Vocabulary List</h1>

      {/* Create Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 16,
          marginBottom: 24,
          maxWidth: 400,
        }}
      >
        <input
          placeholder="Term"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          required
        />
        <input
          placeholder="Definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
        />
        <input
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          required
        />
        <input
          placeholder="Example (German) — optional"
          value={exampleGerman}
          onChange={(e) => setExampleGerman(e.target.value)}
        />
        <input
          placeholder="Example (English) — optional"
          value={exampleEnglish}
          onChange={(e) => setExampleEnglish(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Vocabulary"}
        </button>
      </form>

      {/* Vocabulary List */}
      <div>
        {vocabularies.length === 0 && <p>No vocabulary entries found.</p>}

        {vocabularies.map((vocab) => (
          <div
            key={vocab.id}
            style={{
              border: "1px solid #ddd",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <h2 style={{ margin: 0 }}>{vocab.term}</h2>
            <p style={{ margin: "4px 0" }}>{vocab.definition}</p>
            <span
              style={{
                fontSize: 12,
                color: "#666",
                background: "#f3f3f3",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {vocab.language}
            </span>
            {vocab.exampleGerman && (
              <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                DE: {vocab.exampleGerman}
              </p>
            )}
            {vocab.exampleEnglish && (
              <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                EN: {vocab.exampleEnglish}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

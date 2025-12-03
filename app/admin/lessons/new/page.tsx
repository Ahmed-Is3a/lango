"use client";
import { useEffect, useState } from "react";

type Language = { id: string; name: string };

export default function NewLessonPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageId, setLanguageId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/languages");
        const data = await res.json();
        setLanguages(data || []);
        if (data?.length) setLanguageId(data[0].id);
      } catch {}
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/admin/lessons/create", {
      method: "POST",
      body: new URLSearchParams({ languageId, title, description, content }),
    });
    window.location.href = "/admin/lessons";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Lesson</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="block text-sm mb-1">Language</span>
          <select
            className="border p-2 w-full"
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
            required
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>

        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <textarea
          className="border p-2 w-full min-h-32"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

type Lesson = { id: string; title: string };

export default function NewExercisePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [type, setType] = useState<"mcq" | "fill">("mcq");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<string>("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/lessons");
      const data = await res.json();
      setLessons(data || []);
      if (data?.length) setLessonId(data[0].id);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = new URLSearchParams({ lessonId, type, prompt, options, answer });
    await fetch("/admin/exercises/create", { method: "POST", body });
    window.location.href = "/admin/exercises";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Exercise</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="block text-sm mb-1">Lesson</span>
          <select className="border p-2 w-full" value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Type</span>
          <select className="border p-2 w-full" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="mcq">Multiple Choice</option>
            <option value="fill">Fill-in</option>
          </select>
        </label>

        <input className="border p-2 w-full" placeholder="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Options (comma separated)" value={options} onChange={(e) => setOptions(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />

        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Save</button>
      </form>
    </div>
  );
}

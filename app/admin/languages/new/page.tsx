"use client";

import { useState } from "react";

export default function NewLanguagePage() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Beginner");

  async function handleSubmit(e: any) {
    e.preventDefault();

    await fetch("/api/languages", {
      method: "POST",
      body: JSON.stringify({ name, level }),
    });

    window.location.href = "/admin/languages";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Language</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="border p-2 w-full"
          placeholder="Language Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}

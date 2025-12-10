'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Vocab = {
  id: number;
  term: string;
  definition: string;
  language: string;
  createdAt: string;
};

export default function VocabsPage() {
  const [items, setItems] = useState<Vocab[]>([]);
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [language, setLanguage] = useState('en');
  const [editing, setEditing] = useState<Vocab | null>(null);

  const load = async () => {
    const res = await fetch('/api/vocabs');
    const json = await res.json();
    setItems(json.data || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const res = await fetch('/api/vocabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ term, definition, language }) });
    if (res.ok) {
      setTerm(''); setDefinition('');
      await load();
    }
  };

  const save = async () => {
    if (!editing) return;
    const res = await fetch('/api/vocabs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, term: editing.term, definition: editing.definition, language: editing.language }) });
    if (res.ok) { setEditing(null); await load(); }
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/vocabs?id=${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">← Back to Home</Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Manage Vocabularies</h1>
          <div className="w-24"></div>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">Add New Vocab</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Term" className="rounded-md border px-3 py-2 dark:bg-gray-900" />
            <input value={definition} onChange={(e) => setDefinition(e.target.value)} placeholder="Definition" className="rounded-md border px-3 py-2 dark:bg-gray-900" />
            <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language (e.g., en)" className="rounded-md border px-3 py-2 dark:bg-gray-900" />
            <button onClick={create} className="rounded-md bg-blue-600 px-4 py-2 text-white">Add</button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">All Vocabs ({items.length})</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((v) => (
              <div key={v.id} className="rounded-lg border-2 p-4">
                {editing?.id === v.id ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input value={editing.term} onChange={(e) => setEditing({ ...editing!, term: e.target.value })} className="rounded-md border px-3 py-2 dark:bg-gray-900" />
                    <input value={editing.definition} onChange={(e) => setEditing({ ...editing!, definition: e.target.value })} className="rounded-md border px-3 py-2 dark:bg-gray-900" />
                    <input value={editing.language} onChange={(e) => setEditing({ ...editing!, language: e.target.value })} className="rounded-md border px-3 py-2 dark:bg-gray-900" />
                    <div className="flex gap-2">
                      <button onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-white">Save</button>
                      <button onClick={() => setEditing(null)} className="rounded-md border px-4 py-2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{v.term}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{v.definition}</div>
                      <div className="text-xs text-gray-500">{v.language.toUpperCase()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(v)} className="rounded-md border px-3 py-1 text-sm">Edit</button>
                      <button onClick={() => remove(v.id)} className="rounded-md border px-3 py-1 text-sm text-red-600">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

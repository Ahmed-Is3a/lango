import db from './db';

export type Vocab = {
  id: number;
  term: string;
  definition: string;
  language: string;
  created_at: string;
};

export function listVocabs(limit = 100): Vocab[] {
  const stmt = db.prepare(
    'SELECT id, term, definition, language, created_at FROM vocabs ORDER BY created_at DESC LIMIT ?'
  );
  return stmt.all(limit) as Vocab[];
}

export function createVocab(input: {
  term: string;
  definition: string;
  language: string;
}): Vocab {
  const insert = db.prepare(
    'INSERT INTO vocabs (term, definition, language) VALUES (?, ?, ?)'
  );
  const info = insert.run(input.term, input.definition, input.language);
  const select = db.prepare(
    'SELECT id, term, definition, language, created_at FROM vocabs WHERE id = ?'
  );
  return select.get(info.lastInsertRowid) as Vocab;
}

export function updateVocab(id: number, input: Partial<{ term: string; definition: string; language: string }>): Vocab | null {
  const current = db.prepare('SELECT * FROM vocabs WHERE id = ?').get(id) as Vocab | undefined;
  if (!current) return null;
  const term = input.term ?? current.term;
  const definition = input.definition ?? current.definition;
  const language = input.language ?? current.language;
  db.prepare('UPDATE vocabs SET term = ?, definition = ?, language = ? WHERE id = ?').run(term, definition, language, id);
  const select = db.prepare('SELECT id, term, definition, language, created_at FROM vocabs WHERE id = ?');
  return select.get(id) as Vocab;
}

export function deleteVocab(id: number): boolean {
  const res = db.prepare('DELETE FROM vocabs WHERE id = ?').run(id);
  return res.changes > 0;
}

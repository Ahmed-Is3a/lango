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

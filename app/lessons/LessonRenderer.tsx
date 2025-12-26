'use client';
import React from 'react';

type LessonBlock =
  | { type: 'title'; text: string }
  | { type: 'header'; text: string }
  | { type: 'subheader'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'audio'; src: string; caption?: string }
  | { type: 'youtube'; videoId: string; caption?: string };

export default function LessonRenderer({ blocks }: { blocks: LessonBlock[] }) {
  const safeYouTube = (videoId: string) => videoId.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <div className="prose prose-indigo dark:prose-invert max-w-none">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'title':
            return <h1 key={i} className="text-3xl font-bold">{b.text}</h1>;
          case 'header':
            return <h2 key={i} className="text-2xl font-semibold">{b.text}</h2>;
          case 'subheader':
            return <h3 key={i} className="text-xl font-semibold">{b.text}</h3>;
          case 'paragraph':
            return <p key={i} className="whitespace-pre-line">{b.text}</p>;
          case 'table':
            return (
              <div key={i} className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {b.headers.map((h, idx) => (
                        <th key={idx} className="px-3 py-2 text-left border-b dark:border-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 border-b dark:border-gray-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'audio':
            return (
              <figure key={i} className="my-4">
                <audio controls className="w-full">
                  <source src={b.src} />
                </audio>
                {b.caption && <figcaption className="text-sm text-gray-500">{b.caption}</figcaption>}
              </figure>
            );
          case 'youtube':
            return (
              <figure key={i} className="my-4">
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-md"
                    src={`https://www.youtube.com/embed/${safeYouTube(b.videoId)}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                {b.caption && <figcaption className="text-sm text-gray-500">{b.caption}</figcaption>}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

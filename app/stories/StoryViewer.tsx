'use client';

import React, { useState } from 'react';

type Story = {
  id: number;
  title: string;
  slug: string;
  content: string;
  translation: string;
  coverImage?: string | null;
  audioUrl?: string | null;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  language: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function StoryViewer({ story }: { story: Story }) {
  const [showTranslation, setShowTranslation] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setShowTranslation((s) => !s)}
          className="px-4 py-2 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {showTranslation ? 'Hide Translation' : 'Show Translation'}
        </button>
        <button
          onClick={copyLink}
          className="px-4 py-2 rounded-full font-medium bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Share
        </button>
      </div>

      <div className={showTranslation ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}>
        <article className="prose prose-indigo dark:prose-invert max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Original</h2>
          <div className="whitespace-pre-line text-gray-800 dark:text-gray-200">
            {story.content}
          </div>
        </article>

        {showTranslation && (
          <article className="prose prose-indigo dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Translation</h2>
            <div className="whitespace-pre-line text-gray-800 dark:text-gray-200">
              {story.translation}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

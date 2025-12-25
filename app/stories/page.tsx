'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

enum StoryLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

interface Story {
  id?: string;
  title: string;
  slug: string;
  content: string;
  translation: string;
  coverImage?: string | null;
  audioUrl?: string | null;
  level: StoryLevel;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const levelColors: Record<StoryLevel, string> = {
  A1: 'bg-green-100 text-green-800',
  A2: 'bg-green-100 text-green-800',
  B1: 'bg-yellow-100 text-yellow-800',
  B2: 'bg-yellow-100 text-yellow-800',
  C1: 'bg-red-100 text-red-800',
  C2: 'bg-red-100 text-red-800',
};

export default function StoryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<StoryLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (!response.ok) throw new Error('Failed to fetch stories');
        const data: Story[] = await response.json();
        setStories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading stories');
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, []);

  useEffect(() => {
    let filtered = stories;

    if (selectedLevel !== 'all') {
      filtered = filtered.filter((story) => story.level === selectedLevel);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (story) =>
          story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          story.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStories(filtered);
  }, [stories, selectedLevel, searchQuery]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            📖 Stories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Learn through engaging short stories in your target language
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Level Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedLevel === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            All Levels
          </button>
          {Object.values(StoryLevel).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedLevel === level
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-8">
            Failed to load stories: {error}
          </div>
        )}

        {/* Stories Grid */}
        {!loading && !error && filteredStories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredStories.map((story) => (
              <Link
                key={story.slug}
                href={`/stories/${story.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Story Image */}
                  {story.coverImage ? (
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <span className="text-6xl">📖</span>
                    </div>
                  )}

                  {/* Story Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {story.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {story.content}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          levelColors[story.level]
                        }`}
                      >
                        {story.level}
                      </span>
                      {story.audioUrl && (
                        <span className="text-lg" title="Has audio">
                          🎵
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredStories.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📭</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No stories found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {stories.length === 0
                ? 'No stories available yet. Check back soon!'
                : 'Try adjusting your filters or search query'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LessonEditor from '../LessonEditor';
import { Block } from '../blockTypes';

type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type Level = { id: number; slug: string; title: string; description?: string | null; order: number };
type Vocabulary = { id: number; term: string; definition: string; language: string; imageUrl?: string };

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id === 'new' ? null : Number(params.id);

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSlug, setLessonSlug] = useState('');
  const [language, setLanguage] = useState('en');
  const [levelTag, setLevelTag] = useState<LessonLevel>('A1');
  const [order, setOrder] = useState(0);
  const [levelId, setLevelId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [selectedVocabIds, setSelectedVocabIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'draft' | 'published'>('draft');

  // Auto-generate slug from title
  useEffect(() => {
    if (!lessonTitle) return;
    const slug = lessonTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setLessonSlug(slug);
  }, [lessonTitle]);

  // Load vocabularies
  const loadVocabularies = async () => {
    try {
      const vocabRes = await fetch('/api/vocabs');
      const vocabData = await vocabRes.json();
      setVocabularies(Array.isArray(vocabData) ? vocabData : []);
    } catch {
      console.error('Error loading vocabularies');
    }
  };

  // Load lesson if editing existing
  useEffect(() => {
    const loadLessonAndLevels = async () => {
      try {
        // Load levels
        const levelsRes = await fetch('/api/levels');
        const levelsData = await levelsRes.json();
        setLevels(Array.isArray(levelsData) ? levelsData : []);

        // Load vocabularies
        await loadVocabularies();

        // Load lesson if editing
        if (lessonId) {
          const res = await fetch('/api/lessons?includeAll=true');
          const data = await res.json();
          const lessons = Array.isArray(data) ? data : [];
          const lesson = lessons.find((l: { id: number }) => l.id === lessonId);
          
          if (lesson) {
            setLessonTitle(lesson.title);
            setLessonSlug(lesson.slug);
            setLanguage(lesson.language);
            setLevelTag(lesson.levelTag);
            setOrder(lesson.order);
            setLevelId(lesson.levelId);
            setBlocks(lesson.blocks || []);
            setSelectedVocabIds(lesson.vocabularies?.map((v: Vocabulary) => v.id) || []);
            setCurrentStatus(lesson.status || 'draft');
          } else {
            setMessage('Lesson not found');
          }
        }
      } catch {
        setMessage('Error loading lesson');
      }
      setLoading(false);
    };

    loadLessonAndLevels();
  }, [lessonId]);

  const saveLessonWithStatus = async (status: 'draft' | 'published') => {
    if (!levelId) {
      setMessage('Please select a level');
      return;
    }
    if (!lessonTitle || !lessonSlug) {
      setMessage('Title and slug are required');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const method = lessonId ? 'PUT' : 'POST';
      const body = {
        ...(lessonId && { id: lessonId }),
        slug: lessonSlug,
        title: lessonTitle,
        levelId,
        language,
        levelTag,
        order,
        blocks,
        vocabularyIds: selectedVocabIds,
        status,
      };

      const res = await fetch('/api/lessons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Failed to ${lessonId ? 'update' : 'save'} lesson`);
      }

      const actionText = status === 'published' ? 'published' : 'saved as draft';
      setMessage(`Lesson ${actionText} successfully`);
      setCurrentStatus(status);
      
      // Only redirect if publishing, allow staying on page for drafts
      if (status === 'published') {
        setTimeout(() => {
          router.push('/admin/lessons');
        }, 1500);
      } else {
        // Clear message after a few seconds for drafts
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage((error as Error)?.message ?? 'Error saving lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => saveLessonWithStatus('draft');
  const handlePublish = () => saveLessonWithStatus('published');

  const handleCancel = () => {
    router.push('/admin/lessons');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {message && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg px-4 py-3 shadow-lg ${
            message.includes('Error') || message.includes('required')
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800'
          }`}>
            {message}
          </div>
        </div>
      )}
      <LessonEditor
        lessonTitle={lessonTitle}
        setLessonTitle={setLessonTitle}
        lessonSlug={lessonSlug}
        setLessonSlug={setLessonSlug}
        blocks={blocks}
        setBlocks={setBlocks}
        levelId={levelId}
        setLevelId={setLevelId}
        levels={levels}
        levelTag={levelTag}
        setLevelTag={setLevelTag}
        onSave={handlePublish}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onCancel={handleCancel}
        saving={saving}
        editingLessonId={lessonId}
        currentStatus={currentStatus}
        vocabularies={vocabularies}
        selectedVocabIds={selectedVocabIds}
        onVocabSelectionChange={setSelectedVocabIds}
        onVocabulariesUpdate={loadVocabularies}
      />
    </>
  );
}

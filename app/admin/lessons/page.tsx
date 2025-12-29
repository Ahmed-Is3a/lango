'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from 'react';
import { useEffect, useState } from 'react';
import LessonRenderer from '@/app/lessons/LessonRenderer';
import BlockEditor from './BlockEditor';
import { Block, BlockType, blockIcons, blockLabels, emptyBlock } from './blockTypes';

type Level = { id: number; slug: string; title: string; description?: string | null; order: number };
type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type Lesson = { id: number; slug: string; title: string; levelId: number;
                language: string; levelTag: LessonLevel; order: number; blocks: Block[] };

export default function AdminLessonsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [creatingLevel, setCreatingLevel] = useState(false);
  const [levelForm, setLevelForm] = useState({ slug: '', title: '', description: '', order: 0 });

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSlug, setLessonSlug] = useState('');
  const [language, setLanguage] = useState('en');
  const [levelTag, setLevelTag] = useState<LessonLevel>('A1');
  const [order, setOrder] = useState(0);
  const [levelId, setLevelId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  
  // Panel resize state
  const [sidebarWidth, setSidebarWidth] = useState(320); // 80 * 4 = 320px (w-80)
  const [previewWidth, setPreviewWidth] = useState(384); // intiall width in px (w-96)
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/levels');
        const data = await res.json();
        setLevels(Array.isArray(data) ? data : []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingLessons(true);
      try {
        const res = await fetch('/api/lessons');
        const data = await res.json();
        setLessons(Array.isArray(data) ? data : []);
      } catch {}
      finally {
        setLoadingLessons(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!lessonTitle) return;
    const slug = lessonTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setLessonSlug(slug);
  }, [lessonTitle]);

  const addBlock = (type: BlockType) => {
    setBlocks((prev) => {
      const next = [...prev, emptyBlock(type)];
      setSelectedBlockIndex(next.length - 1);
      return next;
    });
  };
  
  const updateBlock = (idx: number, next: Block) => {
    setBlocks((b) => b.map((blk, i) => (i === idx ? next : blk)));
  };
  
  const moveBlock = (idx: number, dir: -1 | 1) => {
    setBlocks((b) => {
      const next = [...b];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= next.length) return next;
      const [item] = next.splice(idx, 1);
      next.splice(newIdx, 0, item);
      setSelectedBlockIndex(newIdx);
      return next;
    });
  };
  
  const removeBlock = (idx: number) => {
    setBlocks((b) => b.filter((_, i) => i !== idx));
    setSelectedBlockIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setBlocks((b) => {
      const newBlocks = [...b];
      const [draggedItem] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(dropIndex, 0, draggedItem);
      return newBlocks;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Panel resize handlers
  const handleResizeStart = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    setIsResizing(side);
    setResizeStartX(e.clientX);
    if (side === 'left') {
      setResizeStartWidth(sidebarWidth);
    } else {
      setResizeStartWidth(previewWidth);
    }
  };

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartX;

      if (isResizing === 'left') {
        // For left panel, dragging right (positive deltaX) makes it wider
        const newWidth = Math.max(200, Math.min(600, resizeStartWidth + deltaX));
        setSidebarWidth(newWidth);
      } else if (isResizing === 'right') {
        // Subtract deltaX so dragging right (negative deltaX) decreases width
        const newWidth = Math.max(200, Math.min(window.innerWidth * 0.7, resizeStartWidth - deltaX));
        setPreviewWidth(newWidth);
      }
    };

    const handleResizeEnd = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resizeStartX, resizeStartWidth]);

  const onCreateLevel = async () => {
    setCreatingLevel(true);
    setMessage(null);
    try {
      const res = await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelForm),
      });
      if (!res.ok) throw new Error('Failed to create level');
      const lvl = await res.json();
      setLevels((ls) => [...ls, lvl]);
      setLevelId(lvl.id);
      setLevelForm({ slug: '', title: '', description: '', order: 0 });
      setMessage('Level created');
    } catch (e: any) {
      setMessage(e?.message ?? 'Error creating level');
    } finally {
      setCreatingLevel(false);
    }
  };

  const onSaveLesson = async () => {
    if (!levelId) { setMessage('Select or create a level'); return; }
    if (!lessonTitle || !lessonSlug) { setMessage('Title and slug required'); return; }
    if (!blocks.length) { setMessage('Add at least one block'); return; }

    setSaving(true);
    setMessage(null);
    try {
      const method = editingLessonId ? 'PUT' : 'POST';
      const body = {
        ...(editingLessonId && { id: editingLessonId }),
        slug: lessonSlug,
        title: lessonTitle,
        levelId,
        language,
        levelTag,
        order,
        blocks,
      };
      
      const res = await fetch('/api/lessons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Failed to ${editingLessonId ? 'update' : 'save'} lesson`);
      }
      setMessage(`Lesson ${editingLessonId ? 'updated' : 'saved'}`);
      
      const listRes = await fetch('/api/lessons');
      const listData = await listRes.json();
      setLessons(Array.isArray(listData) ? listData : []);
      
      onCancelEdit();
    } catch (e: any) {
      setMessage(e?.message ?? 'Error saving lesson');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteLesson = async (id: number) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLessons((ls) => ls.filter((l) => l.id !== id));
      setMessage('Lesson deleted');
    } catch (e: any) {
      setMessage(e?.message ?? 'Error deleting lesson');
    }
  };

  const onEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonSlug(lesson.slug);
    setLanguage(lesson.language);
    setLevelTag(lesson.levelTag);
    setOrder(lesson.order);
    setLevelId(lesson.levelId);
    setBlocks(lesson.blocks);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onCancelEdit = () => {
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonSlug('');
    setLanguage('en');
    setLevelTag('A1');
    setOrder(0);
    setLevelId(null);
    setBlocks([]);
    setSelectedBlockIndex(null);
  };

  const previewBlocks = blocks;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Builder</h1>
            {editingLessonId && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                Editing Lesson
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
            >
              {sidebarOpen ? '← Hide' : 'Show'} Blocks
            </button>
            <button
              onClick={() => setPreviewOpen(!previewOpen)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
            >
              {previewOpen ? 'Hide' : 'Show'} Preview →
            </button>
            <button
              onClick={onSaveLesson}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Save Lesson'}
            </button>
          </div>
        </div>
        {message && (
          <div className="px-6 pb-3">
            <div className={`rounded-lg px-4 py-2 text-sm ${
              message.includes('Error') || message.includes('required') 
                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {message}
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Blocks Panel */}
        {sidebarOpen && (
          <>
            <aside 
              className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto flex-shrink-0"
              style={{ width: `${sidebarWidth}px` }}
            >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Blocks</h2>
              <div className="space-y-2">
                {(['title','header','subheader','paragraph','table','audio','youtube','image'] as BlockType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group"
                  >
                    <span className="text-2xl">{blockIcons[type]}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {blockLabels[type]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {type === 'title' && 'Main heading'}
                        {type === 'header' && 'Section header'}
                        {type === 'subheader' && 'Subsection header'}
                        {type === 'paragraph' && 'Text content'}
                        {type === 'table' && 'Data table'}
                        {type === 'audio' && 'Audio player'}
                        {type === 'youtube' && 'Video embed'}
                        {type === 'image' && 'Image with caption'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Lesson Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                    <input
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="Lesson title"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label>
                    <input
                      value={lessonSlug}
                      onChange={(e) => setLessonSlug(e.target.value)}
                      placeholder="lesson-slug"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Level</label>
                      <select
                        value={levelTag}
                        onChange={(e) => setLevelTag(e.target.value as LessonLevel)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Level Category</label>
                    <select
                      value={levelId ?? ''}
                      onChange={(e) => setLevelId(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select level…</option>
                      {levels.map((l) => (<option key={l.id} value={l.id}>{l.title}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Order</label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value || '0', 10))}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Create Level</h3>
                <div className="space-y-3">
                  <input
                    value={levelForm.slug}
                    onChange={(e) => setLevelForm({ ...levelForm, slug: e.target.value })}
                    placeholder="Level slug"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    value={levelForm.title}
                    onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
                    placeholder="Level title"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <textarea
                    value={levelForm.description}
                    onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <input
                    type="number"
                    value={levelForm.order}
                    onChange={(e) => setLevelForm({ ...levelForm, order: parseInt(e.target.value || '0', 10) })}
                    placeholder="Order"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={onCreateLevel}
                    disabled={creatingLevel}
                    className="w-full px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creatingLevel ? 'Creating...' : 'Create Level'}
                  </button>
                </div>
              </div>
            </div>
          </aside>
          {/* Left Resize Handle */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'left')}
            className={`w-1 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors ${
              isResizing === 'left' ? 'bg-indigo-500' : ''
            }`}
          />
          </>
        )}

        {/* Center Canvas - Block Editor */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 min-w-0">
          <div className="max-w-4xl mx-auto p-6">
            {blocks.length === 0 ? (
              <div className="mt-20 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Start Building Your Lesson</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Add blocks from the sidebar to create your lesson content</p>
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Show Blocks Panel
                  </button>
                )}
              </div>
            ) : (
              <BlockEditor
                blocks={blocks}
                selectedBlockIndex={selectedBlockIndex}
                draggedIndex={draggedIndex}
                dragOverIndex={dragOverIndex}
                onSelectBlock={setSelectedBlockIndex}
                onUpdateBlock={updateBlock}
                onMoveBlock={moveBlock}
                onRemoveBlock={removeBlock}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              />
            )}
          </div>
        </main>

        {/* Right Sidebar - Preview */}
        {previewOpen && (
          <>
            {/* Right Resize Handle - positioned on left of preview */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'right')}
              className={`w-1 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors ${
                isResizing === 'right' ? 'bg-indigo-500' : ''
              }`}
            />
            <aside 
              className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto flex-shrink-0"
              style={{ width: `${previewWidth}px` }}
            >
            <div className="p-4 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h2>
            </div>
            <div className="p-4">
              {previewBlocks.length ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-800">
                  <LessonRenderer blocks={previewBlocks} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">👁️</div>
                  <p className="text-sm">Add blocks to see preview</p>
                </div>
              )}
            </div>
          </aside>
          </>
        )}
      </div>

      {/* Bottom Bar - Lessons List */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Existing Lessons</h2>
          {loadingLessons ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : lessons.length === 0 ? (
            <p className="text-sm text-gray-500">No lessons yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Title</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Level</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Language</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Tag</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Order</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => {
                    const level = levels.find((l) => l.id === lesson.levelId);
                    return (
                      <tr key={lesson.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{lesson.title}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{level?.title ?? 'N/A'}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{lesson.language}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {lesson.levelTag}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{lesson.order}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => onEditLesson(lesson)}
                              className="px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteLesson(lesson.id)}
                              className="px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
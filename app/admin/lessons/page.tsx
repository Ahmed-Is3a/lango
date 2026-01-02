'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Level = { id: number; slug: string; title: string; description?: string | null; order: number };
type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type Lesson = { id: number; slug: string; title: string; levelId: number;
                language: string; levelTag: LessonLevel; order: number; blocks: any[]; status?: 'draft' | 'published' };

const LEVELS: Level[] = [
  { id: 1, slug: 'a1', title: 'A1 (Beginner)', description: 'Elementary level', order: 1 },
  { id: 2, slug: 'a2', title: 'A2 (Elementary)', description: 'Elementary level', order: 2 },
  { id: 3, slug: 'b1', title: 'B1 (Intermediate)', description: 'Intermediate level', order: 3 },
  { id: 4, slug: 'b2', title: 'B2 (Upper Intermediate)', description: 'Upper intermediate level', order: 4 },
  { id: 5, slug: 'c1', title: 'C1 (Advanced)', description: 'Advanced level', order: 5 },
  { id: 6, slug: 'c2', title: 'C2 (Proficient)', description: 'Proficiency level', order: 6 },
];

export default function AdminLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [creatingLevel, setCreatingLevel] = useState(false);
  const [levelForm, setLevelForm] = useState({ slug: '', title: '', description: '', order: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; lessonId: number | null; lessonTitle: string }>({
    isOpen: false,
    lessonId: null,
    lessonTitle: ''
  });
  
  // Dashboard filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(''); // 'all', 'draft', 'published'

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
      setLevelForm({ slug: '', title: '', description: '', order: 0 });
      setMessage('Level created');
    } catch (e: any) {
      setMessage(e?.message ?? 'Error creating level');
    } finally {
      setCreatingLevel(false);
    }
  };

  const onDeleteLesson = async (lessonId: number, lessonTitle: string) => {
    setDeleteConfirmModal({ isOpen: true, lessonId, lessonTitle });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmModal.lessonId) return;
    
    try {
      const res = await fetch(`/api/lessons?id=${deleteConfirmModal.lessonId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLessons((ls) => ls.filter((l) => l.id !== deleteConfirmModal.lessonId));
      setMessage('Lesson deleted successfully');
    } catch (e: any) {
      setMessage(e?.message ?? 'Error deleting lesson');
    } finally {
      setDeleteConfirmModal({ isOpen: false, lessonId: null, lessonTitle: '' });
    }
  };

  const onCreateNewLesson = () => {
    router.push('/admin/lessons/new');
  };

  const onEditLesson = (lesson: Lesson) => {
    router.push(`/admin/lessons/${lesson.id}`);
  };


  // Filtered lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !filterLevel || lesson.levelTag === filterLevel;
    const matchesStatus = !filterStatus || lesson.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const publishedCount = lessons.filter(l => l.status === 'published').length;
  const draftCount = lessons.filter(l => l.status === 'draft' || !l.status).length;

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex overflow-hidden h-screen">
        {/* Sidebar */}
        <aside className="w-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-full z-20">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-gray-500 rounded-full size-10 flex items-center justify-center text-white font-bold">
                D
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">Deutsch CMS</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-normal">Admin Workspace</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-1">
          <Link
            className="flex items-center gap-3 py-2.5 rounded-lg bg-primary/10 text-primary dark:text-blue-400"
            href="/admin"
          >
            <svg
              className="w-5 h-5 text-primary dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            href="/admin/lessons"
          >
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 2c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H5zm0 2h10v10H5V4zm12 0v10h2V4h-2zm0 12H5v2h12v-2z" />
            </svg>
            <span className="text-sm font-medium">Lessons</span>
          </Link>
          <a
            className="flex items-center gap-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            href="#"
          >
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <span className="text-sm font-medium">Media Library</span>
          </a>
          <a
            className="flex items-center gap-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            href="#"
          >
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <span className="text-sm font-medium">Users</span>
          </a>
          <a
            className="flex items-center gap-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            href="#"
          >
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33c-.22-.08-.47 0-.59.22L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48l2.03 1.58C4.84 11.36 4.8 11.69 4.8 12s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.64l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6z" />
            </svg>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Scrollable Content Area */}
          <div className="flex-1 p-4 overflow-y-auto scroll-smooth">
            <div className="max-w-7xl mx-auto flex flex-col gap-2">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <a className="hover:text-primary transition-colors" href="#">Home</a>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.58L10 18l6-6-6-6-1.41 1.41L13.17 12z" /></svg>
                <span className="font-medium text-gray-900 dark:text-white">Lessons</span>
              </div>

              {/* Page Heading & Actions */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Lesson Management</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-base">Manage your German language curriculum and exercises.</p>
                </div>
                <button 
                  onClick={onCreateNewLesson}
                  className="bg-blue-700 text-white hover:bg-blue-500 px-6 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                  <span>Create New Lesson</span>
                </button>
              </div>

              {message && (
                <div className={`rounded-lg px-4 py-3 text-sm ${
                  message.includes('Error') || message.includes('required') 
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                    : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {message}
                </div>
              )}

              {/* Stats Overview */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Total Lessons</span>
                
                  <svg
                    fill="#000000"
                    height="30px"
                    width="30px"
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 512 512"
                    xmlSpace="preserve"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <g>
                        {" "}
                        <g>
                          {" "}
                          <path d="M472.77,267.844h13.402c14.242,0,25.828-11.586,25.828-25.828c0-6.879-2.681-13.361-7.578-18.281 c-4.889-4.867-11.371-7.547-18.25-7.547h-14.996C495.909,198,512,168.713,512,135.726c0-55.048-44.786-99.834-99.834-99.834 H25.832c-14.242,0-25.828,11.586-25.828,25.828S11.59,87.548,25.832,87.548H39.24c11.716,30.943,11.716,65.412,0,96.355H25.832 c-14.242,0-25.828,11.586-25.828,25.828s11.586,25.828,25.828,25.828h14.996C16.092,253.75,0,283.039,0,316.026 c0,26.647,10.385,51.717,29.245,70.592c16.565,16.565,37.932,26.583,60.966,28.771v51.033c0,3.409,1.792,6.567,4.717,8.314 c2.928,1.749,6.556,1.83,9.558,0.214l38.596-20.773l38.596,20.773c1.435,0.772,3.013,1.157,4.591,1.157 c1.721,0,3.44-0.458,4.968-1.371c2.926-1.749,4.717-4.906,4.717-8.314v-50.571h290.216c14.242,0,25.828-11.586,25.828-25.828 c0-6.901-2.686-13.388-7.578-18.28c-4.889-4.867-11.371-7.548-18.25-7.548h-13.402c-3.952-10.419-6.618-21.267-7.91-32.36 c-0.624-5.226-0.94-10.546-0.94-15.809s0.316-10.582,0.943-15.836C466.154,289.111,468.82,278.26,472.77,267.844z M25.832,216.189 c-3.56,0-6.457-2.897-6.457-6.457c0-3.56,2.897-6.457,6.457-6.457h383.352c24.808,0,47.563-13.548,59.385-35.358 c10.927-20.156,10.927-44.224,0-64.38c-11.823-21.81-34.577-35.358-59.385-35.358H45.768H25.832c-3.56,0-6.457-2.897-6.457-6.457 c0-3.56,2.897-6.457,6.457-6.457h386.336c44.367,0,80.463,36.096,80.463,80.463c0,44.35-36.069,80.435-80.413,80.462H25.832z M164.459,143H67.211c0.226-4.845,0.226-9.697,0-14.541h47.955c5.349,0,9.685-4.337,9.685-9.685c0-5.349-4.337-9.685-9.685-9.685 H65.084c-1.259-7.273-3.009-14.475-5.308-21.538h349.408c17.693,0,33.924,9.664,42.355,25.218c7.794,14.376,7.794,31.541,0,45.918 c-8.432,15.555-24.662,25.218-42.355,25.218H59.776c2.297-7.061,4.049-14.262,5.308-21.534h99.376 c5.349,0,9.685-4.336,9.685-9.685C174.145,147.336,169.808,143,164.459,143z M176.586,450.21l-28.91-15.561 c-1.433-0.771-3.012-1.157-4.591-1.157s-3.157,0.386-4.591,1.157l-28.91,15.561V342.666h67.003V450.21z M186.271,323.295H99.897 c-5.349,0-9.685,4.337-9.685,9.685v29.508c-4.218-1.144-8.283-2.839-12.045-5.086c-7.456-4.427-13.575-10.795-17.7-18.423 c-3.804-7.019-5.815-14.957-5.815-22.955c0-8.009,2.011-15.946,5.818-22.96c8.424-15.557,24.653-25.222,42.35-25.222h349.396 c-2.299,7.043-4.08,14.242-5.345,21.539h-50.034c-5.349,0-9.685,4.337-9.685,9.685c0,5.349,4.336,9.685,9.685,9.685h47.902 c-0.116,2.427-0.19,4.854-0.19,7.272s0.074,4.844,0.19,7.269h-97.194c-5.349,0-9.685,4.336-9.685,9.685 c0,5.349,4.337,9.685,9.685,9.685h99.326c1.267,7.296,3.046,14.49,5.344,21.529H195.957v-21.529h31.639 c5.349,0,9.685-4.337,9.685-9.685s-4.337-9.685-9.685-9.685H186.271z M486.172,383.566c1.721,0,3.349,0.677,4.568,1.889 c1.218,1.218,1.889,2.841,1.889,4.568c0,3.56-2.897,6.457-6.457,6.457H195.957v-12.914H486.172z M102.821,248.473 c-24.815,0-47.571,13.553-59.38,35.36c-5.339,9.833-8.16,20.964-8.16,32.193c0,11.213,2.82,22.342,8.153,32.178 c5.785,10.699,14.376,19.64,24.823,25.843c6.758,4.034,14.222,6.83,21.955,8.302v13.54c-17.85-2.114-34.369-10.069-47.266-22.966 c-15.202-15.214-23.574-35.422-23.574-56.898c0-44.353,36.07-80.438,80.418-80.466h312.378c0.017,0,0.034-0.001,0.05-0.001h73.956 c1.721,0,3.35,0.677,4.552,1.874c1.228,1.233,1.905,2.862,1.905,4.583c0,3.56-2.897,6.457-6.457,6.457H102.821z"></path>{" "}
                        </g>{" "}
                      </g>{" "}
                      <g>
                        {" "}
                        <g>
                          {" "}
                          <circle
                            cx="197.984"
                            cy="152.682"
                            r="9.685"
                          ></circle>{" "}
                        </g>{" "}
                      </g>{" "}
                    </g>
                  </svg>
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{publishedCount}</span>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59V9h2v4.59l8-8 4 4V6h2z"/>
                    </svg>
                    Active lessons
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Drafts</span>
                    <svg className="w-9 h-9 text-orange-500 bg-orange-500/10 p-1.5 rounded-md" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                      <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{draftCount}</span>
                  <span className="text-xs text-gray-500 font-medium mt-1">Work in progress</span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Published</span>
                    <svg className="w-9 h-9 text-green-500 bg-green-500/10 p-1.5 rounded-md" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{publishedCount}</span>
                  <span className="text-xs text-green-600 font-medium mt-1">Active for students</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Drafts</span>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full size-10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{draftCount}</span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1">Unpublished lessons</span>
                </div>
              </div>

              {/* Toolbar: Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm items-center">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" 
                    placeholder="Search lesson titles..." 
                    type="text"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-30">
                    <select 
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full appearance-none px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-1 outline-none cursor-pointer"
                    >
                      <option value="">All Levels</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                    </select>
                    <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                  <div className="relative w-full md:w-30">
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full appearance-none px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                    >
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                    <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Lessons Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  {loadingLessons ? (
                    <div className="p-12 text-center text-gray-500">Loading lessons...</div>
                  ) : filteredLessons.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No lessons found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {searchQuery || filterLevel ? 'Try adjusting your filters' : 'Get started by creating your first lesson'}
                      </p>
                      {!searchQuery && !filterLevel && (
                        <button 
                          onClick={onCreateNewLesson}
                          className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                          <span>Create New Lesson</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Lesson Title</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Level</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Language</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden md:table-cell">Order</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {filteredLessons.map((lesson) => {
                            const level = LEVELS.find((l) => l.id === lesson.levelId);
                            const levelColors: Record<LessonLevel, string> = {
                              A1: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                              A2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
                              B1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                              B2: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
                              C1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                              C2: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
                            };

                            return (
                              <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-400 font-bold text-sm shrink-0">
                                      {lesson.order.toString().padStart(2, '0')}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-gray-900 dark:text-white">{lesson.title}</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{level?.title ?? 'N/A'}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[lesson.levelTag]}`}>
                                    {lesson.levelTag}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    lesson.status === 'published' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  }`}>
                                    {lesson.status === 'published' ? 'Published' : 'Draft'}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{lesson.language.toUpperCase()}</span>
                                </td>
                                <td className="py-4 px-6 hidden md:table-cell">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{lesson.order}</span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => onEditLesson(lesson)}
                                      className="p-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 text-gray-400 hover:text-primary transition-colors" 
                                      title="Edit"
                                    >
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    </button>
                                    <button 
                                      onClick={() => onDeleteLesson(lesson.id, lesson.title)}
                                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" 
                                      title="Delete"
                                    >
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/></svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLessons.length}</span> of <span className="font-medium">{filteredLessons.length}</span> results
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="h-10"></div>
            </div>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Delete Lesson</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to delete this lesson?</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lesson Title:</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{deleteConfirmModal.lessonTitle}</p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-6 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  <span>This action cannot be undone. All lesson content will be permanently deleted.</span>
                </p>
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-6 justify-center">
                <button
                  onClick={() => setDeleteConfirmModal({ isOpen: false, lessonId: null, lessonTitle: '' })}
                  className="px-4 py-2 rounded-lg  border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/></svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
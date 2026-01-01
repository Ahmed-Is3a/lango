"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalLessons: number;
  totalLevels: number;
  totalVocabs: number;
  totalStories: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalLessons: 0,
    totalLevels: 0,
    totalVocabs: 0,
    totalStories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lessonsRes, levelsRes, vocabsRes, storiesRes] =
          await Promise.all([
            fetch("/api/lessons"),
            fetch("/api/levels"),
            fetch("/api/vocabs"),
            fetch("/api/stories"),
          ]);

        const [lessons, levels, vocabs, stories] = await Promise.all([
          lessonsRes.json().catch(() => []),
          levelsRes.json().catch(() => []),
          vocabsRes.json().catch(() => []),
          storiesRes.json().catch(() => []),
        ]);

        setStats({
          totalLessons: Array.isArray(lessons) ? lessons.length : 0,
          totalLevels: Array.isArray(levels) ? levels.length : 0,
          totalVocabs: Array.isArray(vocabs) ? vocabs.length : 0,
          totalStories: Array.isArray(stories) ? stories.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex overflow-hidden h-screen">
      {/* Sidebar */}
      <aside className="w-52 bg-white dark:bg-gray-800 border-r-4 border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-full z-20">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full size-10 flex items-center justify-center text-white font-bold">
              D
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                Deutsch CMS
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                Admin Workspace
              </p>
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
          <Link
            href="/"
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-sm font-medium">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                Admin Dashboard
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-base">
                Welcome to your content management system.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">
                    Lessons
                  </span>

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
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? "..." : stats.totalLessons}
                </span>
                <Link
                  href="/admin/lessons"
                  className="text-sm text-blue-500 font-medium hover:underline mt-1"
                >
                  Manage lessons →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">
                    Levels
                  </span>
                  <svg
                    className="w-9 h-9 text-purple-500 bg-purple-500/10 p-1.5 rounded-md"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? "..." : stats.totalLevels}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">
                  Course categories
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">
                    Vocabulary
                  </span>
                  <svg className="w-9 h-9 text-green-500 bg-green-500/10 p-1.5 rounded-md" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? "..." : stats.totalVocabs}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">
                  Words & phrases
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">
                    Stories
                  </span>
                  <svg className="w-9 h-9 text-orange-500 bg-orange-500/10 p-1.5 rounded-md" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? "..." : stats.totalStories}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">
                  Reading materials
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  href="/admin/lessons"
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary">
                      Create New Lesson
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Add a new lesson to the course
                    </div>
                  </div>
                </Link>

                <button className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2z"/>
                    <path d="M11 3L5.5 8.5l1.42 1.41L11 5.83V15h2V5.83l4.08 4.08L18.5 8.5z"/>
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary">
                      Import Content
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Bulk import from CSV or JSON
                    </div>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary">
                      View Analytics
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      User progress and engagement
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      System initialized
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CMS ready for content creation
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
              </div>
            </div>

            <div className="h-10"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

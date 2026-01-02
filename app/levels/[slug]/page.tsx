import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export default async function LevelPage({ params }: Params) {
  const slug = (await params).slug;
  const level = await prisma.level.findUnique({ where: { slug } });
  if (!level) notFound();

  const lessons = await prisma.lesson.findMany({
    where: { levelId: level.id },
    orderBy: { order: 'asc' },
  });

  return (
    <>
      <div className="relative flex min-h-screen w-full bg-[#f6f6f8] dark:bg-[#101622]">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:flex w-[280px] flex-col border-r border-[#dbdfe6] dark:border-gray-800 bg-white dark:bg-[#111318] shrink-0 fixed h-full top-0 left-0 z-50">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3 px-2">
                <div className="bg-[#135bec]/10 rounded-xl p-2 flex items-center justify-center">
                  <svg className="text-[#135bec]" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[#111318] dark:text-white text-lg font-bold leading-normal">LinguaLearn</h1>
                  <p className="text-[#616f89] dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Level</p>
                </div>
              </div>
              <nav className="flex flex-col gap-2">
                <Link href="/levels" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#135bec] text-white shadow-sm transition-colors group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>
                  <p className="text-sm font-semibold leading-normal">Lessons</p>
                </Link>
                <Link href="/learn" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f2f4] dark:hover:bg-gray-800 text-[#616f89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
                  <p className="text-sm font-medium leading-normal">My Course</p>
                </Link>
                <Link href="/vocabs" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f2f4] dark:hover:bg-gray-800 text-[#616f89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z"/></svg>
                  <p className="text-sm font-medium leading-normal">Vocabulary</p>
                </Link>
                <Link href="/progress" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f2f4] dark:hover:bg-gray-800 text-[#616f89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
                  <p className="text-sm font-medium leading-normal">Achievements</p>
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:ml-[280px]">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#111318] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <svg className="text-[#135bec]" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
              <span className="font-bold text-lg">LinguaLearn</span>
            </div>
          </div>

          <div className="p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full">
            {/* Hero Header */}
            <div className="flex flex-col lg:flex-row gap-8 mb-10 items-start lg:items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-[#111318] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">{level.title}</h1>
                {level.description && <p className="text-[#616f89] dark:text-gray-400 text-base font-normal">{level.description}</p>}
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-3 bg-white dark:bg-[#1e293b] px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 lg:flex-none min-w-[140px]">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.48 12.35c-.29-.74-.71-1.45-1.25-2.12C17.59 9.43 16.81 8.73 16 8c0 .26.01.52.01.78-.99-.67-2.01-1.37-3.01-2.11-.37-.28-.74-.56-1.08-.88-.25-.24-.47-.5-.67-.79L10.7 4.5l-.46.53c-.25.27-.51.55-.76.82-.97 1.05-1.99 2.16-2.4 3.61-.32 1.12-.31 2.31.1 3.45.66 1.85 2.15 3.34 3.98 3.97l.01-.01c-.49-.54-.86-1.2-1.07-1.91-.27-.89-.23-1.88.15-2.73.34-.76.95-1.42 1.68-1.85.2-.12.42-.21.64-.27l.21 1.42c.6-.32 1.12-.76 1.55-1.27.81-.97 1.38-2.11 1.76-3.3.64 1.09 1.27 2.19 1.89 3.29.18.32.36.65.52.98.34.68.62 1.38.8 2.1.44 1.73.23 3.67-.64 5.22-.79 1.4-2.09 2.45-3.63 2.95-.65.21-1.32.33-2 .37 2.25-.19 4.42-1.27 5.89-2.96 1.67-1.92 2.49-4.54 2.06-7.01z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#616f89] dark:text-gray-400 font-medium">Lessons</p>
                    <p className="text-lg font-bold text-[#111318] dark:text-white">{lessons.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-[#1e293b] px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 lg:flex-none min-w-[140px]">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#135bec]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 14h3v6H5v-6zm4-7h3v13H9V7zm4-4h3v17h-3V3zm4 7h3v10h-3V10z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#616f89] dark:text-gray-400 font-medium">Level</p>
                    <p className="text-lg font-bold text-[#111318] dark:text-white">A1</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Lessons Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-[#111318] dark:text-white">Explore Lessons</h3>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {lessons.map((lesson, idx) => (
                <Link key={lesson.slug} href={`/lessons/${lesson.slug}`}>
                  <div className="flex flex-col bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group h-full">
                    <div className="h-40 w-full bg-gradient-to-br from-[#135bec] to-[#3b82f6] relative">
                      <div className="w-full h-full bg-black/10 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <svg className="text-white opacity-30" width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">Lesson</span>
                        <h5 className="text-lg font-bold text-[#111318] dark:text-white leading-tight group-hover:text-[#135bec] transition-colors">{lesson.title}</h5>
                      </div>
                      <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                          <span>{lesson.order}</span>
                        </div>
                        <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-[#111318] dark:text-white h-8 w-8 rounded-full flex items-center justify-center transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="h-20"></div>
          </div>
        </main>
      </div>
    </>
  );
}

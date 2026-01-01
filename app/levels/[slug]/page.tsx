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
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div className="relative flex min-h-screen w-full bg-[#f6f6f8] dark:bg-[#101622]">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:flex w-[280px] flex-col border-r border-[#dbdfe6] dark:border-gray-800 bg-white dark:bg-[#111318] shrink-0 fixed h-full top-0 left-0 z-50">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3 px-2">
                <div className="bg-[#135bec]/10 rounded-xl p-2 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#135bec] text-3xl">language</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[#111318] dark:text-white text-lg font-bold leading-normal">LinguaLearn</h1>
                  <p className="text-[#616f89] dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{level.levelTag ?? 'Level'}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-2">
                <Link href="/levels" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#135bec] text-white shadow-sm transition-colors group">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>grid_view</span>
                  <p className="text-sm font-semibold leading-normal">Lessons</p>
                </Link>
                <Link href="/learn" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f2f4] dark:hover:bg-gray-800 text-[#616f89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors group">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                  <p className="text-sm font-medium leading-normal">My Course</p>
                </Link>
                <Link href="/vocabs" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f2f4] dark:hover:bg-gray-800 text-[#616f89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors group">
                  <span className="material-symbols-outlined text-[24px]">book_2</span>
                  <p className="text-sm font-medium leading-normal">Vocabulary</p>
                </Link>
                <Link href="/progress" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f2f4] dark:hover:bg-gray-800 text-[#616f89] dark:text-gray-400 hover:text-[#111318] dark:hover:text-white transition-colors group">
                  <span className="material-symbols-outlined text-[24px]">trophy</span>
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
              <span className="material-symbols-outlined text-[#135bec] text-2xl">language</span>
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
                    <span className="material-symbols-outlined">local_fire_department</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#616f89] dark:text-gray-400 font-medium">Lessons</p>
                    <p className="text-lg font-bold text-[#111318] dark:text-white">{lessons.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-[#1e293b] px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 lg:flex-none min-w-[140px]">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#135bec]">
                    <span className="material-symbols-outlined">signal_cellular_alt</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#616f89] dark:text-gray-400 font-medium">Level</p>
                    <p className="text-lg font-bold text-[#111318] dark:text-white">{level.levelTag ?? 'A1'}</p>
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
                        <span className="material-symbols-outlined text-white text-6xl opacity-30">book</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">{lesson.levelTag}</span>
                        <h5 className="text-lg font-bold text-[#111318] dark:text-white leading-tight group-hover:text-[#135bec] transition-colors">{lesson.title}</h5>
                      </div>
                      <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{lesson.order}</span>
                        </div>
                        <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-[#111318] dark:text-white h-8 w-8 rounded-full flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
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

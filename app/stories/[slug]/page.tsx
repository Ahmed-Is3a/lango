import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StoryViewer from '@/app/stories/StoryViewer';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; };

async function getStory(slug: string) {
  const story = await prisma.story.findUnique({ where: { slug } });
  return story;
}

export async function generateMetadata({ params }: Params) {
    const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return { title: 'Story Not Found' };
  return {
    title: `${story.title} • Lango Stories`,
    description: story.content.slice(0, 160),
  };
}

export default async function StoryPage({ params }: Params) {
    const slug = (await params).slug;
  const story = await getStory(slug);
  if (!story) notFound();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-2">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* <div className="mb-4">
          <Link href="/stories" className="text-indigo-600 hover:underline">← Back to Stories</Link>
        </div> */}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {story.coverImage ? (
            <div className="w-full overflow-hidden">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-40 md:h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <span className="text-6xl">📖</span>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{story.title}</h1>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {story.level}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Language: {story.language}</p>

            {story.audioUrl && (
              <div className="mb-6">
                <audio controls className="w-full">
                  <source src={story.audioUrl} />
                </audio>
              </div>
            )}

            <StoryViewer story={story} />
          </div>
        </div>
      </div>
    </main>
  );
}

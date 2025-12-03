import Link from "next/link";
import { getLanguageById, getLessonsForLanguage, getFlashcardsForLanguage } from "../../lib/queries";

type Props = { params: { id: string } };

export default async function LanguageDetailPage({ params }: Props) {
    const resolvedParams = await params;
    const language = await getLanguageById(resolvedParams.id);
  if (!language) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p>Language not found.</p>
      </main>
    );
  }

  const [lessons, cards] = await Promise.all([
    getLessonsForLanguage(language.id),
    getFlashcardsForLanguage(language.id),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-2">{language.name}</h1>
      <p className="text-gray-600 mb-6">Level: {language.level}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Lessons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson: any) => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="card">
              <div>
                <h3 className="card-title">{lesson.title}</h3>
                <p className="text-sm text-gray-600">{lesson.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Flashcards</h2>
        <Link href={`/flashcards/${language.id}`} className="card">
          <div>
            <h3 className="card-title">{language.name} Flashcards</h3>
            <p className="text-sm text-gray-600">{cards.length} cards</p>
          </div>
        </Link>
      </section>
    </main>
  );
}

import FlashcardsView from "@/app/components/FlashcardsView";
import { getFlashcardsForLanguage, getLanguageById } from "@/app/lib/queries";

type Props = { params: { languageId: string } };

export default async function FlashcardsPage({ params }: Props) {
    const resolvedParams = await params;
  const language = await getLanguageById(resolvedParams.languageId);
  if (!language) {
    return <main className="mx-auto max-w-4xl p-8"><p>Language not found.</p></main>;
  }
  const cards = await getFlashcardsForLanguage(language.id);
  return (
    <FlashcardsView
      languageName={language.name}
      cards={cards.map((c: any) => ({ id: c.id, term: c.term, definition: c.definition }))}
    />
  );
}

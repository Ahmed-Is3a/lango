import { getFlashcardById } from "@/app/lib/crud/flashcard";
import { getAllLanguages } from "@/app/lib/crud/language";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function EditFlashcardPage({ params }: { params: { id: string } }) {
  const card = await getFlashcardById(params.id);
  const languages = await getAllLanguages();
  if (!card) return <div>Flashcard not found!</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Flashcard</h1>
      <form action={`/admin/flashcards/${card.id}/update`} method="POST" className="space-y-4">
        <input type="hidden" name="id" value={card.id} />
        <label className="block">
          <span className="block text-sm mb-1">Language</span>
          <select name="languageId" defaultValue={card.languageId} className="border p-2 w-full">
            {languages.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
        <input name="term" defaultValue={card.term} className="border p-2 w-full" />
        <input name="definition" defaultValue={card.definition} className="border p-2 w-full" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Update</button>
      </form>

      <ConfirmDeleteForm
        action={`/admin/flashcards/${card.id}/delete`}
        id={card.id}
        label="Delete"
        buttonClassName="px-4 py-2 bg-red-600 text-white rounded"
        formClassName="mt-6"
        confirmMessage={`Delete flashcard '${card.term}'? This cannot be undone.`}
      />
    </div>
  );
}

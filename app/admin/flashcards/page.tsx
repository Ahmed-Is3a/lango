import Link from "next/link";
import { getAllFlashcards } from "@/app/lib/crud/flashcard";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function FlashcardsAdminPage() {
  const flashcards = await getAllFlashcards();
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <Link href="/admin/flashcards/new" className="px-4 py-2 bg-blue-600 text-white rounded">
          + Add Flashcard
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Term</th>
            <th className="p-2 text-left">Language</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {flashcards.map((c: any) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.term}</td>
              <td className="p-2">{c.language?.name}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/admin/flashcards/${c.id}`} className="text-blue-600">Edit</Link>
                <ConfirmDeleteForm
                  action={`/admin/flashcards/${c.id}/delete`}
                  id={c.id}
                  buttonClassName="text-red-600"
                  confirmMessage={`Delete flashcard '${c.term}'? This cannot be undone.`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

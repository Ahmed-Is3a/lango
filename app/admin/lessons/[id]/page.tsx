import { getAllLanguages } from "@/app/lib/crud/language";
import { getLessonById } from "@/app/lib/crud/lesson";
import Link from "next/link";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function EditLessonPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
    const lesson = await getLessonById(resolvedParams.id);
  const languages = await getAllLanguages();

  if (!lesson) {
    return <div>Lesson not found!</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Lesson</h1>

      <form action={`/admin/lessons/${lesson.id}/update`} method="POST" className="space-y-4">
        <input type="hidden" name="id" value={lesson.id} />

        <label className="block">
          <span className="block text-sm mb-1">Language</span>
          <select name="languageId" defaultValue={lesson.languageId} className="border p-2 w-full">
            {languages.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>

        <input name="title" defaultValue={lesson.title} className="border p-2 w-full" />
        <input name="description" defaultValue={lesson.description} className="border p-2 w-full" />
        <textarea name="content" defaultValue={lesson.content} className="border p-2 w-full min-h-32" />

        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Update</button>
      </form>

      <ConfirmDeleteForm
        action={`/admin/lessons/${lesson.id}/delete`}
        id={lesson.id}
        label="Delete"
        buttonClassName="px-4 py-2 bg-red-600 text-white rounded"
        formClassName="mt-6"
        confirmMessage={`Delete lesson '${lesson.title}'? This cannot be undone.`}
      />

      <section className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Vocabularies</h2>
        </div>

        <form action={`/admin/lessons/${lesson.id}/vocab/create`} method="POST" className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input name="term" placeholder="Term" className="border p-2 w-full" required />
          <input name="definition" placeholder="Definition" className="border p-2 w-full" required />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Add</button>
        </form>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Term</th>
              <th className="p-2 text-left">Definition</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lesson.vocabularies?.map((v: any) => (
              <tr key={v.id} className="border-t">
                <td className="p-2">{v.term}</td>
                <td className="p-2">{v.definition}</td>
                <td className="p-2 flex gap-2">
                  <form action={`/admin/vocab/${v.id}/add-to-flashcards`} method="POST">
                    <input type="hidden" name="id" value={v.id} />
                    <button className="text-green-700" type="submit">Add to Flashcards</button>
                  </form>
                  <form action={`/admin/vocab/${v.id}/remove-from-flashcards`} method="POST">
                    <input type="hidden" name="id" value={v.id} />
                    <button className="text-amber-700" type="submit">Remove from Flashcards</button>
                  </form>
                  <ConfirmDeleteForm
                    action={`/admin/vocab/${v.id}/delete`}
                    id={v.id}
                    buttonClassName="text-red-600"
                    confirmMessage={`Delete vocabulary '${v.term}'?`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

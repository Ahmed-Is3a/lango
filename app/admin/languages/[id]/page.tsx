import { getLanguageById } from "@/app/lib/crud/language";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function EditLanguage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;

  if (!resolvedParams.id) {
    console.error("No ID provided in the params.");
    return <div>Error: No ID found!</div>;
  }

  const lang = await getLanguageById(resolvedParams.id);

  if (!lang) {
    console.error(`Language with ID ${resolvedParams.id} not found.`);
    return <div>Language not found!</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Language</h1>

      <form action={`/admin/languages/${lang.id}/update`} method="POST" className="space-y-4">
        <input type="hidden" name="id" value={lang.id} />

        <input
          name="name"
          defaultValue={lang.name}
          className="border p-2 w-full"
        />

        <select
          name="level"
          defaultValue={lang.level}
          className="border p-2 w-full"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Update
        </button>
      </form>

      <ConfirmDeleteForm
        action={`/admin/languages/${lang.id}/delete`}
        id={lang.id}
        label="Delete"
        buttonClassName="px-4 py-2 bg-red-600 text-white rounded"
        formClassName="mt-6"
        confirmMessage={`Delete ${lang.name}? This cannot be undone.`}
      />
    </div>
  );
}

import Link from "next/link";
import { getAllLanguages } from "@/app/lib/crud/language";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function LanguagesAdminPage() {
  const languages = await getAllLanguages();
  

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Languages</h1>
        <Link
          href="/admin/languages/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Add Language
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Level</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {languages.map((lang: any) => (
            <tr key={lang.id} className="border-t">
              <td className="p-2">{lang.name}</td>
              <td className="p-2">{lang.level}</td>
              <td className="p-2 flex gap-2">
                <Link
                  key={lang.id}
                  href={`/admin/languages/${lang.id}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>

                <ConfirmDeleteForm
                  action={`/admin/languages/${lang.id}/delete`}
                  id={lang.id}
                  buttonClassName="text-red-600"
                  confirmMessage={`Delete ${lang.name}? This cannot be undone.`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

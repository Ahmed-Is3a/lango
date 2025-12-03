import Link from "next/link";
import { getAllLessons } from "@/app/lib/crud/lesson";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function LessonsAdminPage() {
  const lessons = await getAllLessons();
  

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Link
          href="/admin/lessons/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Add Lesson
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Language</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {lessons.map((lesson: any) => (
            <tr key={lesson.id} className="border-t">
              <td className="p-2">{lesson.title}</td>
              <td className="p-2">{lesson.language?.name}</td>
              <td className="p-2 flex gap-2">
                <Link
                  key={lesson.id}
                  href={`/admin/lessons/${lesson.id}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>

                <ConfirmDeleteForm
                  action={`/admin/lessons/${lesson.id}/delete`}
                  id={lesson.id}
                  buttonClassName="text-red-600"
                  confirmMessage={`Delete lesson '${lesson.title}'? This cannot be undone.`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

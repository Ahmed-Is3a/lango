import Link from "next/link";
import { getAllExercises } from "@/app/lib/crud/exercise";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function ExercisesAdminPage() {
  const exercises = await getAllExercises();
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Link href="/admin/exercises/new" className="px-4 py-2 bg-blue-600 text-white rounded">
          + Add Exercise
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Prompt</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Lesson</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex: any) => (
            <tr key={ex.id} className="border-t">
              <td className="p-2">{ex.prompt}</td>
              <td className="p-2">{ex.type}</td>
              <td className="p-2">{ex.lesson?.title}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/admin/exercises/${ex.id}`} className="text-blue-600">Edit</Link>
                <ConfirmDeleteForm
                  action={`/admin/exercises/${ex.id}/delete`}
                  id={ex.id}
                  buttonClassName="text-red-600"
                  confirmMessage={`Delete exercise '${ex.prompt}'? This cannot be undone.`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

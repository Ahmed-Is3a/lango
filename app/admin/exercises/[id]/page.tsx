import { getExerciseById } from "@/app/lib/crud/exercise";
import { getAllLessons } from "@/app/lib/crud/lesson";
import ConfirmDeleteForm from "@/app/components/ConfirmDeleteForm";

export default async function EditExercisePage({ params }: { params: { id: string } }) {
  const exercise = await getExerciseById(params.id);
  const lessons = await getAllLessons();
  if (!exercise) return <div>Exercise not found!</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Exercise</h1>
      <form action={`/admin/exercises/${exercise.id}/update`} method="POST" className="space-y-4">
        <input type="hidden" name="id" value={exercise.id} />
        <label className="block">
          <span className="block text-sm mb-1">Lesson</span>
          <select name="lessonId" defaultValue={exercise.lessonId} className="border p-2 w-full">
            {lessons.map((l: any) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm mb-1">Type</span>
          <select name="type" defaultValue={exercise.type} className="border p-2 w-full">
            <option value="mcq">Multiple Choice</option>
            <option value="fill">Fill-in</option>
          </select>
        </label>
        <input name="prompt" defaultValue={exercise.prompt} className="border p-2 w-full" />
        <input name="options" defaultValue={(exercise as any).options || ""} className="border p-2 w-full" />
        <input name="answer" defaultValue={exercise.answer} className="border p-2 w-full" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Update</button>
      </form>

      <ConfirmDeleteForm
        action={`/admin/exercises/${exercise.id}/delete`}
        id={exercise.id}
        label="Delete"
        buttonClassName="px-4 py-2 bg-red-600 text-white rounded"
        formClassName="mt-6"
        confirmMessage={`Delete exercise '${exercise.prompt}'? This cannot be undone.`}
      />
    </div>
  );
}

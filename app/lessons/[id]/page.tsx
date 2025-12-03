import ExerciseRunner from "@/app/components/ExerciseRunner";
import { getLessonById } from "@/app/lib/queries";

type Props = { params: { id: string } };

export default async function LessonPage({ params }: Props) {
  const lesson = await getLessonById(params.id);
  if (!lesson) {
    return (
      <main className="mx-auto max-w-4xl p-8"><p>Lesson not found.</p></main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
      <p className="text-gray-600 mb-6">{lesson.description}</p>
      <article className="prose dark:prose-invert mb-8">
        <p>{lesson.content}</p>
      </article>

      <ExerciseRunner
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          exercises: lesson.exercises.map((e: any) => ({
            id: e.id,
            type: e.type,
            prompt: e.prompt,
            options: e.options,
            answer: e.answer,
          })),
        }}
      />
    </main>
  );
}

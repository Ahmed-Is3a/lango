"use client";
import { useMemo, useState } from "react";

export type Exercise = {
  id: string;
  type: "mcq" | "fill";
  prompt: string;
  options?: any;
  answer: string;
};

export type LessonData = {
  id: string;
  title: string;
  description: string;
  content: string;
  exercises: Exercise[];
};

export default function ExerciseRunner({ lesson }: { lesson: LessonData }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    return lesson.exercises.reduce((acc, ex) => {
      const a = answers[ex.id]?.trim();
      return acc + (a && a.toLowerCase() === ex.answer.toLowerCase() ? 1 : 0);
    }, 0);
  }, [answers, lesson.exercises]);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Exercises</h2>
      <div className="space-y-4">
        {lesson.exercises.map((ex) => (
          <div key={ex.id} className="card">
            <div>
              <p className="font-medium mb-2">{ex.prompt}</p>
              {ex.type === "mcq" && Array.isArray(ex.options) && (
                <div className="space-y-2">
                  {ex.options.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={ex.id}
                        value={opt}
                        checked={answers[ex.id] === opt}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [ex.id]: e.target.value }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {ex.type === "fill" && (
                <input
                  className="input"
                  placeholder="Your answer"
                  value={answers[ex.id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [ex.id]: e.target.value }))
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button className="btn" onClick={() => setSubmitted(true)}>Submit</button>
        {submitted && (
          <span className="text-sm text-gray-700">Score: {score}/{lesson.exercises.length}</span>
        )}
      </div>
    </section>
  );
}

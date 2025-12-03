export type ExerciseType = "mcq" | "fill";

export type Exercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  options?: string[];
  answer: string;
};

export type Lesson = {
  id: string;
  languageId: string;
  title: string;
  description: string;
  content: string;
  exercises: Exercise[];
};

export type Flashcard = {
  id: string;
  languageId: string;
  term: string;
  definition: string;
};

export type Language = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessons: string[]; // lesson IDs
  flashcards: string[]; // flashcard IDs
};

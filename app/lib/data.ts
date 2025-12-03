import { Exercise, Flashcard, Language, Lesson } from "./types";

export const languages: Language[] = [
  {
    id: "es",
    name: "Spanish",
    level: "Beginner",
    lessons: ["es-1", "es-2"],
    flashcards: ["es-f-1", "es-f-2", "es-f-3"],
  },
  {
    id: "fr",
    name: "French",
    level: "Beginner",
    lessons: ["fr-1"],
    flashcards: ["fr-f-1", "fr-f-2"],
  },
];

export const lessons: Lesson[] = [
  {
    id: "es-1",
    languageId: "es",
    title: "Greetings",
    description: "Basic greetings in Spanish",
    content: "Hola, Buenos días, Buenas tardes, Buenas noches",
    exercises: [
      {
        id: "es-1-ex-1",
        type: "mcq",
        prompt: "How do you say 'Good morning' in Spanish?",
        options: ["Buenas noches", "Buenos días", "Hola"],
        answer: "Buenos días",
      },
      {
        id: "es-1-ex-2",
        type: "fill",
        prompt: "Translate: Hello",
        answer: "Hola",
      },
    ],
  },
  {
    id: "es-2",
    languageId: "es",
    title: "Numbers 1-10",
    description: "Learn numbers from 1 to 10",
    content: "Uno, Dos, Tres, Cuatro, Cinco, Seis, Siete, Ocho, Nueve, Diez",
    exercises: [
      {
        id: "es-2-ex-1",
        type: "mcq",
        prompt: "What is 'Five' in Spanish?",
        options: ["Cinco", "Seis", "Cuatro"],
        answer: "Cinco",
      },
    ],
  },
  {
    id: "fr-1",
    languageId: "fr",
    title: "Greetings",
    description: "Basic greetings in French",
    content: "Bonjour, Bonsoir, Salut",
    exercises: [
      {
        id: "fr-1-ex-1",
        type: "fill",
        prompt: "Translate: Hello",
        answer: "Bonjour",
      },
    ],
  },
];

export const flashcards: Flashcard[] = [
  { id: "es-f-1", languageId: "es", term: "Hola", definition: "Hello" },
  { id: "es-f-2", languageId: "es", term: "Gracias", definition: "Thank you" },
  { id: "es-f-3", languageId: "es", term: "Por favor", definition: "Please" },
  { id: "fr-f-1", languageId: "fr", term: "Bonjour", definition: "Hello" },
  { id: "fr-f-2", languageId: "fr", term: "Merci", definition: "Thank you" },
];

export const getLanguageById = (id: string) => languages.find((l) => l.id === id);
export const getLessonById = (id: string) => lessons.find((l) => l.id === id);
export const getLessonsForLanguage = (languageId: string) =>
  lessons.filter((l) => l.languageId === languageId);
export const getFlashcardsForLanguage = (languageId: string) =>
  flashcards.filter((f) => f.languageId === languageId);

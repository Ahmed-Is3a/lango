import { prisma } from "./db";

export async function getAllLanguages() {
  return prisma.language.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getLanguageById(id: string) {
  return prisma.language.findUnique({ where: { id } });
}

export async function getLessonsForLanguage(languageId: string) {
  return prisma.lesson.findMany({
    where: { languageId },
    orderBy: { id: "asc" },
  });
}

export async function getLessonById(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: { exercises: true },
  });
}

export async function getFlashcardsForLanguage(languageId: string) {
  return prisma.flashcard.findMany({
    where: { languageId },
    orderBy: { id: "asc" },
  });
}

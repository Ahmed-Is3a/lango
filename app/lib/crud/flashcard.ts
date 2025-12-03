import { prisma } from "../db";

export async function getAllFlashcards() {
  return prisma.flashcard.findMany({
    include: { language: true },
    orderBy: { term: "asc" },
  });
}

export async function getFlashcardById(id: string) {
  return prisma.flashcard.findUnique({
    where: { id },
    include: { language: true },
  });
}

export async function createFlashcard(data: {
  languageId: string;
  term: string;
  definition: string;
}) {
  return prisma.flashcard.create({ data });
}

export async function updateFlashcard(
  id: string,
  data: {
    term?: string;
    definition?: string;
  }
) {
  return prisma.flashcard.update({
    where: { id },
    data,
  });
}

export async function deleteFlashcard(id: string) {
  return prisma.flashcard.delete({
    where: { id },
  });
}

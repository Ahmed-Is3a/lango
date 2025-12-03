import { prisma } from "../db";

export async function getAllLanguages() {
  return prisma.language.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getLanguageById(id: string) {
  return prisma.language.findUnique({
    where: { id },
    include: {
      lessons: true,
      flashcards: true,
    },
  });
}

export async function createLanguage(data: {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}) {
  return prisma.language.create({ data });
}

export async function updateLanguage(
  id: string,
  data: {
    name?: string;
    level?: "Beginner" | "Intermediate" | "Advanced";
  }
) {
  return prisma.language.update({
    where: { id },
    data,
  });
}

export async function deleteLanguage(id: string) {
  return prisma.language.delete({
    where: { id },
  });
}

import { prisma } from "../db";

export async function getAllLessons() {
  return prisma.lesson.findMany({
    include: { language: true },
    orderBy: { title: "asc" },
  });
}

export async function getLessonById(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      language: true,
      exercises: true,
      vocabularies: true,
    },
  });
}

export async function createLesson(data: {
  languageId: string;
  title: string;
  description: string;
  content: string;
}) {
  return prisma.lesson.create({ data });
}

export async function updateLesson(
  id: string,
  data: {
    title?: string;
    description?: string;
    content?: string;
  }
) {
  return prisma.lesson.update({
    where: { id },
    data,
  });
}

export async function deleteLesson(id: string) {
  return prisma.lesson.delete({
    where: { id },
  });
}

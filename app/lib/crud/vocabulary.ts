import { prisma } from "../db";

export async function getVocabulariesForLesson(lessonId: string) {
  return prisma.vocabulary.findMany({ where: { lessonId }, orderBy: { term: "asc" } });
}

export async function createVocabulary(data: { lessonId: string; term: string; definition: string }) {
  return prisma.vocabulary.create({ data });
}

export async function updateVocabulary(id: string, data: { term?: string; definition?: string }) {
  return prisma.vocabulary.update({ where: { id }, data });
}

export async function deleteVocabulary(id: string) {
  return prisma.vocabulary.delete({ where: { id } });
}

import { prisma } from "../db";

export async function getAllExercises() {
  return prisma.exercise.findMany({
    include: { lesson: true },
    orderBy: { id: "asc" },
  });
}

export async function getExerciseById(id: string) {
  return prisma.exercise.findUnique({
    where: { id },
    include: { lesson: true },
  });
}

export async function createExercise(data: {
  lessonId: string;
  type: "mcq" | "fill";
  prompt: string;
  options: string;
  answer: string;
}) {
  return prisma.exercise.create({ data });
}

export async function updateExercise(
  id: string,
  data: {
    prompt?: string;
    type?: "mcq" | "fill";
    options?: string[] | null;
    answer?: string;
  }
) {
  return prisma.exercise.update({
    where: { id },
    data,
  });
}

export async function deleteExercise(id: string) {
  return prisma.exercise.delete({
    where: { id },
  });
}

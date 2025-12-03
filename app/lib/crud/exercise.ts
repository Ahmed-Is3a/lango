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
    options?: string[] | null; // options is either an array or null
    answer?: string;
  }
) {
  const updateData: any = { ...data };

  // If options is provided, check if it's an array and use the correct Prisma operation
  if (data.options !== undefined) {
    // If options is an array, we use the `set` operation to update the array
    if (Array.isArray(data.options)) {
      updateData.options = { set: data.options };
    } else {
      // If options is null, we need to handle it directly
      updateData.options = { set: null };
    }
  }

  return prisma.exercise.update({
    where: { id },
    data: updateData,
  });
}


export async function deleteExercise(id: string) {
  return prisma.exercise.delete({
    where: { id },
  });
}

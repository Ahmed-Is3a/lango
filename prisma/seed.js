/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Languages
  await prisma.language.upsert({
    where: { id: "es" },
    update: {},
    create: { id: "es", name: "Spanish", level: "Beginner" },
  });
  await prisma.language.upsert({
    where: { id: "fr" },
    update: {},
    create: { id: "fr", name: "French", level: "Beginner" },
  });

  // Lessons + Exercises
  await prisma.lesson.upsert({
    where: { id: "es-1" },
    update: {},
    create: {
      id: "es-1",
      languageId: "es",
      title: "Greetings",
      description: "Basic greetings in Spanish",
      content: "Hola, Buenos días, Buenas tardes, Buenas noches",
      exercises: {
        create: [
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
    },
  });

  await prisma.lesson.upsert({
    where: { id: "es-2" },
    update: {},
    create: {
      id: "es-2",
      languageId: "es",
      title: "Numbers 1-10",
      description: "Learn numbers from 1 to 10",
      content: "Uno, Dos, Tres, Cuatro, Cinco, Seis, Siete, Ocho, Nueve, Diez",
      exercises: {
        create: [
          {
            id: "es-2-ex-1",
            type: "mcq",
            prompt: "What is 'Five' in Spanish?",
            options: ["Cinco", "Seis", "Cuatro"],
            answer: "Cinco",
          },
        ],
      },
    },
  });

  await prisma.lesson.upsert({
    where: { id: "fr-1" },
    update: {},
    create: {
      id: "fr-1",
      languageId: "fr",
      title: "Greetings",
      description: "Basic greetings in French",
      content: "Bonjour, Bonsoir, Salut",
      exercises: {
        create: [
          {
            id: "fr-1-ex-1",
            type: "fill",
            prompt: "Translate: Hello",
            answer: "Bonjour",
          },
        ],
      },
    },
  });

  // Flashcards
  const flashcards = [
    { id: "es-f-1", languageId: "es", term: "Hola", definition: "Hello" },
    { id: "es-f-2", languageId: "es", term: "Gracias", definition: "Thank you" },
    { id: "es-f-3", languageId: "es", term: "Por favor", definition: "Please" },
    { id: "fr-f-1", languageId: "fr", term: "Bonjour", definition: "Hello" },
    { id: "fr-f-2", languageId: "fr", term: "Merci", definition: "Thank you" },
  ];
  for (const c of flashcards) {
    await prisma.flashcard.upsert({ where: { id: c.id }, update: {}, create: c });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

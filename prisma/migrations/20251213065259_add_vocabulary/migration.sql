-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" SERIAL NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exampleGerman" TEXT,
    "exampleEnglish" TEXT,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "QuizLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "level" "QuizLevel" NOT NULL DEFAULT 'A1';

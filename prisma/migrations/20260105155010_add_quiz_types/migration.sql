/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `QuizQuestion` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'FILL_IN_THE_BLANK', 'MATCHING');

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "correctAnswer",
DROP COLUMN "explanation",
DROP COLUMN "options",
DROP COLUMN "question",
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "type" "QuizQuestionType" NOT NULL DEFAULT 'MCQ';

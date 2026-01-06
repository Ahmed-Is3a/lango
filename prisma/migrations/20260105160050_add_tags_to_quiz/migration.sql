-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

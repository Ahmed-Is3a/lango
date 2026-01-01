-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('draft', 'published');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "status" "LessonStatus" NOT NULL DEFAULT 'draft';

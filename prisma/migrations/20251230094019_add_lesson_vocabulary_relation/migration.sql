-- CreateTable
CREATE TABLE "_LessonToVocabulary" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LessonToVocabulary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LessonToVocabulary_B_index" ON "_LessonToVocabulary"("B");

-- AddForeignKey
ALTER TABLE "_LessonToVocabulary" ADD CONSTRAINT "_LessonToVocabulary_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToVocabulary" ADD CONSTRAINT "_LessonToVocabulary_B_fkey" FOREIGN KEY ("B") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

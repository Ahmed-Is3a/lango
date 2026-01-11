"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import { Block, emptyBlock, BlockType, TextBlock } from "./blockTypes";
import LessonRenderer from "../../lessons/LessonRenderer";

interface LessonEditorProps {
  lessonTitle: string;
  setLessonTitle: (title: string) => void;
  lessonSlug: string;
  setLessonSlug: (slug: string) => void;
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
  levelId: number | null;
  setLevelId: (id: number | null) => void;
  levels: Array<{ id: number; slug: string; title: string }>;
  levelTag: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  setLevelTag: (tag: "A1" | "A2" | "B1" | "B2" | "C1" | "C2") => void;
  onSave: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onCancel: () => void;
  saving: boolean;
  editingLessonId: number | null;
  currentStatus?: 'draft' | 'published';
  vocabularies?: Array<{
    id: number;
    term: string;
    definition: string;
    language: string;
  }>;
  selectedVocabIds?: number[];
  onVocabSelectionChange?: (ids: number[]) => void;
  onVocabulariesUpdate?: () => void;
}

export default function LessonEditor({
  lessonTitle,
  setLessonTitle,
  lessonSlug,
  setLessonSlug,
  blocks,
  setBlocks,
  levelId,
  setLevelId,
  levels,
  levelTag,
  setLevelTag,
  onSave,
  onSaveDraft,
  onPublish,
  onCancel,
  saving,
  editingLessonId,
  currentStatus = 'draft',
  vocabularies = [],
  selectedVocabIds = [],
  onVocabSelectionChange,
  onVocabulariesUpdate,
}: LessonEditorProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [focusedElement, setFocusedElement] = useState<
    HTMLTextAreaElement | HTMLInputElement | null
  >(null);
  const [draggedRow, setDraggedRow] = useState<{ blockIdx: number; rowIdx: number } | null>(null);
  const [dragOverRow, setDragOverRow] = useState<{ blockIdx: number; rowIdx: number } | null>(null);
  const [draggedCol, setDraggedCol] = useState<{ blockIdx: number; colIdx: number } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<{ blockIdx: number; colIdx: number } | null>(null);
  const [vocabSearch, setVocabSearch] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showNewVocabModal, setShowNewVocabModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [newVocabForm, setNewVocabForm] = useState({
    term: "",
    definition: "",
    language: "en",
    exampleGerman: "",
    exampleEnglish: "",
    imageUrl: "",
  });
  const [isAddingVocab, setIsAddingVocab] = useState(false);

  // Auto-resize textareas when switching to edit mode
  useEffect(() => {
    if (!previewMode) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach((textarea) => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        });
      }, 0);
    }
  }, [previewMode]);

  const addBlock = (type: BlockType) => {
    if (selectedBlockIndex !== null) {
      // Insert after selected block
      const newBlocks = [...blocks];
      newBlocks.splice(selectedBlockIndex + 1, 0, emptyBlock(type));
      setBlocks(newBlocks);
    } else {
      // Add at end if no block is selected
      setBlocks([...blocks, emptyBlock(type)]);
    }
    setShowBlockModal(false);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, updatedBlock: Block) => {
    setBlocks(blocks.map((block, i) => (i === index ? updatedBlock : block)));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);

    setBlocks(newBlocks);
    handleDragEnd();
  };

  const handleRowDragStart = (
    e: React.DragEvent,
    blockIdx: number,
    rowIdx: number
  ) => {
    setDraggedRow({ blockIdx, rowIdx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleRowDragOver = (
    e: React.DragEvent,
    blockIdx: number,
    rowIdx: number
  ) => {
    e.preventDefault();
    if (draggedRow?.blockIdx !== blockIdx) return;
    e.dataTransfer.dropEffect = "move";
    setDragOverRow({ blockIdx, rowIdx });
  };

  const handleRowDrop = (
    e: React.DragEvent,
    blockIdx: number,
    rowIdx: number
  ) => {
    e.preventDefault();
    if (!draggedRow || draggedRow.blockIdx !== blockIdx) {
      handleRowDragEnd();
      return;
    }

    const targetRowIdx = rowIdx;
    const sourceRowIdx = draggedRow.rowIdx;
    if (targetRowIdx === sourceRowIdx) {
      handleRowDragEnd();
      return;
    }

    const tableBlock = blocks[blockIdx] as any;
    const rows = [...tableBlock.rows];
    const [moved] = rows.splice(sourceRowIdx, 1);
    rows.splice(targetRowIdx, 0, moved);

    updateBlock(blockIdx, {
      ...tableBlock,
      rows,
    });

    handleRowDragEnd();
  };

  const handleRowDragEnd = () => {
    setDraggedRow(null);
    setDragOverRow(null);
  };

  const handleColDragStart = (
    e: React.DragEvent,
    blockIdx: number,
    colIdx: number
  ) => {
    setDraggedCol({ blockIdx, colIdx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColDragOver = (
    e: React.DragEvent,
    blockIdx: number,
    colIdx: number
  ) => {
    e.preventDefault();
    if (draggedCol?.blockIdx !== blockIdx) return;
    e.dataTransfer.dropEffect = "move";
    setDragOverCol({ blockIdx, colIdx });
  };

  const handleColDrop = (
    e: React.DragEvent,
    blockIdx: number,
    colIdx: number
  ) => {
    e.preventDefault();
    if (!draggedCol || draggedCol.blockIdx !== blockIdx) {
      handleColDragEnd();
      return;
    }

    const source = draggedCol.colIdx;
    const target = colIdx;
    if (source === target) {
      handleColDragEnd();
      return;
    }

    const tableBlock = blocks[blockIdx] as any;
    const headers = [...tableBlock.headers];
    const rows = tableBlock.rows.map((r: string[]) => [...r]);

    const [movedHeader] = headers.splice(source, 1);
    headers.splice(target, 0, movedHeader);

    const reorderedRows = rows.map((r: string[]) => {
      const rowCopy = [...r];
      const [movedCell] = rowCopy.splice(source, 1);
      rowCopy.splice(target, 0, movedCell);
      return rowCopy;
    });

    updateBlock(blockIdx, {
      ...tableBlock,
      headers,
      rows: reorderedRows,
    });

    handleColDragEnd();
  };

  const handleColDragEnd = () => {
    setDraggedCol(null);
    setDragOverCol(null);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[newIndex];
    newBlocks[newIndex] = temp;

    setBlocks(newBlocks);
  };

  const insertCharacter = (char: string) => {
    if (!focusedElement) return;

    const start = focusedElement.selectionStart || 0;
    const end = focusedElement.selectionEnd || 0;
    const text = focusedElement.value;
    const newText = text.substring(0, start) + char + text.substring(end);

    // Update the focused element's value
    focusedElement.value = newText;

    // Update the corresponding block if it's in the blocks array
    if (focusedElement instanceof HTMLTextAreaElement) {
      const blockIndex = blocks.findIndex((block) => {
        // This is a heuristic - we'll need to match by the textarea's content
        return (
          (block.type === "paragraph" ||
            block.type === "header" ||
            block.type === "subheader" ||
            block.type === "title") &&
          (block as TextBlock).text === text
        );
      });

      if (blockIndex !== -1) {
        updateBlock(blockIndex, {
          ...blocks[blockIndex],
          text: newText,
        } as Block);
      }
    }

    // Move cursor after the inserted character
    const newPosition = start + char.length;
    focusedElement.selectionStart = focusedElement.selectionEnd = newPosition;
    focusedElement.focus();
  };

  const importExampleJson = (index: number) => {
    const input = window.prompt(
      "Paste example JSON (object or array with german, english, pronunciationAudio?)"
    );

    if (!input) return;

    try {
      const parsed = JSON.parse(input);
      const normalize = (value: any) => {
        if (!value || typeof value !== "object") return null;

        const german =
          typeof value.german === "string"
            ? value.german.trim()
            : typeof value.de === "string"
            ? value.de.trim()
            : null;
        const english =
          typeof value.english === "string"
            ? value.english.trim()
            : typeof value.en === "string"
            ? value.en.trim()
            : null;
        const pronunciationAudio =
          typeof value.pronunciationAudio === "string"
            ? value.pronunciationAudio.trim()
            : typeof value.audio === "string"
            ? value.audio.trim()
            : undefined;

        if (!german || !english) return null;

        return {
          type: "example" as const,
          german,
          english,
          pronunciationAudio,
        };
      };

      const normalized = Array.isArray(parsed)
        ? parsed.map(normalize).filter((v): v is ReturnType<typeof normalize> => v !== null)
        : [normalize(parsed)].filter((v): v is ReturnType<typeof normalize> => v !== null);

      if (!normalized.length) {
        alert("No valid examples found. Expected german and english fields.");
        return;
      }

      const nextBlocks = [...blocks];
      nextBlocks[index] = normalized[0] as Block;

      if (normalized.length > 1) {
        nextBlocks.splice(index + 1, 0, ...(normalized.slice(1) as Block[]));
      }

      setBlocks(nextBlocks);
      setSelectedBlockIndex(index);
    } catch (error) {
      alert("Invalid JSON: " + (error as Error).message);
    }
  };

  const importFillJson = (index: number) => {
    const input = window.prompt(
      "Paste fill-in-the-blank JSON (object or array with text, answers, wordOptions?, hints?)"
    );

    if (!input) return;

    try {
      const parsed = JSON.parse(input);

      const normalize = (value: any): { type: "fillInTheBlank"; text: string; answers: string[]; wordOptions: string[]; hints: string[] } | null => {
        if (!value || typeof value !== "object") return null;

        const text = typeof value.text === "string" ? value.text.trim() : "";
        if (!text) return null;

        const blanksCount = (text.match(/___/g) || []).length;

        const rawAnswers = Array.isArray(value.answers)
          ? value.answers.map((a: any) => String(a ?? ""))
          : [];

        let answers = [...rawAnswers];
        if (blanksCount > 0) {
          answers = answers.slice(0, blanksCount);
          while (answers.length < blanksCount) answers.push("");
        } else if (answers.length === 0) {
          answers = [""];
        }

        const wordOptions = Array.isArray(value.wordOptions)
          ? value.wordOptions.map((w: any) => String(w ?? ""))
          : [];

        const hints = Array.isArray(value.hints)
          ? value.hints.map((h: any) => String(h ?? ""))
          : [];

        return {
          type: "fillInTheBlank" as const,
          text,
          answers,
          wordOptions,
          hints,
        };
      };

      const normalized = Array.isArray(parsed)
        ? parsed.map(normalize).filter((v): v is { type: "fillInTheBlank"; text: string; answers: string[]; wordOptions: string[]; hints: string[] } => v !== null)
        : [normalize(parsed)].filter((v): v is { type: "fillInTheBlank"; text: string; answers: string[]; wordOptions: string[]; hints: string[] } => v !== null);

      if (!normalized.length) {
        alert("No valid fill-in-the-blank items found. Provide text and answers.");
        return;
      }

      const nextBlocks = [...blocks];
      nextBlocks[index] = normalized[0];
      if (normalized.length > 1) {
        nextBlocks.splice(index + 1, 0, ...normalized.slice(1));
      }

      setBlocks(nextBlocks);
      setSelectedBlockIndex(index);
    } catch (error) {
      alert("Invalid JSON: " + (error as Error).message);
    }
  };

  const handleAddNewVocab = async () => {
    if (!newVocabForm.term.trim() || !newVocabForm.definition.trim()) {
      alert("Please fill in both term and definition");
      return;
    }

    setIsAddingVocab(true);
    try {
      const res = await fetch("/api/vocabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVocabForm),
      });

      if (!res.ok) {
        throw new Error("Failed to add vocabulary");
      }

      const newVocab = await res.json();

      // Select the newly added vocabulary
      const newIds = [...selectedVocabIds, newVocab.id];
      onVocabSelectionChange?.(newIds);

      // Refresh the vocabularies list
      onVocabulariesUpdate?.();

      // Reset form and close modal
      setNewVocabForm({
        term: "",
        definition: "",
        language: "en",
        exampleGerman: "",
        exampleEnglish: "",
        imageUrl: "",
      });
      setShowNewVocabModal(false);
    } catch (error) {
      alert("Error adding vocabulary: " + (error as Error).message);
    } finally {
      setIsAddingVocab(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-2 shrink-0 z-20">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <div className="size-6 flex items-center justify-center bg-primary rounded-lg text-white">
            <svg
              height="74px"
              width="74px"
              version="1.1"
              id="Icons"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="#000000"
              data--h-bstatus="0OBSERVED"
            >
              <g
                id="SVGRepo_bgCarrier"
                strokeWidth="0"
                data--h-bstatus="0OBSERVED"
              ></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
                data--h-bstatus="0OBSERVED"
              ></g>
              <g id="SVGRepo_iconCarrier" data--h-bstatus="0OBSERVED">
                {" "}
                <style type="text/css" data--h-bstatus="0OBSERVED">
                  {" "}
                </style>{" "}
                <g data--h-bstatus="0OBSERVED">
                  {" "}
                  <path
                    d="M31,26c-0.6,0-1-0.4-1-1V12c0-0.6,0.4-1,1-1s1,0.4,1,1v13C32,25.6,31.6,26,31,26z"
                    data--h-bstatus="0OBSERVED"
                  ></path>{" "}
                </g>{" "}
                <g data--h-bstatus="0OBSERVED">
                  {" "}
                  <path
                    d="M16,21c-0.2,0-0.3,0-0.5-0.1l-15-8C0.2,12.7,0,12.4,0,12s0.2-0.7,0.5-0.9l15-8c0.3-0.2,0.6-0.2,0.9,0l15,8 c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-15,8C16.3,21,16.2,21,16,21z"
                    data--h-bstatus="0OBSERVED"
                  ></path>{" "}
                </g>{" "}
                <path
                  d="M17.4,22.6C17,22.9,16.5,23,16,23s-1-0.1-1.4-0.4L6,18.1V22c0,3.1,4.9,6,10,6s10-2.9,10-6v-3.9L17.4,22.6z"
                  data--h-bstatus="0OBSERVED"
                ></path>{" "}
              </g>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Lango CMS
          </h2>
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-primary dark:text-slate-400 font-medium"
            >
              Courses
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {editingLessonId ? "Edit Lesson" : "New Lesson"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {blocks.length === 0 && (
            <div className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
              Draft - Empty lesson
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex items-center justify-center hover:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 3 4 11l8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Toolbox) */}
        <aside className="w-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 hidden lg:flex">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Add Content
            </h3>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => addBlock("header")}
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M5 7h3v10H5zm6-2h3v12h-3zm6 4h3v8h-3z"/></svg>
                <span className="text-xs font-medium">Heading</span>
              </button>
              <button
                onClick={() => addBlock("paragraph")}
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z"/></svg>
                <span className="text-xs font-medium">Text</span>
              </button>
              <button onClick={() => addBlock("list")} className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50">
  <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
  <span className="text-xs font-medium">List</span>
</button>
              <button
                onClick={() => addBlock("image")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                <span className="text-xs font-medium">Image</span>
              </button>
              <button
                onClick={() => addBlock("audio")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                <span className="text-xs font-medium">Audio</span>
              </button>
              <button
                onClick={() => addBlock("vocabulary")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm9 16H6V4h1v3h8V4h2v16z"/></svg>
                <span className="text-[10px] font-medium">Vocabulary</span>
              </button>
              <button
                onClick={() => addBlock("example")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="text-[10px] font-medium">Example</span>
              </button>
              <button
                onClick={() => addBlock("multipleChoice")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2z"/></svg>
                <span className="text-[10px] font-medium">MC Quiz</span>
              </button>
              <button
                onClick={() => addBlock("fillInTheBlank")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                <span className="text-[10px] font-medium">Fill Blank</span>
              </button>
              <button
                onClick={() => addBlock("matchingPairs")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-all group bg-slate-50 dark:bg-slate-800/50"
              >
                <svg className="w-5 h-5 mb-1 text-slate-500 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                <span className="text-[10px] font-medium">Matching</span>
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Interactions
            </h3>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                German Chars
              </h4>
              <div className="flex flex-wrap gap-1">
                {["Ä", "ä", "Ö", "ö", "Ü", "ü", "ß"].map((char) => (
                  <button
                    key={char}
                    onClick={() => insertCharacter(char)}
                    className="size-8 rounded bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-move shadow-sm hover:shadow-md transition-shadow group">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-11H7v2h7V8z"/></svg>
                <span className="text-sm font-medium">Multiple Choice</span>
                <svg className="w-5 h-5 ml-auto text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C7.9 4 7 4.9 7 6s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-move shadow-sm hover:shadow-md transition-shadow group">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                <span className="text-sm font-medium">Fill in Blanks</span>
                <svg className="w-5 h-5 ml-auto text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C7.9 4 7 4.9 7 6s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-move shadow-sm hover:shadow-md transition-shadow group">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                <span className="text-sm font-medium">Matching Pairs</span>
                <svg className="w-5 h-5 ml-auto text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C7.9 4 7 4.9 7 6s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </div>
            </div>

            
          </div>
        </aside>

        {/* Center Canvas (Editor) */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black/20">
          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <label className="flex flex-col flex-1 max-w-lg">
                <span className="sr-only">Lesson Title</span>
                <input
                  className="w-full text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-white placeholder-slate-300"
                  placeholder="Enter lesson title..."
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                />
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(true)}
                className="px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-primary text-primary bg-primary/10 hover:bg-primary/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 11h-4v4h-4v-4H2v-4h4V3h4v4h4v4z"/></svg>
                Add Block
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  previewMode
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                    : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              {(onSaveDraft || onPublish) ? (
                <>
                  <button
                    onClick={onSaveDraft || onSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" /></svg>
                    {saving ? 'Saving...' : currentStatus === 'published' ? 'Save Changes' : 'Save as Draft'}
                  </button>
                  <button
                    onClick={onPublish || onSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z"/></svg>
                    {saving ? 'Publishing...' : currentStatus === 'published' ? 'Update & Publish' : 'Publish'}
                  </button>
                </>
              ) : (
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="px-2 py-1 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d={saving ? "M12 4V1m0 22v-3m8-8h3M3 12h3m18 0c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z" : editingLessonId ? "M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" : "M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0zM10 16.5l6-4-6-4v8z"} /></svg>
                  {saving ? "Saving..." : editingLessonId ? "Update" : "Publish"}
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-8">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20">
              {previewMode ? (
                /* Preview Mode */
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                  <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
                    {lessonTitle || "Untitled Lesson"}
                  </h1>
                  {blocks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <p>
                        No content to preview yet. Switch to edit mode to add
                        blocks.
                      </p>
                    </div>
                  ) : (
                    <LessonRenderer blocks={blocks} />
                  )}
                </div>
              ) : (
                /* Edit Mode */
                <>
                  {blocks.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Start Creating Your Lesson
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Add content blocks from the left sidebar to build your
                        lesson
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.1 0-2.22 1.21-5.26 6-9.6 4.79 4.34 6 7.38 6 9.6 0 3.53-2.65 6.1-6 6.1z"/></svg>
                        <span>Drag blocks to reorder them as needed</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blocks.map((block, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, index)}
                          onClick={() => setSelectedBlockIndex(index)}
                          className={`group relative rounded-xl border bg-white dark:bg-slate-900 transition-all p-2 cursor-move ${
                            selectedBlockIndex === index
                              ? "border-gray-200 border-2 bg-primary/5 dark:bg-primary/10"
                              : draggedIndex === index
                              ? "opacity-50 border-slate-300 dark:border-slate-700"
                              : dragOverIndex === index &&
                                draggedIndex !== index
                              ? "border-primary border-dashed border-2"
                              : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
                          }`}
                        >
                          {/* drag button */}
                          <div className="absolute -left-6 top-0 bottom-0 w-6 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C7.9 4 7 4.9 7 6s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                          </div>

                          {/* Controls */}
                          <div className="absolute top-[-7px] right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(index, -1);
                              }}
                              disabled={index === 0}
                              className="rounded text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move up"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(index, 1);
                              }}
                              disabled={index === blocks.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move down"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                            </button>
                            <button
                              onClick={() => removeBlock(index)}
                              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/></svg>
                            </button>
                          </div>
                          {/* block header */}
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mx-2 font-medium">
                            {block.type.charAt(0).toUpperCase() +
                              block.type.slice(1)}{" "}
                          </div>

                          {(block.type === "paragraph" ||
                            block.type === "header" ||
                            block.type === "title" ||
                            block.type === "subheader") && (
                            <div>
                              <div>
                                {/* rich-text toolbar */}
                                {block.type === "paragraph" && (
                                  <div className="mx-4 flex gap-2">
                                    <button
                                      onClick={() => {
                                        const textarea = document.querySelector(
                                          `textarea[placeholder="Enter ${block.type} ..."]`
                                        ) as HTMLTextAreaElement;
                                        if (textarea && textarea.value) {
                                          const start = textarea.selectionStart;
                                          const end = textarea.selectionEnd;
                                          const selectedText =
                                            textarea.value.substring(
                                              start,
                                              end
                                            );

                                          if (selectedText) {
                                            const newText =
                                              textarea.value.substring(
                                                0,
                                                start
                                              ) +
                                              `**${selectedText}**` +
                                              textarea.value.substring(end);
                                            updateBlock(index, {
                                              ...block,
                                              text: newText,
                                            });
                                          }
                                        }
                                      }}
                                      className="text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                                      title="Make selected text bold"
                                    >
                                      B
                                    </button>
                                    <button
                                      onClick={() => {
                                        const textarea = document.querySelector(
                                          `textarea[placeholder="Enter ${block.type} content..."]`
                                        ) as HTMLTextAreaElement;
                                        if (textarea && textarea.value) {
                                          const start = textarea.selectionStart;
                                          const end = textarea.selectionEnd;
                                          const selectedText =
                                            textarea.value.substring(
                                              start,
                                              end
                                            );

                                          if (selectedText) {
                                            const newText =
                                              textarea.value.substring(
                                                0,
                                                start
                                              ) +
                                              `__${selectedText}__` +
                                              textarea.value.substring(end);
                                            updateBlock(index, {
                                              ...block,
                                              text: newText,
                                            });
                                          }
                                        }
                                      }}
                                      className="text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 underline"
                                      title="Make selected text underline"
                                    >
                                      U
                                    </button>
                                    <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setShowColorPicker(
                                            showColorPicker === index
                                              ? null
                                              : index
                                          )
                                        }
                                        className="text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                        title="Text color"
                                      >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                                      </button>
                                      {showColorPicker === index && (
                                        <div className="absolute top-full left-0 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg z-50 flex gap-1">
                                          <button
                                            onClick={() => {
                                              const textarea =
                                                document.querySelector(
                                                  `textarea[placeholder="Enter ${block.type} content..."]`
                                                ) as HTMLTextAreaElement;
                                              if (textarea && textarea.value) {
                                                const start =
                                                  textarea.selectionStart;
                                                const end =
                                                  textarea.selectionEnd;
                                                const selectedText =
                                                  textarea.value.substring(
                                                    start,
                                                    end
                                                  );
                                                if (selectedText) {
                                                  const newText =
                                                    textarea.value.substring(
                                                      0,
                                                      start
                                                    ) +
                                                    `{red}${selectedText}{/red}` +
                                                    textarea.value.substring(
                                                      end
                                                    );
                                                  updateBlock(index, {
                                                    ...block,
                                                    text: newText,
                                                  });
                                                  setShowColorPicker(null);
                                                }
                                              }
                                            }}
                                            className="w-4 h-4 rounded-[2px] bg-red-500 hover:ring-2 ring-red-300 transition-all"
                                            title="Red"
                                          />
                                          <button
                                            onClick={() => {
                                              const textarea =
                                                document.querySelector(
                                                  `textarea[placeholder="Enter ${block.type} content..."]`
                                                ) as HTMLTextAreaElement;
                                              if (textarea && textarea.value) {
                                                const start =
                                                  textarea.selectionStart;
                                                const end =
                                                  textarea.selectionEnd;
                                                const selectedText =
                                                  textarea.value.substring(
                                                    start,
                                                    end
                                                  );
                                                if (selectedText) {
                                                  const newText =
                                                    textarea.value.substring(
                                                      0,
                                                      start
                                                    ) +
                                                    `{blue}${selectedText}{/blue}` +
                                                    textarea.value.substring(
                                                      end
                                                    );
                                                  updateBlock(index, {
                                                    ...block,
                                                    text: newText,
                                                  });
                                                  setShowColorPicker(null);
                                                }
                                              }
                                            }}
                                            className="w-4 h-4 rounded-[2px] bg-blue-500 hover:ring-2 ring-blue-300 transition-all"
                                            title="Blue"
                                          />
                                          <button
                                            onClick={() => {
                                              const textarea =
                                                document.querySelector(
                                                  `textarea[placeholder="Enter ${block.type} content..."]`
                                                ) as HTMLTextAreaElement;
                                              if (textarea && textarea.value) {
                                                const start =
                                                  textarea.selectionStart;
                                                const end =
                                                  textarea.selectionEnd;
                                                const selectedText =
                                                  textarea.value.substring(
                                                    start,
                                                    end
                                                  );
                                                if (selectedText) {
                                                  const newText =
                                                    textarea.value.substring(
                                                      0,
                                                      start
                                                    ) +
                                                    `{green}${selectedText}{/green}` +
                                                    textarea.value.substring(
                                                      end
                                                    );
                                                  updateBlock(index, {
                                                    ...block,
                                                    text: newText,
                                                  });
                                                  setShowColorPicker(null);
                                                }
                                              }
                                            }}
                                            className="w-4 h-4 rounded-[2px] bg-green-500 hover:ring-2 ring-green-300 transition-all"
                                            title="Green"
                                          />
                                          <button
                                            onClick={() => {
                                              const textarea =
                                                document.querySelector(
                                                  `textarea[placeholder="Enter ${block.type} content..."]`
                                                ) as HTMLTextAreaElement;
                                              if (textarea && textarea.value) {
                                                const start =
                                                  textarea.selectionStart;
                                                const end =
                                                  textarea.selectionEnd;
                                                const selectedText =
                                                  textarea.value.substring(
                                                    start,
                                                    end
                                                  );
                                                if (selectedText) {
                                                  const newText =
                                                    textarea.value.substring(
                                                      0,
                                                      start
                                                    ) +
                                                    `{yellow}${selectedText}{/yellow}` +
                                                    textarea.value.substring(
                                                      end
                                                    );
                                                  updateBlock(index, {
                                                    ...block,
                                                    text: newText,
                                                  });
                                                  setShowColorPicker(null);
                                                }
                                              }
                                            }}
                                            className="w-4 h-4 rounded-[2px] bg-yellow-500 hover:ring-2 ring-yellow-300 transition-all"
                                            title="Yellow"
                                          />
                                          <button
                                            onClick={() => {
                                              const textarea =
                                                document.querySelector(
                                                  `textarea[placeholder="Enter ${block.type} content..."]`
                                                ) as HTMLTextAreaElement;
                                              if (textarea && textarea.value) {
                                                const start =
                                                  textarea.selectionStart;
                                                const end =
                                                  textarea.selectionEnd;
                                                const selectedText =
                                                  textarea.value.substring(
                                                    start,
                                                    end
                                                  );
                                                if (selectedText) {
                                                  const newText =
                                                    textarea.value.substring(
                                                      0,
                                                      start
                                                    ) +
                                                    `{orange}${selectedText}{/orange}` +
                                                    textarea.value.substring(
                                                      end
                                                    );
                                                  updateBlock(index, {
                                                    ...block,
                                                    text: newText,
                                                  });
                                                  setShowColorPicker(null);
                                                }
                                              }
                                            }}
                                            className="w-4 h-4 rounded-[2px] bg-orange-500 hover:ring-2 ring-orange-300 transition-all"
                                            title="Orange"
                                          />
                                          <button
                                            onClick={() => {
                                              const textarea =
                                                document.querySelector(
                                                  `textarea[placeholder="Enter ${block.type} content..."]`
                                                ) as HTMLTextAreaElement;
                                              if (textarea && textarea.value) {
                                                const start =
                                                  textarea.selectionStart;
                                                const end =
                                                  textarea.selectionEnd;
                                                const selectedText =
                                                  textarea.value.substring(
                                                    start,
                                                    end
                                                  );
                                                if (selectedText) {
                                                  const newText =
                                                    textarea.value.substring(
                                                      0,
                                                      start
                                                    ) +
                                                    `{purple}${selectedText}{/purple}` +
                                                    textarea.value.substring(
                                                      end
                                                    );
                                                  updateBlock(index, {
                                                    ...block,
                                                    text: newText,
                                                  });
                                                  setShowColorPicker(null);
                                                }
                                              }
                                            }}
                                            className="w-4 h-4 rounded-[2px] bg-purple-500 hover:ring-2 ring-purple-300 transition-all"
                                            title="Purple"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                                    <button
                                      onClick={() => {
                                        const textarea = textareaRefs.current[index];
                                        const text = block.text || "";
                                        if (!textarea || !text) return;

                                        const splitPoint = textarea.selectionStart ?? text.length;
                                        if (splitPoint <= 0 || splitPoint >= text.length) return;

                                        const before = text.slice(0, splitPoint);
                                        const after = text.slice(splitPoint);

                                        const newBlocks = [...blocks];
                                        newBlocks[index] = { ...block, text: before } as Block;
                                        newBlocks.splice(index + 1, 0, { ...block, text: after } as Block);
                                        setBlocks(newBlocks);
                                        setSelectedBlockIndex(index + 1);

                                        setTimeout(() => {
                                          textareaRefs.current[index + 1]?.focus();
                                        }, 0);
                                      }}
                                      className="text-sm rounded hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center"
                                      title="Split into two paragraphs"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3h6v6H5V3zm0 12h6v6H5v-6zm8-6h6v6h-6V9z"/></svg>
                                      <span>Split</span>
                                    </button>
                                    <div className="w-px h-4 my-auto bg-slate-300 dark:bg-slate-600"></div>
                                    <button
                                      onClick={() => {
                                        const textarea = document.querySelector(
                                          `textarea[placeholder="Enter ${block.type} content..."]`
                                        ) as HTMLTextAreaElement;
                                        if (textarea) {
                                          const start =
                                            textarea.selectionStart ||
                                            textarea.value.length;
                                          const end =
                                            textarea.selectionEnd ||
                                            textarea.value.length;
                                          const text = textarea.value;
                                          const listMarker = "    •  ";
                                          const newText =
                                            text.substring(0, start) +
                                            listMarker +
                                            text.substring(end);
                                          updateBlock(index, {
                                            ...block,
                                            text: newText,
                                          });

                                          // Set cursor after the list marker
                                          setTimeout(() => {
                                            textarea.focus();
                                            textarea.selectionStart =
                                              start + listMarker.length;
                                            textarea.selectionEnd =
                                              start + listMarker.length;
                                          }, 0);
                                        }
                                      }}
                                      className="text-sm rounded hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                      title="Add list item"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 7h18v2H3zm0 7h18v2H3z"/></svg>
                                    </button>
                                    <div className="w-px h-4 my-auto bg-slate-300 dark:bg-slate-600"></div>
                                    <button
                                      onClick={() => {
                                        const textarea = document.querySelector(
                                          `textarea[placeholder="Enter ${block.type} content..."]`
                                        ) as HTMLTextAreaElement;
                                        if (textarea) {
                                          const start =
                                            textarea.selectionStart || 0;
                                          const text = textarea.value;
                                          const lineStart =
                                            text.lastIndexOf("\n", start - 1) +
                                            1;
                                          const lineText = text.substring(
                                            lineStart,
                                            start
                                          );
                                          const indent = "  ";
                                          const newText =
                                            text.substring(0, lineStart) +
                                            indent +
                                            text.substring(lineStart);
                                          updateBlock(index, {
                                            ...block,
                                            text: newText,
                                          });

                                          // Move cursor forward by indent length
                                          setTimeout(() => {
                                            textarea.focus();
                                            textarea.selectionStart =
                                              start + indent.length;
                                            textarea.selectionEnd =
                                              start + indent.length;
                                          }, 0);
                                        }
                                      }}
                                      className="text-sm rounded hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                      title="Indent"
                                    >
                                      <svg
                                        fill="#000000"
                                        width="15px"
                                        height="15px"
                                        viewBox="0 -2.5 29 29"
                                        xmlns="http://www.w3.org/2000/svg"
                                        data--h-bstatus="0OBSERVED"
                                      >
                                        <g
                                          id="SVGRepo_bgCarrier"
                                          stroke-width="0"
                                          data--h-bstatus="0OBSERVED"
                                        ></g>
                                        <g
                                          id="SVGRepo_tracerCarrier"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          data--h-bstatus="0OBSERVED"
                                        ></g>
                                        <g
                                          id="SVGRepo_iconCarrier"
                                          data--h-bstatus="0OBSERVED"
                                        >
                                          <path
                                            d="m27.999 21.333h-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 26.665c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"
                                            data--h-bstatus="0OBSERVED"
                                          ></path>
                                          <path
                                            d="m27.999 16h-13.332c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 13.333c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002z"
                                            data--h-bstatus="0OBSERVED"
                                          ></path>
                                          <path
                                            d="m27.999 10.667h-13.332c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 13.333c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002z"
                                            data--h-bstatus="0OBSERVED"
                                          ></path>
                                          <path
                                            d="m1.334 2.666h26.665c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002z"
                                            data--h-bstatus="0OBSERVED"
                                          ></path>
                                          <path
                                            d="m27.999 5.333h-13.332c-.011 0-.024-.001-.037-.001-.737 0-1.334.597-1.334 1.334s.597 1.334 1.334 1.334c.013 0 .026 0 .039-.001h-.002 13.333c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002z"
                                            data--h-bstatus="0OBSERVED"
                                          ></path>
                                          <path
                                            d="m.823 18.565c.151.064.326.102.51.102.368 0 .701-.149.943-.391l5.333-5.333c.241-.241.39-.574.39-.942s-.149-.701-.39-.942l-5.333-5.335c-.241-.241-.574-.39-.942-.39-.736 0-1.333.596-1.334 1.332v10.667.001c0 .552.336 1.026.814 1.228z"
                                            data--h-bstatus="0OBSERVED"
                                          ></path>
                                        </g>
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const textarea = document.querySelector(
                                          `textarea[placeholder="Enter ${block.type} content..."]`
                                        ) as HTMLTextAreaElement;
                                        if (textarea) {
                                          const start =
                                            textarea.selectionStart || 0;
                                          const text = textarea.value;
                                          const lineStart =
                                            text.lastIndexOf("\n", start - 1) +
                                            1;
                                          const lineText = text.substring(
                                            lineStart,
                                            start
                                          );
                                          const indent = "  ";

                                          if (
                                            text.substring(
                                              lineStart,
                                              lineStart + indent.length
                                            ) === indent
                                          ) {
                                            const newText =
                                              text.substring(0, lineStart) +
                                              text.substring(
                                                lineStart + indent.length
                                              );
                                            updateBlock(index, {
                                              ...block,
                                              text: newText,
                                            });

                                            // Move cursor back by indent length
                                            setTimeout(() => {
                                              textarea.focus();
                                              textarea.selectionStart =
                                                Math.max(
                                                  lineStart,
                                                  start - indent.length
                                                );
                                              textarea.selectionEnd = Math.max(
                                                lineStart,
                                                start - indent.length
                                              );
                                            }, 0);
                                          }
                                        }
                                      }}
                                      className="text-sm rounded hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                      title="Outdent"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3zm6 9h12v2H9v-2zm0 5h12v2H9v-2z"/></svg>
                                    </button>
                                  </div>
                                )}
                                <textarea
                                  ref={(el) => {
                                    textareaRefs.current[index] = el;
                                  }}
                                  value={block.text || ""}
                                  onChange={(e) => {
                                    updateBlock(index, {
                                      ...block,
                                      text: e.target.value,
                                    });
                                    // Auto-resize textarea
                                    e.target.style.height = "auto";
                                    e.target.style.height =
                                      e.target.scrollHeight + "px";
                                  }}
                                  onFocus={(e) => {
                                    setFocusedElement(e.target);
                                    e.target.style.height = "auto";
                                    e.target.style.height =
                                      e.target.scrollHeight + "px";
                                  }}
                                  placeholder={`Enter ${block.type} content...`}
                                  className="w-full text-[18px] p-2 dark:bg-slate-800 text-slate-900 dark:text-white overflow-hidden focus:outline-none"
                                  rows={block.type === "paragraph" ? 4 : 1}
                                />
                              </div>

                            </div>
                          )}
                          {block.type === "table" && (
                            <div className="space-y-3">
                              <div>
                                <input
                                  type="text"
                                  value={(block as any).title || ""}
                                  onChange={(e) =>
                                    updateBlock(index, {
                                      ...block,
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Enter table title..."
                                  className="mt-1 w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Table data
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      const pasted = window.prompt(
                                        "Paste CSV or TSV table data (first line can be headers)"
                                      );
                                      if (!pasted) return;

                                      const lines = pasted
                                        .trim()
                                        .split(/\r?\n/)
                                        .map((l) => l.trim())
                                        .filter(Boolean);
                                      if (lines.length === 0) return;

                                      const parsedRows = lines.map((line) => {
                                        const hasTabs = line.includes("\t");
                                        const parts = hasTabs
                                          ? line.split("\t")
                                          : line.split(",");
                                        return parts.map((p) => p.trim());
                                      });

                                      const colCount = Math.max(
                                        ...(parsedRows.map((r) => r.length))
                                      );

                                      const currentHeaders = [...(block as any).headers];
                                      const headers = Array.from({ length: colCount }).map(
                                        (_, idx) => currentHeaders[idx] || `Col ${idx + 1}`
                                      );

                                      const rows = parsedRows.map((r) => {
                                        const row = [...r];
                                        while (row.length < colCount) row.push("");
                                        if (row.length > colCount) row.length = colCount;
                                        return row;
                                      });

                                      updateBlock(index, {
                                        ...block,
                                        headers,
                                        rows,
                                      });
                                    }}
                                    className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    Paste CSV/TSV
                                  </button>
                                  <button
                                    onClick={() => {
                                      const headers = [...(block as any).headers];
                                      const rows = [...(block as any).rows];
                                      headers.push(`Col ${headers.length + 1}`);
                                      const updatedRows = rows.map((r: string[]) => [...r, ""]);
                                      updateBlock(index, {
                                        ...block,
                                        headers,
                                        rows: updatedRows,
                                      });
                                    }}
                                    className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    + Add column
                                  </button>
                                  <button
                                    onClick={() => {
                                      const headers = [...(block as any).headers];
                                      if (headers.length <= 1) return;
                                      headers.pop();
                                      const rows = (block as any).rows.map((r: string[]) => r.slice(0, headers.length));
                                      updateBlock(index, {
                                        ...block,
                                        headers,
                                        rows,
                                      });
                                    }}
                                    className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    Remove last column
                                  </button>
                                  <button
                                    onClick={() => {
                                      const headers = (block as any).headers || [];
                                      const newRow = headers.map(() => "");
                                      updateBlock(index, {
                                        ...block,
                                        rows: [...(block as any).rows, newRow],
                                      });
                                    }}
                                    className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    + Add row
                                  </button>
                                  <button
                                    onClick={() => {
                                      const rows = (block as any).rows || [];
                                      if (rows.length === 0) return;
                                      
                                      // Convert first row to headers
                                      const newHeaders = [...rows[0]];
                                      const newRows = rows.slice(1);
                                      
                                      updateBlock(index, {
                                        ...block,
                                        headers: newHeaders,
                                        rows: newRows,
                                      });
                                    }}
                                    className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    First Row to Headers
                                  </button>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="min-w-full border border-slate-200 dark:border-slate-700 text-sm">
                                  <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                      {(block as any).headers.map((h: string, hIdx: number) => {
                                        const isColDragOver =
                                          dragOverCol?.blockIdx === index &&
                                          dragOverCol?.colIdx === hIdx;

                                        return (
                                          <th
                                            key={hIdx}
                                            onDragOver={(e) => handleColDragOver(e, index, hIdx)}
                                            onDrop={(e) => handleColDrop(e, index, hIdx)}
                                            className={`border-b border-slate-200 dark:border-slate-700 p-2 align-middle ${
                                              isColDragOver ? "outline outline-2 outline-primary/60" : ""
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span
                                                draggable
                                                onDragStart={(e) => handleColDragStart(e, index, hIdx)}
                                                onDragEnd={handleColDragEnd}
                                                className="cursor-grab text-slate-400"
                                                title="Drag to reorder column"
                                              >
                                                ☰
                                              </span>
                                              <input
                                                type="text"
                                                value={h}
                                                onChange={(e) => {
                                                  const headers = [...(block as any).headers];
                                                  headers[hIdx] = e.target.value;
                                                  updateBlock(index, {
                                                    ...block,
                                                    headers,
                                                  });
                                                }}
                                                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
                                              />
                                            </div>
                                          </th>
                                        );
                                      })}
                                      <th className="border-b border-slate-200 dark:border-slate-700 p-2 text-center text-xs text-slate-500">
                                        Row
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(block as any).rows.map((row: string[], rIdx: number) => {
                                      const isDragOver =
                                        dragOverRow?.blockIdx === index &&
                                        dragOverRow?.rowIdx === rIdx;

                                      return (
                                        <tr
                                          key={rIdx}
                                          draggable
                                          onDragStart={(e) => handleRowDragStart(e, index, rIdx)}
                                          onDragOver={(e) => handleRowDragOver(e, index, rIdx)}
                                          onDrop={(e) => handleRowDrop(e, index, rIdx)}
                                          onDragEnd={handleRowDragEnd}
                                          className={`odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-800 ${
                                            isDragOver ? "outline outline-2 outline-primary/60" : ""
                                          }`}
                                        >
                                          {row.map((cell: string, cIdx: number) => (
                                            <td
                                              key={cIdx}
                                              className="border-t border-slate-200 dark:border-slate-700 p-1"
                                            >
                                              <input
                                                type="text"
                                                value={cell}
                                                onChange={(e) => {
                                                  const rows = (block as any).rows.map((r: string[]) => [...r]);
                                                  rows[rIdx][cIdx] = e.target.value;
                                                  updateBlock(index, {
                                                    ...block,
                                                    rows,
                                                  });
                                                }}
                                                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
                                              />
                                            </td>
                                          ))}
                                          <td className="border-t border-slate-200 dark:border-slate-700 p-1 text-center align-middle">
                                            <div className="flex items-center justify-center gap-2">
                                              <span className="cursor-grab text-slate-400" title="Drag to reorder">
                                                ☰
                                              </span>
                                              <button
                                                onClick={() => {
                                                  const rows = (block as any).rows.filter((_: any, i: number) => i !== rIdx);
                                                  updateBlock(index, {
                                                    ...block,
                                                    rows,
                                                  });
                                                }}
                                                className="hover:bg-red-100 dark:hover:bg-red-900/20"
                                                title="Delete row"
                                              >
                                                <svg fill="#f56969ff" width="25px" height="25px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" stroke="#f03939ff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g data-name="01" id="_01"> <path d="M13,20V14a1,1,0,0,1,2,0v6a1,1,0,0,1-2,0Zm5,1a1,1,0,0,0,1-1V14a1,1,0,0,0-2,0v6A1,1,0,0,0,18,21ZM7,10A1,1,0,0,1,8,9h4V7a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1V9h4a1,1,0,0,1,0,2H23V22a4,4,0,0,1-4,4H13a4,4,0,0,1-4-4V11H8A1,1,0,0,1,7,10Zm7-1h4V8H14ZM11,22a2,2,0,0,0,2,2h6a2,2,0,0,0,2-2V11H11Z"></path> </g> </g></svg>
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          {block.type === "image" && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={block.src || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    src: e.target.value,
                                  })
                                }
                                placeholder="Image URL"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    caption: e.target.value,
                                  })
                                }
                                placeholder="Caption (optional)"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>
                          )}
                          {block.type === "audio" && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={block.src || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    src: e.target.value,
                                  })
                                }
                                placeholder="Audio URL"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    caption: e.target.value,
                                  })
                                }
                                placeholder="Caption (optional)"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>
                          )}
                          {block.type === "youtube" && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={block.videoId || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    videoId: e.target.value,
                                  })
                                }
                                placeholder="YouTube Video ID"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    caption: e.target.value,
                                  })
                                }
                                placeholder="Caption (optional)"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>
                          )}
                          {block.type === "example" && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={(block as any).german || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    german: e.target.value,
                                  })
                                }
                                placeholder="German sentence"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <input
                                type="text"
                                value={(block as any).english || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    english: e.target.value,
                                  })
                                }
                                placeholder="English translation"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <input
                                type="text"
                                value={(block as any).pronunciationAudio || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    pronunciationAudio: e.target.value,
                                  })
                                }
                                placeholder="Pronunciation audio URL (German)"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                <button
                                  type="button"
                                  onClick={() => importExampleJson(index)}
                                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-primary hover:border-primary hover:bg-primary/5 transition-colors font-semibold text-xs"
                                >
                                  Paste JSON (single or many)
                                </button>
                                <span>Use objects with german, english, pronunciationAudio.</span>
                              </div>
                            </div>
                          )}
                          {block.type === "multipleChoice" && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={(block as any).question || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    question: e.target.value,
                                  })
                                }
                                placeholder="Question"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">Options:</label>
                                <div className="space-y-2">
                                  {((block as any).options || []).map((option: string, optIdx: number) => (
                                    <div key={optIdx} className="flex gap-2 items-center">
                                      <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={(block as any).correctAnswer === optIdx}
                                        onChange={() =>
                                          updateBlock(index, {
                                            ...block,
                                            correctAnswer: optIdx,
                                          })
                                        }
                                        className="w-4 h-4"
                                      />
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const options = [...(block as any).options];
                                          options[optIdx] = e.target.value;
                                          updateBlock(index, {
                                            ...block,
                                            options,
                                          });
                                        }}
                                        placeholder={`Option ${optIdx + 1}`}
                                        className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                      />
                                      <button
                                        onClick={() => {
                                          const options = (block as any).options.filter((_: string, i: number) => i !== optIdx);
                                          updateBlock(index, {
                                            ...block,
                                            options,
                                            correctAnswer: (block as any).correctAnswer === optIdx ? 0 : (block as any).correctAnswer,
                                          });
                                        }}
                                        className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    const options = [...((block as any).options || []), ''];
                                    updateBlock(index, {
                                      ...block,
                                      options,
                                    });
                                  }}
                                  className="mt-2 text-sm text-primary hover:text-blue-700 font-medium"
                                >
                                  + Add Option
                                </button>
                              </div>
                              <textarea
                                value={(block as any).explanation || ""}
                                onChange={(e) =>
                                  updateBlock(index, {
                                    ...block,
                                    explanation: e.target.value,
                                  })
                                }
                                placeholder="Explanation (optional)"
                                rows={2}
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                              />
                            </div>
                          )}
                          {block.type === "fillInTheBlank" && (
                            <div className="space-y-3">
                              <div className="flex gap-3 flex-wrap items-center text-[11px] text-slate-500 justify-between">
                                <button
                                  onClick={() => importFillJson(index)}
                                  className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                  Paste JSON (single or many)
                                </button>
                                <span>Use text with ___, answers array, optional wordOptions/hints.</span>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                                  Sentence (use ___ for blanks)
                                </label>
                                <textarea
                                  value={(block as any).text || ""}
                                  onChange={(e) => {
                                    const text = e.target.value;
                                    const blankCount = (text.match(/___/g) || []).length;
                                    const answers = Array(blankCount).fill('').map((_, i) => ((block as any).answers?.[i] || ''));
                                    updateBlock(index, {
                                      ...block,
                                      text,
                                      answers,
                                    });
                                  }}
                                  placeholder="The ___ sat on the ___"
                                  rows={2}
                                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">Answers for each blank:</label>
                                <div className="space-y-2">
                                  {((block as any).answers || []).map((answer: string, ansIdx: number) => (
                                    <input
                                      key={ansIdx}
                                      type="text"
                                      value={answer}
                                      onChange={(e) => {
                                        const answers = [...((block as any).answers || [])];
                                        answers[ansIdx] = e.target.value;
                                        updateBlock(index, {
                                          ...block,
                                          answers,
                                        });
                                      }}
                                      placeholder={`Answer ${ansIdx + 1}`}
                                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">Word options (for dragging):</label>
                                <div className="space-y-1">
                                  {((block as any).wordOptions || []).map((word: string, wordIdx: number) => (
                                    <div key={wordIdx} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={word}
                                        onChange={(e) => {
                                          const wordOptions = [...((block as any).wordOptions || [])];
                                          wordOptions[wordIdx] = e.target.value;
                                          updateBlock(index, {
                                            ...block,
                                            wordOptions,
                                          });
                                        }}
                                        placeholder={`Word ${wordIdx + 1}`}
                                        className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                      />
                                      <button
                                        onClick={() => {
                                          const wordOptions = (block as any).wordOptions.filter((_: string, i: number) => i !== wordIdx);
                                          updateBlock(index, {
                                            ...block,
                                            wordOptions,
                                          });
                                        }}
                                        className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    const wordOptions = [...((block as any).wordOptions || []), ''];
                                    updateBlock(index, {
                                      ...block,
                                      wordOptions,
                                    });
                                  }}
                                  className="mt-2 text-sm text-primary hover:text-blue-700 font-medium"
                                >
                                  + Add Word Option
                                </button>
                              </div>
                            </div>
                          )}
                          {block.type === "matchingPairs" && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                                  Title (optional)
                                </label>
                                <input
                                  type="text"
                                  value={(block as any).title || ""}
                                  onChange={(e) => {
                                    updateBlock(index, {
                                      ...block,
                                      title: e.target.value,
                                    });
                                  }}
                                  placeholder="Match the pairs"
                                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">Pairs:</label>
                                <div className="space-y-2">
                                  {((block as any).pairs || []).map((pair: any, pairIdx: number) => (
                                    <div key={pairIdx} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={pair.left || ""}
                                        onChange={(e) => {
                                          const pairs = [...((block as any).pairs || [])];
                                          pairs[pairIdx].left = e.target.value;
                                          updateBlock(index, {
                                            ...block,
                                            pairs,
                                          });
                                        }}
                                        placeholder="Left item"
                                        className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                      />
                                      <span className="flex items-center text-slate-400">↔</span>
                                      <input
                                        type="text"
                                        value={pair.right || ""}
                                        onChange={(e) => {
                                          const pairs = [...((block as any).pairs || [])];
                                          pairs[pairIdx].right = e.target.value;
                                          updateBlock(index, {
                                            ...block,
                                            pairs,
                                          });
                                        }}
                                        placeholder="Right item"
                                        className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                      />
                                      <button
                                        onClick={() => {
                                          const pairs = (block as any).pairs.filter((_: any, i: number) => i !== pairIdx);
                                          updateBlock(index, {
                                            ...block,
                                            pairs,
                                          });
                                        }}
                                        className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    const pairs = [...((block as any).pairs || [])];
                                    pairs.push({ left: '', right: '' });
                                    updateBlock(index, {
                                      ...block,
                                      pairs,
                                    });
                                  }}
                                  className="mt-2 text-sm text-primary hover:text-blue-700 font-medium"
                                >
                                  + Add Pair
                                </button>
                              </div>
                            </div>
                          )}
                          {block.type === "divider" && (
                              <hr className="border-t-2 border-slate-300 dark:border-slate-700" />
                          )}
                          
                          {block.type === "vocabulary" && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                                  Title{" "}
                                  <span className="text-slate-400 text-xs">
                                    (optional)
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={block.title || ""}
                                  onChange={(e) =>
                                    updateBlock(index, {
                                      ...block,
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Key Vocabulary, Important Words..."
                                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                                  Selected Vocabularies (
                                  {block.vocabIds?.length || 0})
                                </label>
                                <button
                                  onClick={() => {
                                    console.log(
                                      "Selected vocab IDs:",
                                      selectedVocabIds
                                    );
                                    updateBlock(index, {
                                      ...block,
                                      vocabIds: [...selectedVocabIds],
                                    });
                                  }}
                                  className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 3c-2.49 0-4.52 2.03-4.52 4.52S5.01 12.04 7.5 12.04c1.16 0 2.23-.44 3.03-1.16l1.09 1.09c-1.15 1.02-2.67 1.64-4.32 1.64-3.59 0-6.52-2.93-6.52-6.52S3.91 1 7.5 1c3.59 0 6.52 2.93 6.52 6.52 0 .87-.17 1.7-.48 2.45l1.48 1.48C23.06 8.95 24 5.96 24 2.5M7.5 6c-.9 0-1.64.74-1.64 1.64S6.6 9.28 7.5 9.28s1.64-.74 1.64-1.64S8.4 6 7.5 6z"/></svg>
                                  Use Currently Selected Vocabs (
                                  {selectedVocabIds.length})
                                </button>
                                {block.vocabIds &&
                                  block.vocabIds.length > 0 && (
                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                        Vocabulary IDs in this block:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {block.vocabIds.map((id) => {
                                          const vocab = vocabularies.find(
                                            (v) => v.id === id
                                          );
                                          return (
                                            <span
                                              key={id}
                                              className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                                            >
                                              {vocab?.term || `ID: ${id}`}
                                              <button
                                                onClick={() =>
                                                  updateBlock(index, {
                                                    ...block,
                                                    vocabIds:
                                                      block.vocabIds.filter(
                                                        (vid) => vid !== id
                                                      ),
                                                  })
                                                }
                                                className="hover:text-red-500"
                                              >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                              </button>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Block Trigger - Only in Edit Mode */}
                  {!previewMode && (
                    <button
                      onClick={() => addBlock("paragraph")}
                      className="h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer w-full"
                    >
                      <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth={2}/></svg>
                      <span className="font-medium">Add new block</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar (Settings) */}
        <aside className="w-60 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 hidden lg:flex flex-col z-10">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Lesson Settings
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Metadata */}
            <section>
              <label className="block mb-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Level
                </span>
                <select
                  value={levelId ?? ""}
                  onChange={(e) =>
                    setLevelId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm p-2"
                >
                  <option value="">Select a level...</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Lesson Slug
                </span>
                <input
                  type="text"
                  value={lessonSlug}
                  onChange={(e) => setLessonSlug(e.target.value)}
                  className="block w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring focus:ring-blue-300 sm:text-sm p-1"
                  placeholder="lesson-slug"
                />
                <p className="text-[9px] text-slate-800 dark:text-slate-400 mt-1">
                  URL-friendly identifier (auto-generated from title)
                </p>
              </label>

              

              <label className="block mb-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tags
                </span>
                <div className="mt-1 flex flex-wrap gap-2 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 min-h-[42px]">
                  <span className="inline-flex items-center rounded bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20">
                    Grammar
                    <button className="ml-1 text-indigo-400 hover:text-indigo-600">
                      ×
                    </button>
                  </span>
                  <input
                    className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 min-w-[60px] placeholder-slate-400"
                    placeholder="Add..."
                    type="text"
                  />
                </div>
              </label>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Vocabularies */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Associated Vocabularies
                </h4>
                <button
                  onClick={() => setShowNewVocabModal(true)}
                  className="text-sm text-primary hover:text-blue-700 font-medium flex items-center gap-1"
                  title="Add new vocabulary"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                  New
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Search vocabularies..."
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button
                  onClick={() => setShowOnlySelected(!showOnlySelected)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                    showOnlySelected
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title={
                    showOnlySelected
                      ? "Showing selected only"
                      : "Show all vocabularies"
                  }
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vocabularies.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No vocabularies available
                  </p>
                ) : (
                  (() => {
                    let filtered = vocabularies;

                    // Filter by search
                    if (vocabSearch) {
                      filtered = filtered.filter(
                        (vocab) =>
                          vocab.term
                            .toLowerCase()
                            .includes(vocabSearch.toLowerCase()) ||
                          vocab.definition
                            .toLowerCase()
                            .includes(vocabSearch.toLowerCase())
                      );
                    }

                    // Filter by selected only
                    if (showOnlySelected) {
                      filtered = filtered.filter((vocab) =>
                        selectedVocabIds.includes(vocab.id)
                      );
                    }

                    return filtered.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {showOnlySelected
                          ? "No selected vocabularies"
                          : "No vocabularies match your search"}
                      </p>
                    ) : (
                      filtered.map((vocab) => (
                        <label
                          key={vocab.id}
                          className="flex items-start gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedVocabIds.includes(vocab.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...selectedVocabIds, vocab.id]
                                : selectedVocabIds.filter(
                                    (id) => id !== vocab.id
                                  );
                              onVocabSelectionChange?.(newIds);
                            }}
                            className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {vocab.term}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {vocab.definition}
                            </div>
                          </div>
                        </label>
                      ))
                    );
                  })()
                )}
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Cover Image */}
            <section>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Cover Image
              </h4>
              <div className="group relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors">
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  <span className="text-sm font-medium">
                    Upload cover image
                  </span>
                </div>
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Description */}
            <section>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Short Description
              </h4>
              <textarea
                onFocus={(e) => setFocusedElement(e.target)}
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm p-3"
                placeholder="Brief summary for the course list..."
                rows={3}
              />
            </section>
          </div>
        </aside>
      </div>

      {/* Add Vocabulary Modal */}
      {showNewVocabModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full my-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Add New Vocabulary
              </h3>
              <button
                onClick={() => setShowNewVocabModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Term
                </label>
                <input
                  type="text"
                  value={newVocabForm.term}
                  onChange={(e) =>
                    setNewVocabForm({ ...newVocabForm, term: e.target.value })
                  }
                  placeholder="Enter vocabulary term..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Definition
                </label>
                <textarea
                  value={newVocabForm.definition}
                  onChange={(e) =>
                    setNewVocabForm({
                      ...newVocabForm,
                      definition: e.target.value,
                    })
                  }
                  placeholder="Enter definition..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Language
                </label>
                <select
                  value={newVocabForm.language}
                  onChange={(e) =>
                    setNewVocabForm({
                      ...newVocabForm,
                      language: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="it">Italian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Example (German){" "}
                  <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newVocabForm.exampleGerman}
                  onChange={(e) =>
                    setNewVocabForm({
                      ...newVocabForm,
                      exampleGerman: e.target.value,
                    })
                  }
                  placeholder="Enter German example sentence..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Example (English){" "}
                  <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newVocabForm.exampleEnglish}
                  onChange={(e) =>
                    setNewVocabForm({
                      ...newVocabForm,
                      exampleEnglish: e.target.value,
                    })
                  }
                  placeholder="Enter English example sentence..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Image URL{" "}
                  <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newVocabForm.imageUrl}
                  onChange={(e) =>
                    setNewVocabForm({
                      ...newVocabForm,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="Enter image URL..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end">
              <button
                onClick={() => setShowNewVocabModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewVocab}
                disabled={isAddingVocab}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isAddingVocab ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4V1m0 22v-3m8-8h3M3 12h3m18 0c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z" opacity="0.5"/><path d="M12 4V1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Add Vocabulary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add Content Block
                </h2>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Text Blocks */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Text Blocks
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["title", "header", "subheader", "paragraph", "table", "divider"].map((type) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type as BlockType)}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:border-primary transition-all text-left"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {type === "header" ? "Heading" : type === "paragraph" ? "Text" : type === "divider" ? "Divider (---)" : type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Blocks */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Media
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["image", "audio", "youtube"].map((type) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type as BlockType)}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:border-primary transition-all text-left"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {type === "youtube" ? "YouTube" : type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Blocks */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Interactive
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["example", "vocabulary", "multipleChoice", "fillInTheBlank", "matchingPairs"].map((type) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type as BlockType)}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:border-primary transition-all text-left"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {type === "multipleChoice"
                          ? "MC Quiz"
                          : type === "fillInTheBlank"
                          ? "Fill Blank"
                          : type === "matchingPairs"
                          ? "Matching"
                          : type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Block, BlockType, blockIcons, blockLabels } from "./blockTypes";

type BlockEditorProps = {
  blocks: Block[];
  selectedBlockIndex: number | null;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  onSelectBlock: (index: number) => void;
  onUpdateBlock: (index: number, next: Block) => void;
  onMoveBlock: (index: number, direction: -1 | 1) => void;
  onRemoveBlock: (index: number) => void;
  onDragStart: (event: React.DragEvent, index: number) => void;
  onDragOver: (event: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (event: React.DragEvent, index: number) => void;
};

export default function BlockEditor({
  blocks,
  selectedBlockIndex,
  draggedIndex,
  dragOverIndex,
  onSelectBlock,
  onUpdateBlock,
  onMoveBlock,
  onRemoveBlock,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: BlockEditorProps) {
  if (!blocks.length) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={(e) => onDragStart(e, idx)}
          onDragOver={(e) => onDragOver(e, idx)}
          onDragEnd={onDragEnd}
          onDrop={(e) => onDrop(e, idx)}
          onClick={() => onSelectBlock(idx)}
          className={`group relative rounded-xl border-2 transition-all cursor-move ${
            selectedBlockIndex === idx
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg"
              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
          } ${draggedIndex === idx ? "opacity-50" : ""} ${
            dragOverIndex === idx && draggedIndex !== idx
              ? "border-indigo-400 border-dashed"
              : ""
          }`}
        >
          <div className="flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-400 cursor-grab active:cursor-grabbing">
                <span>⋮⋮</span>
              </div>
              <span>{blockIcons[block.type]}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {blockLabels[block.type]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveBlock(idx, -1);
                }}
                disabled={idx === 0}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 24 24"
                  fill="none"
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
                  <g id="SVGRepo_iconCarrier" data--h-bstatus="0OBSERVED">
                    {" "}
                    <path
                      d="M12 5V19M12 5L6 11M12 5L18 11"
                      stroke="#000000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                  </g>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveBlock(idx, 1);
                }}
                disabled={idx === blocks.length - 1}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 24 24"
                  fill="none"
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
                  <g id="SVGRepo_iconCarrier" data--h-bstatus="0OBSERVED">
                    {" "}
                    <path
                      d="M12 20L12 4"
                      stroke="#000000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                    <path
                      d="M5 13L12 20L19 13"
                      stroke="#000000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                  </g>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBlock(idx);
                }}
                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                title="Delete"
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="-2.4 -2.4 28.80 28.80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data--h-bstatus="0OBSERVED"
                  stroke="#000000"
                  transform="matrix(1, 0, 0, 1, 0, 0)"
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
                  <g id="SVGRepo_iconCarrier" data--h-bstatus="0OBSERVED">
                    {" "}
                    <path
                      d="M4 6H20L18.4199 20.2209C18.3074 21.2337 17.4512 22 16.4321 22H7.56786C6.54876 22 5.69264 21.2337 5.5801 20.2209L4 6Z"
                      stroke="#ff0000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                    <path
                      d="M7.34491 3.14716C7.67506 2.44685 8.37973 2 9.15396 2H14.846C15.6203 2 16.3249 2.44685 16.6551 3.14716L18 6H6L7.34491 3.14716Z"
                      stroke="#ff0000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                    <path
                      d="M2 6H22"
                      stroke="#ff0000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                    <path
                      d="M10 11V16"
                      stroke="#ff0000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                    <path
                      d="M14 11V16"
                      stroke="#ff0000"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data--h-bstatus="0OBSERVED"
                    ></path>{" "}
                  </g>
                </svg>
              </button>
            </div>
          </div>

          <div className="px-4 py-1 ">
            {["title", "header", "subheader", "paragraph"].includes(
              block.type
            ) && (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {block.type === "paragraph" ? "Paragraph text" : "Text"}
                  </label>
                  <textarea
                    value={(block as any).text}
                    onChange={(e) =>
                      onUpdateBlock(idx, {
                        ...block,
                        text: e.target.value,
                      } as Block)
                    }
                    placeholder={`Enter ${block.type} text...`}
                    rows={block.type === "paragraph" ? 4 : 2}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                {block.type === "paragraph" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Translation (optional)
                    </label>
                    <textarea
                      value={(block as any).translation ?? ""}
                      onChange={(e) =>
                        onUpdateBlock(idx, {
                          ...block,
                          translation: e.target.value,
                        } as Block)
                      }
                      placeholder="Enter translation for this paragraph..."
                      rows={3}
                      className="w-full rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 px-4 py-2 text-sm bg-indigo-50/60 dark:bg-indigo-950/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {block.type === "table" && (
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Headers
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {block.headers.map((h, hIdx) => (
                      <input
                        key={hIdx}
                        value={h}
                        onChange={(e) => {
                          const headers = [...block.headers];
                          headers[hIdx] = e.target.value;
                          onUpdateBlock(idx, { ...block, headers });
                        }}
                        className="flex-1 min-w-[120px] rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Header ${hIdx + 1}`}
                      />
                    ))}
                    <button
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                      onClick={() => {
                        const headers = [
                          ...block.headers,
                          `Col ${block.headers.length + 1}`,
                        ];
                        const rows = block.rows.map((r) => [...r, ""]);
                        onUpdateBlock(idx, { ...block, headers, rows });
                      }}
                    >
                      + Column
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Rows
                  </label>
                  <div className="space-y-2">
                    {block.rows.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-2">
                        {row.map((cell, cIdx) => (
                          <input
                            key={cIdx}
                            value={cell}
                            onChange={(e) => {
                              const rows = block.rows.map((r, i) =>
                                i === rIdx
                                  ? r.map((c, j) =>
                                      j === cIdx ? e.target.value : c
                                    )
                                  : r
                              );
                              onUpdateBlock(idx, { ...block, rows });
                            }}
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={`Cell ${rIdx + 1}-${cIdx + 1}`}
                          />
                        ))}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                        onClick={() => {
                          const rows = [
                            ...block.rows,
                            new Array(block.headers.length).fill(""),
                          ];
                          onUpdateBlock(idx, { ...block, rows });
                        }}
                      >
                        + Row
                      </button>
                      {block.rows.length > 1 && (
                        <button
                          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                          onClick={() => {
                            const rows = block.rows.slice(0, -1);
                            onUpdateBlock(idx, { ...block, rows });
                          }}
                        >
                          - Row
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {block.type === "audio" && (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Audio URL
                  </label>
                  <input
                    value={block.src}
                    onChange={(e) =>
                      onUpdateBlock(idx, { ...block, src: e.target.value })
                    }
                    placeholder="https://example.com/audio.mp3"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Caption (optional)
                  </label>
                  <input
                    value={block.caption ?? ""}
                    onChange={(e) =>
                      onUpdateBlock(idx, { ...block, caption: e.target.value })
                    }
                    placeholder="Audio caption"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {block.type === "youtube" && (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    YouTube Video ID
                  </label>
                  <input
                    value={block.videoId}
                    onChange={(e) =>
                      onUpdateBlock(idx, {
                        ...block,
                        videoId: e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""),
                      })
                    }
                    placeholder="dQw4w9WgXcQ"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Caption (optional)
                  </label>
                  <input
                    value={block.caption ?? ""}
                    onChange={(e) =>
                      onUpdateBlock(idx, { ...block, caption: e.target.value })
                    }
                    placeholder="Video caption"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {block.type === "image" && (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Image URL
                  </label>
                  <input
                    value={block.src}
                    onChange={(e) =>
                      onUpdateBlock(idx, { ...block, src: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Alt Text (optional)
                  </label>
                  <input
                    value={block.alt ?? ""}
                    onChange={(e) =>
                      onUpdateBlock(idx, { ...block, alt: e.target.value })
                    }
                    placeholder="Description of the image"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

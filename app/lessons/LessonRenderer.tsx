"use client";
import React, { useState, useEffect } from "react";

type LessonBlock =
  | { type: "title"; text: string }
  | { type: "header"; text: string }
  | { type: "subheader"; text: string }
  | { type: "paragraph"; text: string; translation?: string; items?: string[] }
  | { type: "list"; title?: string; ordered?: boolean; items: string[] }
  | { type: "table"; title?: string; headers: string[]; rows: string[][] }
  | { type: "audio"; src: string; caption?: string }
  | { type: "youtube"; videoId: string; caption?: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | {
      type: "example";
      german: string;
      english: string;
      pronunciationAudio?: string;
    }
  | {
      type: "multipleChoice";
      question: string;
      options: string[];
      correctAnswer?: number;
      explanation?: string;
    }
  | {
      type: "fillInTheBlank";
      text: string;
      answers: string[];
      wordOptions?: string[];
      hints?: string[];
    }
  | {
      type: "matchingPairs";
      title?: string;
      pairs: Array<{ left: string; right: string }>;
    }
  | { type: "divider" }
  | { type: "vocabulary"; title?: string; vocabIds: number[] };

type Vocabulary = {
  id: number;
  term: string;
  definition: string;
  language: string;
  exampleGerman?: string | null;
  exampleEnglish?: string | null;
  imageUrl?: string | null;
};

export default function LessonRenderer({ blocks }: { blocks: LessonBlock[] }) {
  const safeYouTube = (videoId: string) =>
    videoId.replace(/[^a-zA-Z0-9_-]/g, "");
  const [openTranslations, setOpenTranslations] = useState<
    Record<number, boolean>
  >({});
  const [vocabularies, setVocabularies] = useState<Record<number, Vocabulary>>(
    {}
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(
    {}
  );
  const [blankAnswers, setBlankAnswers] = useState<Record<number, string[]>>({});
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [blankResults, setBlankResults] = useState<Record<number, boolean[]>>({});
  const [blankSubmitted, setBlankSubmitted] = useState<Record<number, boolean>>({});
  const [matchPairConnections, setMatchPairConnections] = useState<Record<number, Record<number, number>>>({});
  const [matchPairResults, setMatchPairResults] = useState<Record<number, boolean[]>>({});
  const [matchPairSelected, setMatchPairSelected] = useState<Record<number, number | null>>({});
  const [matchPairShuffled, setMatchPairShuffled] = useState<Record<number, number[]>>({})

  const playPronunciation = (url?: string) => {
    if (!url) return;
    try {
      const audio = new Audio(url);
      void audio.play();
    } catch (err) {
      console.error("Failed to play pronunciation", err);
    }
  };

  useEffect(() => {
    // Collect all vocabulary IDs from blocks
    const allVocabIds = blocks
      .filter(
        (b): b is Extract<LessonBlock, { type: "vocabulary" }> =>
          b.type === "vocabulary"
      )
      .flatMap((b) => b.vocabIds);

    if (allVocabIds.length === 0) return;

    // Fetch vocabularies
    const uniqueIds = Array.from(new Set(allVocabIds));
    fetch("/api/vocabs")
      .then((res) => res.json())
      .then((data: Vocabulary[]) => {
        const vocabMap: Record<number, Vocabulary> = {};
        data.forEach((vocab) => {
          if (uniqueIds.includes(vocab.id)) {
            vocabMap[vocab.id] = vocab;
          }
        });
        setVocabularies(vocabMap);
      })
      .catch((err) => console.error("Failed to fetch vocabularies:", err));
  }, [blocks]);

  useEffect(() => {
    // Initialize shuffled pairs for matching pair blocks on component mount
    const newShuffled: Record<number, number[]> = {};
    blocks.forEach((b, idx) => {
      if (b.type === "matchingPairs") {
        const indices = (b.pairs || []).map((_, i) => i);
        const arr = [...indices];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        newShuffled[idx] = arr;
      }
    });
    setMatchPairShuffled(newShuffled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderFormattedText = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;

    // Pattern to match **bold**, __underline__, {color}text{/color}, and markdown headings
    const formatRegex =
      /^(#{1,3})\s+(.+)$|\*\*(.+?)\*\*|__(.+?)__|\{(red|blue|green|yellow|orange|purple|pink)\}(.+?)\{\/\5\}/gm;
    let match;

    const colorMap: Record<string, string> = {
      red: "text-red-500",
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
      orange: "text-orange-500",
      purple: "text-purple-500",
      pink: "text-pink-500",
    };

    // Handle markdown headings at the start of the text
    const headingMatch = text.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const headingLevel = headingMatch[1].length; // 1 for #, 2 for ##, 3 for ###
      const headingText = headingMatch[2];
      
      const headingClasses = {
        1: "text-xl font-bold",
        2: "text-lg font-semibold",
        3: "text-base font-semibold",
      };

      return (
        <span className={headingClasses[headingLevel as 1 | 2 | 3]}>
          {renderFormattedText(headingText)}
        </span>
      );
    }

    // Pattern for inline formatting (without heading)
    const inlineRegex =
      /\*\*(.+?)\*\*|__(.+?)__|\{(red|blue|green|yellow|orange|purple|pink)\}(.+?)\{\/\3\}/g;

    while ((match = inlineRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add formatted text
      if (match[1]) {
        // Bold
        parts.push(<strong key={`${match.index}-bold`}>{match[1]}</strong>);
      } else if (match[2]) {
        // Underline
        parts.push(<u key={`${match.index}-underline`}>{match[2]}</u>);
      } else if (match[3] && match[4]) {
        // Color
        const colorClass = colorMap[match[3]] || "text-gray-500";
        parts.push(
          <span key={`${match.index}-color`} className={colorClass}>
            {match[4]}
          </span>
        );
      }

      lastIndex = inlineRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="prose prose-indigo dark:prose-invert max-w-none">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "title":
            return (
              <h1 key={i} className="text-3xl font-bold">
                {b.text}
              </h1>
            );
          case "header":
            return (
              <h2 key={i} className="text-2xl font-semibold">
                {b.text}
              </h2>
            );
          case "subheader":
            return (
              <h3 key={i} className="text-xl font-semibold">
                {b.text}
              </h3>
            );
          case "paragraph": {
            const lines = (b.text || "").split("\n");
            const elements: React.ReactNode[] = [];
            let currentList: { text: string; children: string[] }[] = [];

            const flushList = () => {
              if (currentList.length === 0) return;
              const listKey = `${i}-list-${elements.length}`;
              elements.push(
                <ul
                  key={listKey}
                  className="list-disc list-inside m-2 space-y-1 text-base"
                >
                  {currentList.map((item, idx) => (
                    <li key={idx} className="space-y-1">
                      {renderFormattedText(item.text)}
                      {item.children.length > 0 && (
                        <ul className="list-disc list-inside ml-5 space-y-1 text-sm">
                          {item.children.map((child, cIdx) => (
                            <li key={cIdx}>{renderFormattedText(child)}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              );
              currentList = [];
            };

            const isTableRow = (line: string) => /^\s*\|(.+\|)+\s*$/.test(line);
            const isSeparatorRow = (line: string) => /^\s*\|?\s*:?[-]{3,}.*\|\s*$/.test(line);

            for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
              const line = lines[lineIdx];
              const trimmed = line.trim();

              if (trimmed === "---") {
                flushList();
                elements.push(
                  <hr
                    key={`${i}-hr-${lineIdx}`}
                    className="my-6 border-t border-slate-300 dark:border-slate-700"
                  />
                );
                continue;
              }

              if (!trimmed) {
                flushList();
                elements.push(<div key={`${i}-spacer-${lineIdx}`} className="h-2" />);
                continue;
              }

              // Markdown table detection
              if (isTableRow(trimmed) && lineIdx + 1 < lines.length && isSeparatorRow(lines[lineIdx + 1].trim())) {
                flushList();
                const tableLines: string[] = [trimmed, lines[++lineIdx].trim()];
                while (lineIdx + 1 < lines.length && isTableRow(lines[lineIdx + 1].trim())) {
                  tableLines.push(lines[++lineIdx].trim());
                }

                const headers = tableLines[0]
                  .split("|")
                  .slice(1, -1)
                  .map((h) => h.trim())
                  .filter(Boolean);
                const bodyRows = tableLines.slice(2).map((row) =>
                  row
                    .split("|")
                    .slice(1, -1)
                    .map((c) => c.trim())
                );

                elements.push(
                  <div key={`${i}-table-${lineIdx}`} className="my-4 overflow-x-auto">
                    <table className="min-w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          {headers.map((h, hIdx) => (
                            <th
                              key={hIdx}
                              className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700"
                            >
                              {renderFormattedText(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bodyRows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/70"}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 align-top"
                              >
                                {renderFormattedText(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
                continue;
              }

              const listMatch = line.match(/^(\s*)\* (.*)$/);
              if (listMatch) {
                const indent = listMatch[1].length;
                const content = listMatch[2];

                if (indent >= 2 && currentList.length > 0) {
                  currentList[currentList.length - 1].children.push(content);
                } else {
                  currentList.push({ text: content, children: [] });
                }
                continue;
              }

              flushList();
              elements.push(
                <p
                  key={`${i}-p-${lineIdx}`}
                  className="whitespace-pre-wrap my-2 text-lg"
                >
                  {renderFormattedText(line)}
                </p>
              );
            }

            flushList();

            return (
              <div key={i} className="not-prose my-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">{elements}</div>
                  {b.translation && (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTranslations((prev) => ({
                          ...prev,
                          [i]: !prev[i],
                        }))
                      }
                      className="mt-1 inline-flex items-center justify-center rounded-full border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900"
                      aria-label="Toggle translation"
                    >
                      🌐
                    </button>
                  )}
                </div>

                {b.items && b.items.length > 0 && (
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {b.items
                      .filter((item) => item.trim())
                      .map((item, idx) => (
                        <li key={idx} className="text-sm">
                          {item}
                        </li>
                      ))}
                  </ul>
                )}

                {b.translation && openTranslations[i] && (
                  <div className="mt-2 rounded-md border border-dashed border-indigo-300 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-100">
                    {b.translation}
                  </div>
                )}
              </div>
            );
          }

          case "list":
  return (
    <div key={i} className="my-4">
      {b.title && <h4 className="text-lg font-semibold mb-2">{b.title}</h4>}
      {(b.items?.length ?? 0) > 0 ? (
        b.ordered ? (
          <ol className="list-decimal list-inside space-y-2 text-lg">
            {b.items.map((item, idx) => <li key={idx}>{renderFormattedText(item)}</li>)}
          </ol>
        ) : (
          <ul className="list-disc list-inside space-y-2 text-lg">
            {b.items.map((item, idx) => <li key={idx}>{renderFormattedText(item)}</li>)}
          </ul>
        )
      ) : (
        <p className="text-sm text-slate-500 italic">No items provided.</p>
      )}
    </div>
  );

  
          case "table":
            return (
              <div key={i} className="my-4">
                {b.title && (
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    {b.title}
                  </h4>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        {b.headers.map((h, idx) => (
                          <th
                            key={idx}
                          className="px-3 py-2 text-left border-b dark:border-gray-700"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-3 py-2 border-b dark:border-gray-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            );
          case "audio":
            return (
              <figure key={i} className="my-4">
                <audio controls className="w-full">
                  <source src={b.src} />
                </audio>
                {b.caption && (
                  <figcaption className="text-sm text-gray-500">
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "youtube":
            return (
              <figure key={i} className="my-4">
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-md"
                    src={`https://www.youtube.com/embed/${safeYouTube(
                      b.videoId
                    )}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                {b.caption && (
                  <figcaption className="text-sm text-gray-500">
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "image":
            return (
              <figure key={i} className="my-4">
                <img
                  src={b.src}
                  alt={b.alt ?? "Lesson image"}
                  className="w-full h-auto rounded-md border border-gray-200 dark:border-gray-700"
                />
                {b.caption && (
                  <figcaption className="text-sm text-gray-500 text-center mt-2">
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "example":
            return (
              <div
                key={i}
                className="not-prose my-4 p-4"
              >
                <div className="mt-2 space-y-2">
                  {b.german && (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                      {b.pronunciationAudio && (
                        <button
                          type="button"
                          onClick={() =>
                            playPronunciation(b.pronunciationAudio)
                          }
                          className="inline-flex items-center justify-center size-6 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          aria-label="Play German pronunciation"
                        >
                          <svg
                            fill="#000000"
                            width="20px"
                            height="20px"
                            viewBox="0 0 1920 1920"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                d="M1129.432 113v1694.148H936.638l-451.773-451.773h-315.45C76.01 1355.375 0 1279.365 0 1185.96V734.187c0-93.404 76.01-169.414 169.415-169.414h315.45L936.638 113h192.794Zm-112.943 112.943h-33.093l-418.68 418.68v630.901l418.68 418.68h33.093V225.944Zm655.488 135.114C1831.904 521.097 1920 733.77 1920 960.107c0 226.226-88.096 438.898-248.023 598.938l-79.851-79.85c138.694-138.695 214.93-323.018 214.93-519.087 0-196.183-76.236-380.506-214.93-519.2Zm-239.112 239.745c95.663 97.018 148.294 224.644 148.294 359.272s-52.631 262.254-148.294 359.272l-80.529-79.286c74.769-75.785 115.88-175.175 115.88-279.986 0-104.811-41.111-204.201-115.88-279.986Zm-981.092 76.914H169.415c-31.06 0-56.472 25.3-56.472 56.471v451.773c0 31.172 25.412 56.472 56.472 56.472h282.358V677.716Z"
                                fill-rule="evenodd"
                              ></path>{" "}
                            </g>
                          </svg>
                        </button>
                      )}
                      <span>DE: {b.german}</span>
                    </div>
                  )}
                  {b.english && (
                    <p className="text-sm px-8 text-slate-700 dark:text-slate-200">
                      EN: {b.english}
                    </p>
                  )}
                </div>
              </div>
            );
          case "multipleChoice":
            return (
              <div
                key={i}
                className="not-prose my-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
              >
                <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                  {b.question || "Question"}
                </h4>
                <div className="space-y-2">
                  {(b.options || []).map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={`mc-${i}`}
                        checked={selectedAnswers[i] === optIdx}
                        onChange={() =>
                          setSelectedAnswers({ ...selectedAnswers, [i]: optIdx })
                        }
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-slate-900 dark:text-slate-200">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedAnswers[i] !== undefined && b.explanation && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-100">
                      {b.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          case "fillInTheBlank":
            const blanks = (b.text || "").split("___");
            const answers = blankAnswers[i] || Array(blanks.length - 1).fill("");
            const isSubmitted = blankSubmitted[i];
            const results = blankResults[i] || [];

            const handleWordClick = (word: string) => {
              const blanksCount = Math.max(blanks.length - 1, 0);
              const current = blankAnswers[i] || Array(blanksCount).fill("");
              const targetIdx = current.findIndex((val) => !val);
              if (targetIdx === -1) return; // no empty slot
              const newAnswers = [...current];
              newAnswers[targetIdx] = word;
              setBlankAnswers({ ...blankAnswers, [i]: newAnswers });
            };
            return (
              <div
                key={i}
                className="not-prose my-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
              >
{b.wordOptions && b.wordOptions.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Drag words or type answers:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {b.wordOptions.map((word, wordIdx) => (
                        <div
                          key={wordIdx}
                          draggable
                          onDragStart={() => setDraggedWord(word)}
                          onDragEnd={() => setDraggedWord(null)}
                          onClick={() => handleWordClick(word)}
                          className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-sm font-medium cursor-move hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-base text-slate-900 dark:text-white leading-relaxed mb-4 whitespace-pre-wrap">
                  {blanks.map((segment, idx) => (
                    <span key={idx}>
                      {segment}
                      {idx < blanks.length - 1 && (
                        <input
                          type="text"
                          value={answers[idx] || ""}
                          onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[idx] = e.target.value;
                            setBlankAnswers({ ...blankAnswers, [i]: newAnswers });
                          }}
                          onClick={() => {
                            if (isSubmitted) return;
                            if (!answers[idx]) return;
                            const newAnswers = [...answers];
                            newAnswers[idx] = "";
                            setBlankAnswers({ ...blankAnswers, [i]: newAnswers });
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const word = draggedWord;
                            if (word) {
                              const newAnswers = [...answers];
                              newAnswers[idx] = word;
                              setBlankAnswers({
                                ...blankAnswers,
                                [i]: newAnswers,
                              });
                              setDraggedWord(null);
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          className={`inline-block w-24 mx-1 px-2 py-1 border-b-2 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors ${
                            isSubmitted
                              ? results[idx]
                                ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                                : "border-red-500 bg-red-50 dark:bg-red-900/30"
                              : "border-primary focus:border-blue-600"
                          }`}
                        />
                      )}
                    </span>
                  ))}
                </div>



                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const blanksCount = Math.max(blanks.length - 1, 0);
                      const givenAnswers = blankAnswers[i] || Array(blanksCount).fill("");
                      const targetAnswers = b.answers || [];
                      const evaluation = Array.from({ length: blanksCount }, (_, idx) => {
                        return givenAnswers[idx] === (targetAnswers[idx] ?? "");
                      });
                      setBlankResults({ ...blankResults, [i]: evaluation });
                      setBlankSubmitted({ ...blankSubmitted, [i]: true });
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Check answers
                  </button>

                  {isSubmitted && (
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {results.filter(Boolean).length} / {Math.max(blanks.length - 1, 0)} correct
                    </span>
                  )}
                </div>

                
              </div>
            );
          case "matchingPairs":
            const connections = matchPairConnections[i] || {};
            const mpResults = matchPairResults[i] || [];
            const selectedLeft = matchPairSelected[i] ?? null;
            const allCorrect = (b.pairs || []).every((_, idx) => mpResults[idx] === true);
            const rightOrder = matchPairShuffled[i] || Array.from({ length: (b.pairs || []).length }, (_, idx) => idx);
            
            const handleLeftClick = (leftIdx: number) => {
              if (mpResults[leftIdx]) return; // Already correct
              setMatchPairSelected({ ...matchPairSelected, [i]: selectedLeft === leftIdx ? null : leftIdx });
            };
            
            const handleMatchClick = (leftIdx: number, rightOriginalIdx: number) => {
              if (mpResults[leftIdx]) return; // Already correct, don't allow changes
              
              const newConnections = { ...connections };
              
              // Check if this match is correct
              const isCorrect = leftIdx === rightOriginalIdx;
              
              if (isCorrect) {
                // Mark as correct
                newConnections[leftIdx] = rightOriginalIdx;
                const newResults = [...mpResults];
                newResults[leftIdx] = true;
                setMatchPairResults({ ...matchPairResults, [i]: newResults });
                setMatchPairConnections({ ...matchPairConnections, [i]: newConnections });
                setMatchPairSelected({ ...matchPairSelected, [i]: null });
              } else {
                // Show incorrect feedback briefly then reset
                newConnections[leftIdx] = rightOriginalIdx;
                setMatchPairConnections({ ...matchPairConnections, [i]: newConnections });
                
                // Flash red for 800ms then remove
                setTimeout(() => {
                  setMatchPairConnections((prev) => {
                    const updated = { ...prev };
                    const current = updated[i] || {};
                    delete current[leftIdx];
                    updated[i] = current;
                    return updated;
                  });
                }, 800);
                setMatchPairSelected({ ...matchPairSelected, [i]: null });
              }
            };

            return (
              <div
                key={i}
                className="not-prose my-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
              >
                {b.title && (
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                    {b.title}
                  </h4>
                )}
                <div className="flex gap-8">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                      Left
                    </p>
                    <div className="space-y-2">
                      {(b.pairs || []).map((pair, leftIdx) => (
                        <div key={leftIdx}>
                          <button
                            onClick={() => handleLeftClick(leftIdx)}
                            className={`w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                              mpResults[leftIdx]
                                ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border border-green-300 dark:border-green-700 cursor-default"
                                : selectedLeft === leftIdx
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 border-2 border-yellow-400 dark:border-yellow-600 cursor-pointer ring-2 ring-yellow-300 dark:ring-yellow-700"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer"
                            }`}
                          >
                            {pair.left}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                      Right
                    </p>
                    <div className="space-y-2">
                      {rightOrder.map((originalIdx) => {
                        const pair = (b.pairs || [])[originalIdx];
                        const connectedLeft = Object.entries(connections).find(
                          ([, v]) => v === originalIdx
                        )?.[0];
                        const isConnected = connectedLeft !== undefined;
                        const leftIdxNum = connectedLeft ? parseInt(connectedLeft) : -1;
                        const isCorrect = mpResults[leftIdxNum];
                        const isIncorrect = isConnected && !isCorrect;

                        return (
                          <button
                            key={originalIdx}
                            onClick={() => {
                              if (selectedLeft !== null && selectedLeft !== undefined) {
                                handleMatchClick(selectedLeft, originalIdx);
                              }
                            }}
                            disabled={selectedLeft === null || selectedLeft === undefined}
                            className={`w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                              isCorrect
                                ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border border-green-300 dark:border-green-700 cursor-default"
                                : isIncorrect
                                ? "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 border border-red-300 dark:border-red-700 cursor-pointer"
                                : isConnected
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700 cursor-pointer"
                                : selectedLeft === null || selectedLeft === undefined
                                ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 cursor-not-allowed opacity-50"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer"
                            }`}
                          >
                            {pair.right}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {!allCorrect && (
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    {mpResults.filter(Boolean).length} / {(b.pairs || []).length} pairs matched correctly
                  </div>
                )}

                {allCorrect && (
                  <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      ✓ Perfect! All pairs matched correctly!
                    </p>
                  </div>
                )}
              </div>
            );
          case "divider":
            return (
              <hr key={i} className="my-6 border-t-2 border-slate-300 dark:border-slate-700" />
            );
          case "vocabulary":
            return (
              <div key={i} className="not-prose my-6">
                {b.title && (
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    {b.title}
                  </h4>
                )}
                {b.vocabIds && b.vocabIds.length > 0 ? (
                  <div className="space-y-3">
                    {b.vocabIds.map((vocabId) => {
                      const vocab = vocabularies[vocabId];
                      if (!vocab) return null;

                      return (
                        <div
                          key={vocabId}
                          className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-900 dark:text-white text-base">
                              {vocab.term}
                            </h5>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {vocab.definition}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No vocabularies in this block.
                  </p>
                )}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

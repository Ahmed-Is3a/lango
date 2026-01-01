'use client';

export type BlockType = 'title' | 'header' | 'subheader' | 'paragraph' | 'table' | 'audio' | 'youtube' | 'image' | 'vocabulary' | 'example' | 'multipleChoice' | 'fillInTheBlank' | 'matchingPairs' | 'divider';

export type TextBlock = {
  type: 'title' | 'header' | 'subheader' | 'paragraph';
  text: string;
  translation?: string;
  items?: string[];
};

export type TableBlock = {
  type: 'table';
  title?: string;
  headers: string[];
  rows: string[][];
};

export type AudioBlock = {
  type: 'audio';
  src: string;
  caption?: string;
};

export type YouTubeBlock = {
  type: 'youtube';
  videoId: string;
  caption?: string;
};

export type ImageBlock = {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
};

export type VocabularyBlock = {
  type: 'vocabulary';
  title?: string;
  vocabIds: number[];
};

export type ExampleBlock = {
  type: 'example';
  german: string;
  english: string;
  pronunciationAudio?: string;
};

export type MultipleChoiceBlock = {
  type: 'multipleChoice';
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
};

export type FillInTheBlankBlock = {
  type: 'fillInTheBlank';
  text: string;
  answers: string[];
  wordOptions?: string[];
  hints?: string[];
};

export type MatchingPairBlock = {
  type: 'matchingPairs';
  title?: string;
  pairs: Array<{ left: string; right: string }>;
};

export type DividerBlock = {
  type: 'divider';
};

export type Block = TextBlock | TableBlock | AudioBlock | YouTubeBlock | ImageBlock | VocabularyBlock | ExampleBlock | MultipleChoiceBlock | FillInTheBlankBlock | MatchingPairBlock | DividerBlock;

export const emptyBlock = (type: BlockType): Block => {
  switch (type) {
    case 'title':
    case 'header':
    case 'subheader':
      return { type, text: '' };
    case 'paragraph':
      return { type, text: '', items: [] };
    case 'table':
      return { type, title: '', headers: ['Col 1', 'Col 2'], rows: [['', '']] };
    case 'audio':
      return { type, src: '', caption: '' };
    case 'youtube':
      return { type, videoId: '', caption: '' };
    case 'image':
      return { type, src: '', alt: '', caption: '' };
    case 'vocabulary':
      return { type, title: '', vocabIds: [] };
    case 'example':
      return { type, german: '', english: '', pronunciationAudio: '' };
    case 'multipleChoice':
      return { type, question: '', options: ['Option 1', 'Option 2', 'Option 3'], correctAnswer: 0, explanation: '' };
    case 'fillInTheBlank':
      return { type, text: 'The ___ sat on the ___', answers: ['', ''], wordOptions: [], hints: [] };
    case 'matchingPairs':
      return { type, title: 'Match the pairs', pairs: [{ left: '', right: '' }] };
    case 'divider':
      return { type };
  }
};

export const blockIcons: Record<BlockType, string> = {
  title: '📝',
  header: '📋',
  subheader: '📄',
  paragraph: '📃',
  table: '📊',
  audio: '🎵',
  youtube: '▶️',
  image: '🖼️',
  vocabulary: '📚',
  example: '💬',
  multipleChoice: '✅',
  fillInTheBlank: '✏️',
  matchingPairs: '🔗',
  divider: '➖',
};

export const blockLabels: Record<BlockType, string> = {
  title: 'Title',
  header: 'Header',
  subheader: 'Subheader',
  paragraph: 'Paragraph',
  table: 'Table',
  audio: 'Audio',
  youtube: 'YouTube',
  image: 'Image',
  vocabulary: 'Vocabulary',
  example: 'Example',
  multipleChoice: 'Multiple Choice',
  fillInTheBlank: 'Fill in the Blank',
  matchingPairs: 'Matching Pairs',
  divider: 'Divider',
};

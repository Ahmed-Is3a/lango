'use client';

export type BlockType = 'title' | 'header' | 'subheader' | 'paragraph' | 'table' | 'audio' | 'youtube';

export type TextBlock = {
  type: 'title' | 'header' | 'subheader' | 'paragraph';
  text: string;
  translation?: string;
};

export type TableBlock = {
  type: 'table';
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

export type Block = TextBlock | TableBlock | AudioBlock | YouTubeBlock;

export const emptyBlock = (type: BlockType): Block => {
  switch (type) {
    case 'title':
    case 'header':
    case 'subheader':
    case 'paragraph':
      return { type, text: '' };
    case 'table':
      return { type, headers: ['Col 1', 'Col 2'], rows: [['', '']] };
    case 'audio':
      return { type, src: '', caption: '' };
    case 'youtube':
      return { type, videoId: '', caption: '' };
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
};

export const blockLabels: Record<BlockType, string> = {
  title: 'Title',
  header: 'Header',
  subheader: 'Subheader',
  paragraph: 'Paragraph',
  table: 'Table',
  audio: 'Audio',
  youtube: 'YouTube',
};

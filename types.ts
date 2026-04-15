import React from 'react';

export interface Project {
  title: string;
  description: string;
  tagline?: string;
  tags?: string[];
  youtube: string;
  github?: string;
  demo?: string;
  linked_paper: string;
  images: string[];
}

export interface Publication {
  year: number;
  title: string;
  authors: string;
  journal: string;
  type: string;
  doi: string;
  open_access: boolean;
}

export interface Music {
  title: string;
  role: string;
  spotifyEmbedUrl: string;
  description: string;
}

export interface Scholar {
  title: string;
}

export interface ThesisPaper {
  number: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  pdfFile: string;
  description?: string;
}

export interface Thesis {
  title: string;
  year: number;
  university: string;
  abstract: string;
  pdfFile: string;
  papers: ThesisPaper[];
}

export interface CVEntry {
  type: 'experience' | 'education';
  role: string;
  org: string;
  period: string;
  location?: string;
  bullets?: string[];
  details?: string;
}

export type ItemType = 'project' | 'publication' | 'music' | 'scholar' | 'thesis' | 'paper';

export interface PortfolioItem {
  id: string;
  index: number;
  type: ItemType;
  data: Project | Publication | Music | Scholar | Thesis | ThesisPaper;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  isCorner?: boolean;
}

export interface SelectionState {
  selectedId: string | null;
  hoveredId: string | null;
}

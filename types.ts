import React from 'react';
import { ThreeElements } from '@react-three/fiber';

export interface Project {
  title: string;
  description: string;
  youtube: string;
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

export type ItemType = 'project' | 'publication' | 'music';

export interface PortfolioItem {
  id: string;
  type: ItemType;
  data: Project | Publication | Music;
  position: [number, number, number];
  scale: [number, number, number];
}

export interface SelectionState {
  selectedId: string | null;
  hoveredId: string | null;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
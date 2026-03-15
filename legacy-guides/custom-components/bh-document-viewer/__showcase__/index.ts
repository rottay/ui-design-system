/**
 * bh-document-viewer - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { DocumentAnnotation } from '../core';

export const MOCK_ANNOTATIONS: DocumentAnnotation[] = [
  { id: 'ann-1', page: 1, x: 30, y: 20, text: 'Strong leadership experience', color: undefined },
  { id: 'ann-2', page: 1, x: 60, y: 45, text: 'Check references for this claim' },
  { id: 'ann-3', page: 2, x: 40, y: 30, text: 'Relevant project experience' },
];

/* Server-readable case list: a 'use client' module's exports reach a server
   component as client references, so the route cannot read them as an array. */

export type CommercialCase = string;

export const COMMERCIAL_CASES: CommercialCase[] = [
  'ascii-frame',
  'crop-marks',
  'invert-section',
  'section-frame',
  'texture-backdrop',
  'ascii-diagram',
  'terminal-block',
  'tree-view',
  'typewriter',
  'mono-stat',
  'product-window',
];

/* Server-readable case list: a 'use client' module's exports reach a server
   component as client references, so the route cannot read them as an array. */

export type MonochromeCase = string;

export const MONOCHROME_CASES: MonochromeCase[] = [
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

/* Server-readable case list: a 'use client' module's exports reach a server
   component as client references, so the route cannot read them as an array. */

export type CompositionCase = string;

export const COMPOSITION_CASES: CompositionCase[] = [
  'page-shell',
  'header',
  'sidebar',
  'workspace-shell',
];

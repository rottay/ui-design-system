'use client';

/**
 * @fileoverview GridView pattern - Rottay Design System
 * @description Responsive CSS grid pattern for card-based layouts with
 * optional selection, pagination, loading skeletons, and empty state.
 *
 * @remarks
 * This pattern packages a common card-grid composition: repeated cards in
 * a responsive CSS grid with selection, pagination, and loading states.
 * Engine-free -- uses CSS Grid directly with DS CSS variables for theming.
 */

export type { GridViewProps } from './contracts';
export { resolveGridRowKey } from './runtime/item-identity';
export { PatternGridView } from './presentation/grid';

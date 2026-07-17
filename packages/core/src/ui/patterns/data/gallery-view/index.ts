'use client';

/**
 * @fileoverview GalleryView pattern -- Rottay Design System
 * @description Image/media-focused CSS Grid pattern with hover effects,
 * selection checkboxes, custom card rendering, and pagination support.
 *
 * @remarks
 * Wave 2 render-mode pattern that complements PatternDataTable with a visual,
 * image-first layout. Engine-free: composes DS primitives directly.
 */

export type { GalleryViewProps } from './contracts';
export { resolveGalleryKey } from './runtime/item-identity';
export { PatternGalleryView } from './presentation/gallery';

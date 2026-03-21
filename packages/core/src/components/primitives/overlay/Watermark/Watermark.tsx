'use client';

/**
 * @fileoverview Watermark - canvas-based repeating text/image overlay.
 * Renders a non-interactive pattern over children for branding or confidentiality.
 * Supports retina displays, custom rotation/gap/offset, and font configuration.
 * Multi-engine: Classic (Ant Design), Modern (Tailwind), Rustic (Vanilla canvas).
 *
 * @example
 * ```tsx
 * <Watermark content="CONFIDENTIAL" rotate={-22} font={{ fontSize: 18 }}>
 *   <div>Protected document content</div>
 * </Watermark>
 * ```
 *
 * @module Watermark
 * @category Overlay
 */
import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { WatermarkProps } from './Watermark.types';

export {
  type WatermarkProps,
  type WatermarkFont,
  WATERMARK_DEFAULTS,
} from './Watermark.types';

/** Watermark component with multi-engine support. No compound sub-components. */
export const Watermark = createEngineComponent<WatermarkProps>('Watermark', {
  classic: () => import('./engines/classic'),  // Ant Design Watermark
  modern: () => import('./engines/modern'),     // Tailwind + canvas
  rustic: () => import('./engines/rustic'),      // Vanilla canvas
});

export default Watermark;

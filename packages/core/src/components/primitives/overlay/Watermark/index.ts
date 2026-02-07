'use client';

/**
 * @fileoverview Watermark Component - Rottay Design System
 * @description A canvas-based watermark overlay component that renders repeating text or image
 * patterns over content. Supports customizable rotation, gap, offset, font settings, and
 * retina display support for crisp rendering on high-DPI screens.
 *
 * @remarks
 * The Watermark component provides content protection and branding overlays for
 * sensitive documents, previews, and protected content areas. It's commonly used for:
 * - Document confidentiality markers
 * - Brand watermarking on images and content
 * - Draft/Preview status indicators
 * - Copyright protection overlays
 * - User identification watermarks
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (Tailwind), Rustic (Vanilla)
 * - **Canvas rendering**: High-quality pattern generation with device pixel ratio support
 * - **Text & image**: Supports text content (including multi-line) or image URLs
 * - **Customizable positioning**: Rotation, gap, and offset controls
 * - **Font configuration**: Color, size, weight, family, and style options
 * - **Pointer-events passthrough**: Watermark doesn't interfere with user interaction
 *
 * @example Basic text watermark
 * ```tsx
 * import { Watermark } from '@rottay/design-system';
 *
 * <Watermark content="Confidential">
 *   <div>Protected content</div>
 * </Watermark>
 * ```
 *
 * @example Multi-line text watermark
 * ```tsx
 * <Watermark content={['Company Name', 'Confidential']}>
 *   <div>Protected content</div>
 * </Watermark>
 * ```
 *
 * @example Image watermark with logo
 * ```tsx
 * <Watermark image="/logo.png" width={100} height={50}>
 *   <div>Branded content</div>
 * </Watermark>
 * ```
 *
 * @example Custom styled watermark
 * ```tsx
 * <Watermark
 *   content="DRAFT"
 *   rotate={-30}
 *   gap={[150, 150]}
 *   font={{ color: 'rgba(255,0,0,0.1)', fontSize: 24, fontWeight: 'bold' }}
 * >
 *   <div>Draft document</div>
 * </Watermark>
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <Watermark engine="classic" content="Protected">
 *   <div>Content</div>
 * </Watermark>
 *
 * // Modern engine (Tailwind CSS)
 * <Watermark engine="modern" content="Draft" zIndex={50}>
 *   <div>Content</div>
 * </Watermark>
 *
 * // Rustic engine (Pure HTML/CSS)
 * <Watermark engine="rustic" content="Confidential" offset={[20, 20]}>
 *   <div>Content</div>
 * </Watermark>
 * ```
 *
 * @see {@link WatermarkProps} for available props
 * @see {@link WatermarkFont} for font configuration options
 * @module Watermark
 * @category Overlay
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { WatermarkProps } from './types';

export {
  type WatermarkProps,
  type WatermarkFont,
  WATERMARK_DEFAULTS,
} from './types';

/**
 * Watermark component with multi-engine support.
 * Renders a repeating watermark pattern over its children using canvas rendering.
 *
 * @param props - The watermark configuration props
 * @param props.content - Text content (string or array for multiple lines)
 * @param props.image - Image URL (takes precedence over content)
 * @param props.width - Width of each watermark unit
 * @param props.height - Height of each watermark unit
 * @param props.rotate - Rotation angle in degrees (default: -22)
 * @param props.gap - Gap between watermarks [horizontal, vertical]
 * @param props.offset - Offset from top-left [x, y]
 * @param props.zIndex - Z-index of the watermark layer
 * @param props.font - Font configuration object
 * @param props.children - Content to be watermarked
 * @returns The watermarked content container
 */
export const Watermark = createEngineComponent<WatermarkProps>('Watermark', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default Watermark;

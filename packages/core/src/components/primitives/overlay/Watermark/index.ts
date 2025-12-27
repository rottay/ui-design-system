/**
 * Watermark Component
 *
 * A canvas-based watermark overlay component that renders repeating text or image
 * patterns over content. Supports customizable rotation, gap, offset, and font settings.
 *
 * @component
 * @example
 * ```tsx
 * // Text watermark
 * <Watermark content="Confidential">
 *   <div>Protected content</div>
 * </Watermark>
 *
 * // Multi-line text watermark
 * <Watermark content={['Company Name', 'Confidential']}>
 *   <div>Protected content</div>
 * </Watermark>
 *
 * // Image watermark
 * <Watermark image="/logo.png" width={100} height={50}>
 *   <div>Branded content</div>
 * </Watermark>
 *
 * // Custom styling
 * <Watermark
 *   content="Draft"
 *   rotate={-30}
 *   gap={[150, 150]}
 *   font={{ color: 'rgba(255,0,0,0.1)', fontSize: 24 }}
 * >
 *   <div>Draft document</div>
 * </Watermark>
 * ```
 *
 * @see {@link WatermarkProps} for available props
 * @see {@link WatermarkFont} for font configuration options
 */
import { createEngineComponent } from '../../../../system/engines/factory';
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
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Watermark;

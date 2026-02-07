/**
 * @fileoverview Upload Engine Exports - Rottay Design System
 * @description Barrel exports for all Upload engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Upload with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS upload
 *
 * All engines implement:
 * - File selection via click or drag-and-drop
 * - Multiple file upload support
 * - File list display with remove action
 * - Before upload validation hook
 * - Progress tracking (engine-specific)
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { ClassicUpload, ModernDragger } from './engines';
 *
 * // Component automatically selects engine
 * <Upload engine="modern" action="/api/upload" />
 * ```
 *
 * @see {@link Upload} - Main component
 * @see {@link UploadProps} - Component props
 * @module Upload/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { Upload as ClassicUpload, Dragger as ClassicDragger } from './classic';
export { Upload as ModernUpload, Dragger as ModernDragger } from './modern';
export { Upload as RusticUpload, Dragger as RusticDragger } from './rustic';

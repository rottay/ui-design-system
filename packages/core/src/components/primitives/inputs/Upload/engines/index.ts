/**
 * @fileoverview Upload Engine Exports - Rottay Design System
 * @description Barrel exports for all Upload engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Upload with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS upload
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
 * import { TitanUpload, HermesDragger } from './engines';
 *
 * // Component automatically selects engine
 * <Upload engine="hermes" action="/api/upload" />
 * ```
 *
 * @see {@link Upload} - Main component
 * @see {@link UploadProps} - Component props
 * @module Upload/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { Upload as TitanUpload, Dragger as TitanDragger } from './titan';
export { Upload as HermesUpload, Dragger as HermesDragger } from './hermes';
export { Upload as ApolloUpload, Dragger as ApolloDragger } from './apollo';

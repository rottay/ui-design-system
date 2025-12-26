/**
 * @fileoverview Badge Engine Implementations
 * @description Exports all engine-specific implementations of the Badge component.
 * Each engine provides the same functionality with different underlying UI libraries.
 * @module components/primitives/display/Badge/engines
 */

/** Titan engine - Ant Design implementation */
export { default as titan } from './titan';

/** Hermes engine - DaisyUI/Tailwind implementation */
export { default as hermes } from './hermes';

/** Apollo engine - Pure HTML/CSS implementation */
export { default as apollo } from './apollo';

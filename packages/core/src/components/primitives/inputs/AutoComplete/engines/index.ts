/**
 * @fileoverview AutoComplete Engine Exports - Rottay Design System
 * @description Barrel exports for all AutoComplete engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design AutoComplete with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS autocomplete
 *
 * All engines implement:
 * - Type-ahead suggestions with dropdown
 * - Custom and built-in filtering
 * - Async search callback support
 * - Keyboard navigation
 * - Custom option rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <AutoComplete engine="modern" options={options} onSearch={handleSearch} />
 * ```
 *
 * @see {@link AutoComplete} - Main component with engine switching
 * @module AutoComplete/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';

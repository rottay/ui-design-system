/**
 * @fileoverview AutoComplete Engine Exports - Rottay Design System
 * @description Barrel exports for all AutoComplete engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design AutoComplete with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS autocomplete
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <AutoComplete engine="hermes" options={options} onSearch={handleSearch} />
 * ```
 *
 * @see {@link AutoComplete} - Main component with engine switching
 * @module AutoComplete/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';

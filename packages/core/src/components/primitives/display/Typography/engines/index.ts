/**
 * @fileoverview Typography Engine Implementations - Rottay Design System
 * @description Engine-specific typography implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Typography engine implementations.
 * Each engine exports Heading, Text, and Paragraph components.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Typography with rich text features
 * - **Modern**: DaisyUI/Tailwind utility classes
 * - **Rustic**: Pure CSS with CSS variables
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Heading (h1-h6) | ✅ | ✅ | ✅ |
 * | Text decorations | ✅ | ✅ | ✅ |
 * | Line clamping | ✅ | ✅ | ✅ |
 * | Truncation | ✅ | ✅ | ✅ |
 * | Colors | ✅ | ✅ | ✅ |
 * | Monospace | ✅ | ✅ | ✅ |
 * | Copy to clipboard | ✅ | ❌ | ❌ |
 * | Editable | ✅ | ❌ | ❌ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for rich text features
 * <Typography.Heading engine="classic" copyable />
 *
 * // Use Modern for Tailwind styling
 * <Typography.Text engine="modern" color="primary" />
 *
 * // Use Rustic for zero dependencies
 * <Typography.Paragraph engine="rustic" lineClamp={3} />
 * ```
 *
 * @see {@link ClassicHeading} for Ant Design implementation
 * @see {@link ModernHeading} for DaisyUI implementation
 * @see {@link RusticHeading} for vanilla implementation
 * @module Typography/engines
 * @category Display
 * @package @rottay/design-system
 */

// Classic (Ant Design) engine exports
export {
  default as classic,
  ClassicHeading,
  ClassicText,
  ClassicParagraph,
} from './classic';

// Modern (DaisyUI/Tailwind) engine exports
export {
  default as modern,
  ModernHeading,
  ModernText,
  ModernParagraph,
} from './modern';

// Rustic (Vanilla/CSS) engine exports
export {
  default as rustic,
  RusticHeading,
  RusticText,
  RusticParagraph,
} from './rustic';

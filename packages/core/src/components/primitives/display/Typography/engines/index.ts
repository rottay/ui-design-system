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
 * - **Titan**: Ant Design Typography with rich text features
 * - **Hermes**: DaisyUI/Tailwind utility classes
 * - **Apollo**: Pure CSS with CSS variables
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Titan for rich text features
 * <Typography.Heading engine="titan" copyable />
 *
 * // Use Hermes for Tailwind styling
 * <Typography.Text engine="hermes" color="primary" />
 *
 * // Use Apollo for zero dependencies
 * <Typography.Paragraph engine="apollo" lineClamp={3} />
 * ```
 *
 * @see {@link TitanHeading} for Ant Design implementation
 * @see {@link HermesHeading} for DaisyUI implementation
 * @see {@link ApolloHeading} for vanilla implementation
 * @module Typography/engines
 * @category Display
 * @package @rottay/design-system
 */

// Titan (Ant Design) engine exports
export {
  default as titan,
  TitanHeading,
  TitanText,
  TitanParagraph,
} from './titan';

// Hermes (DaisyUI/Tailwind) engine exports
export {
  default as hermes,
  HermesHeading,
  HermesText,
  HermesParagraph,
} from './hermes';

// Apollo (Vanilla/CSS) engine exports
export {
  default as apollo,
  ApolloHeading,
  ApolloText,
  ApolloParagraph,
} from './apollo';

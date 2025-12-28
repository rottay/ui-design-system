/**
 * @fileoverview Tag Compound Components - Rottay Design System
 * @description Compound components for enhanced Tag functionality.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports compound components that extend Tag functionality:
 *
 * **TagGroup:**
 * Container component for grouping multiple tags with consistent
 * spacing and optional wrapping behavior.
 *
 * @example Tag Group
 * ```tsx
 * <Tag.Group gap="md" wrap>
 *   <Tag variant="primary">React</Tag>
 *   <Tag variant="secondary">TypeScript</Tag>
 *   <Tag variant="success">Vite</Tag>
 * </Tag.Group>
 * ```
 *
 * @see {@link Tag} for the main component
 * @module TagCompound
 * @category Display
 * @package @rottay/design-system
 */

export { TagGroup } from './Group';
export type { TagGroupProps } from './Group';

/**
 * @fileoverview List Types - Rottay Design System
 * @description Type definitions for the List component and its compound components.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports type definitions from the centralized types directory
 * for the List component and its compound components.
 *
 * **Exported Types:**
 * - `ListProps` - Main list component properties
 * - `ListItemProps` - List item container properties
 * - `ListItemMetaProps` - Item metadata properties
 * - `ListSize` - Size variants
 * - `ListItemLayout` - Layout direction
 * - `ListGridConfig` - Grid layout configuration
 * - `ListPaginationConfig` - Pagination settings
 * - `ListLocale` - Localization configuration
 *
 * **Exported Constants:**
 * - `LIST_DEFAULTS` - Default prop values
 * - `LIST_SIZE_MAP` - Size to CSS value mappings
 *
 * @example Type Usage
 * ```tsx
 * import type { ListProps, ListItemProps } from '@rottay/design-system';
 *
 * const listProps: ListProps = {
 *   bordered: true,
 *   size: 'default',
 *   split: true,
 * };
 *
 * const itemProps: ListItemProps = {
 *   actions: [<Button>Edit</Button>],
 * };
 * ```
 *
 * @see {@link List} for component implementation
 * @module List/types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  ListSize,
  ListItemLayout,
  ListGridConfig,
  ListPaginationConfig,
  ListLocale,
  ListItemMetaProps,
  ListItemProps,
  ListProps,
} from '../../../../../types/primitives/display/List';

export { LIST_DEFAULTS, LIST_SIZE_MAP } from '../../../../../types/primitives/display/List';

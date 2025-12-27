/**
 * List - Type Definitions
 *
 * Re-exports type definitions from the centralized types module.
 * All List-related types (ListProps, ListItemProps, ListItemMetaProps)
 * and constants (LIST_DEFAULTS, LIST_SIZE_MAP) are defined in the
 * centralized types location for consistency.
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

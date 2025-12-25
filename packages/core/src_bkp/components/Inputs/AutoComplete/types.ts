/**
 * AutoComplete Component Types
 *
 * Re-exports unified autocomplete types from /types/components/autocomplete
 */

export type {
  AutoCompleteOption,
  AutoCompleteOptionGroup,
  AutoCompleteSize,
  AutoCompleteStatus,
  AutoCompletePlacement,
  AutoCompleteBaseProps,
  AutoCompleteProps,
} from '../../../types/components/autocomplete';

export {
  isOptionGroup,
  isStringOption,
  normalizeOptions,
  flattenOptions,
  defaultFilterOption,
} from '../../../types/components/autocomplete';

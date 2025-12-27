/**
 * AutoComplete - Engine Router
 *
 * This module exports the AutoComplete component with multi-engine support.
 * AutoComplete provides input with dropdown suggestions for type-ahead search.
 *
 * @module AutoComplete
 * @example
 * ```tsx
 * import { AutoComplete } from '@rottay/design-system';
 *
 * // Basic usage
 * <AutoComplete
 *   options={[
 *     { value: 'React' },
 *     { value: 'Vue' },
 *     { value: 'Angular' },
 *   ]}
 *   placeholder="Search frameworks"
 * />
 *
 * // With search callback
 * <AutoComplete
 *   options={options}
 *   onSearch={(text) => fetchSuggestions(text)}
 *   onChange={(value) => setValue(value)}
 * />
 *
 * // With custom filter
 * <AutoComplete
 *   options={options}
 *   filterOption={(input, option) =>
 *     option.value.toLowerCase().includes(input.toLowerCase())
 *   }
 * />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { AutoCompleteProps } from './types';

export {
  type AutoCompleteProps,
  type AutoCompleteOption,
  type AutoCompleteSize,
  AUTOCOMPLETE_DEFAULTS,
} from './types';

export const AutoComplete = createEngineComponent<AutoCompleteProps>('AutoComplete', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default AutoComplete;

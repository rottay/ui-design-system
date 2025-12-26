/**
 * AutoComplete - Engine Router
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

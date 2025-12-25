/**
 * SearchBar - All Presets
 */

import type { SearchBarPreset } from '../core';
import { BasicSearchBar } from './basic';
import { SuggestionsSearchBar } from './suggestions';
import { CommandSearchBar } from './command';

export { BasicSearchBar } from './basic';
export { SuggestionsSearchBar } from './suggestions';
export { CommandSearchBar } from './command';

export const SEARCH_BAR_PRESETS: Record<SearchBarPreset, React.ComponentType<any>> = {
  basic: BasicSearchBar,
  suggestions: SuggestionsSearchBar,
  command: CommandSearchBar,
};

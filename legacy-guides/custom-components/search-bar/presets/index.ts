/**
 * SearchBar - All Presets
 */

import type { SearchBarPreset, SearchBarProps } from '../core';
import type { ComponentType } from 'react';
import { BasicSearchBar } from './basic';
import { SuggestionsSearchBar } from './suggestions';
import { CommandSearchBar } from './command';

export { BasicSearchBar } from './basic';
export { SuggestionsSearchBar } from './suggestions';
export { CommandSearchBar } from './command';

export const SEARCH_BAR_PRESETS: Record<SearchBarPreset, ComponentType<SearchBarProps>> = {
  basic: BasicSearchBar,
  suggestions: SuggestionsSearchBar,
  command: CommandSearchBar,
};

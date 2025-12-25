/**
 * SearchBar - Main Export
 * Automatically selects preset based on props
 */

// import React from 'react';
import type { SearchBarProps } from './core';
import { SEARCH_BAR_DEFAULTS } from './core';
import { SEARCH_BAR_PRESETS } from './presets';

export { type SearchBarProps, type SearchBarPreset, type SearchSuggestion, SEARCH_BAR_DEFAULTS } from './core';
export * from './presets';

/**
 * SearchBar component
 * Renders the appropriate preset based on the preset prop
 */
export function SearchBar(props: SearchBarProps): React.ReactElement {
  const preset = props.preset ?? SEARCH_BAR_DEFAULTS.preset ?? 'basic';
  const PresetComponent = SEARCH_BAR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

SearchBar.displayName = 'SearchBar';

// Also export individual presets as named exports for direct use
export { BasicSearchBar, SuggestionsSearchBar, CommandSearchBar } from './presets';

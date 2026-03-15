/**
 * CommandSearch - Main Export
 */

import type { CommandSearchProps } from './core';
import { COMMAND_SEARCH_DEFAULTS } from './core';
import { COMMAND_SEARCH_PRESETS } from './presets';

export { type CommandSearchProps, type CommandSearchPreset, type SearchResult, type SearchCategory, type QuickAction, COMMAND_SEARCH_DEFAULTS } from './core';
export * from './presets';

export function CommandSearch(props: CommandSearchProps): React.ReactElement {
  const preset = props.preset ?? COMMAND_SEARCH_DEFAULTS.preset ?? 'palette';
  const PresetComponent = COMMAND_SEARCH_PRESETS[preset];
  return <PresetComponent {...props} />;
}

CommandSearch.displayName = 'CommandSearch';

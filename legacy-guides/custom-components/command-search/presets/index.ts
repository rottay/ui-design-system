/**
 * CommandSearch Presets
 */

export { PaletteCommandSearch } from './palette';
export { InlineCommandSearch } from './inline';

import type { CommandSearchPreset } from '../core';
import type { ComponentType } from 'react';
import type { CommandSearchProps } from '../core';
import { PaletteCommandSearch } from './palette';
import { InlineCommandSearch } from './inline';

export const COMMAND_SEARCH_PRESETS: Record<CommandSearchPreset, ComponentType<CommandSearchProps>> = {
  palette: PaletteCommandSearch,
  inline: InlineCommandSearch,
};

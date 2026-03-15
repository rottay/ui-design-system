/**
 * CommandHeader Presets
 */

export { FullCommandHeader } from './full';
export { CompactCommandHeader } from './compact';
export { MinimalCommandHeader } from './minimal';

import type { CommandHeaderPreset } from '../core';
import type { ComponentType } from 'react';
import type { CommandHeaderProps } from '../core';
import { FullCommandHeader } from './full';
import { CompactCommandHeader } from './compact';
import { MinimalCommandHeader } from './minimal';

export const COMMAND_HEADER_PRESETS: Record<CommandHeaderPreset, ComponentType<CommandHeaderProps>> = {
  full: FullCommandHeader,
  compact: CompactCommandHeader,
  minimal: MinimalCommandHeader,
};

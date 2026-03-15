import type { TagInputPreset, TagInputProps } from '../core';
import { StandardPreset } from './standard';
import { CompactPreset } from './compact';

export const PRESETS: Record<
  TagInputPreset,
  React.ComponentType<TagInputProps>
> = {
  standard: StandardPreset,
  compact: CompactPreset,
};

import type { ContextualToolbarPreset, ContextualToolbarProps } from '../core';
import { FloatingPreset } from './floating';
import { AnchoredPreset } from './anchored';

export const PRESETS: Record<
  ContextualToolbarPreset,
  React.ComponentType<ContextualToolbarProps>
> = {
  floating: FloatingPreset,
  anchored: AnchoredPreset,
};

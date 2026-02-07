import type { BlogCardProps, BlogCardPreset } from '../core';
import { HorizontalPreset } from './horizontal';
import { VerticalPreset } from './vertical';
import { MinimalPreset } from './minimal';

export const PRESETS: Record<BlogCardPreset, React.ComponentType<BlogCardProps>> = {
  horizontal: HorizontalPreset,
  vertical: VerticalPreset,
  minimal: MinimalPreset,
};

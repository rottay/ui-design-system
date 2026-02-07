import type { FeatureFlagPanelPreset } from '../core';
import { List } from './list';
import { Detailed } from './detailed';

export const PRESETS: Record<FeatureFlagPanelPreset, React.ComponentType<any>> = {
  'list': List,
  'detailed': Detailed,
};

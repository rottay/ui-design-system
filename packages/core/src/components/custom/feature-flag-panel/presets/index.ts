import type { FeatureFlagPanelPreset, FeatureFlagPanelProps } from '../core';
import type { ComponentType } from 'react';
import { List } from './list';
import { Detailed } from './detailed';

export const PRESETS: Record<FeatureFlagPanelPreset, ComponentType<FeatureFlagPanelProps>> = {
  'list': List,
  'detailed': Detailed,
};

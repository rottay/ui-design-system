import type { DataSummaryBarPreset, DataSummaryBarProps } from '../core';
import type { ComponentType } from 'react';
import { Pills } from './pills';
import { Inline } from './inline';

export const PRESETS: Record<DataSummaryBarPreset, ComponentType<DataSummaryBarProps>> = {
  'pills': Pills,
  'inline': Inline,
};

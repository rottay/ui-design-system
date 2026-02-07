import React from 'react';
import type { SkeletonPatternProps } from './core';
import { SKELETON_PATTERN_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { SkeletonPatternProps, SkeletonPatternPreset } from './core';
export { SKELETON_PATTERN_DEFAULTS } from './core';

export function SkeletonPattern(props: SkeletonPatternProps) {
  const { preset = SKELETON_PATTERN_DEFAULTS.preset!, ...rest } = props;
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown SkeletonPattern preset: ${preset}`);
  }

  return <PresetComponent {...rest} />;
}

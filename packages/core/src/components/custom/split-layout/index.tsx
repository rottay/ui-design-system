import React from 'react';
import type { SplitLayoutProps } from './core';
import { SPLIT_LAYOUT_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { SplitLayoutProps, SplitLayoutPreset } from './core';
export { SPLIT_LAYOUT_DEFAULTS } from './core';

export function SplitLayout(props: SplitLayoutProps): React.ReactElement {
  const preset = props.preset ?? SPLIT_LAYOUT_DEFAULTS.preset ?? 'resizable';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
SplitLayout.displayName = 'SplitLayout';

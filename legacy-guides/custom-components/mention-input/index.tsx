import React from 'react';
import type { MentionInputProps } from './core';
import { MENTION_INPUT_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { MentionInputProps, MentionInputPreset, MentionUser } from './core';
export { MENTION_INPUT_DEFAULTS } from './core';

export function MentionInput(props: MentionInputProps): React.ReactElement {
  const preset = props.preset ?? MENTION_INPUT_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
MentionInput.displayName = 'MentionInput';

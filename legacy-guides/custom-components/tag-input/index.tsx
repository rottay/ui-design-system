import type { TagInputProps } from './core';
import { TAG_INPUT_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { TagInputProps, TagInputPreset, Tag } from './core';
export { TAG_INPUT_DEFAULTS } from './core';

export function TagInput(props: TagInputProps): React.ReactElement {
  const preset = props.preset ?? TAG_INPUT_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

TagInput.displayName = 'TagInput';

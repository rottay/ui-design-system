/**
 * PlUserProfileEditor - Main Export
 * Edit user profile information including personal details, preferences, and avatar
 */

import type { PlUserProfileEditorProps } from './core';
import { PL_USER_PROFILE_EDITOR_DEFAULTS } from './core';
import { PL_USER_PROFILE_EDITOR_PRESETS } from './presets';

export { type PlUserProfileEditorProps, type PlUserProfileEditorPreset, PL_USER_PROFILE_EDITOR_DEFAULTS } from './core';
export * from './presets';

export function PlUserProfileEditor(props: PlUserProfileEditorProps): React.ReactElement {
  const preset = props.preset ?? PL_USER_PROFILE_EDITOR_DEFAULTS.preset ?? 'form';
  const PresetComponent = PL_USER_PROFILE_EDITOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlUserProfileEditor.displayName = 'PlUserProfileEditor';

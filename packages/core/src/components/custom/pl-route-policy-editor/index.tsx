/**
 * PlRoutePolicyEditor - Main Export
 * Configure route access policies with role-based and attribute-based rules
 */

import type { PlRoutePolicyEditorProps } from './core';
import { PL_ROUTE_POLICY_EDITOR_DEFAULTS } from './core';
import { PL_ROUTE_POLICY_EDITOR_PRESETS } from './presets';

export { type PlRoutePolicyEditorProps, type PlRoutePolicyEditorPreset, PL_ROUTE_POLICY_EDITOR_DEFAULTS } from './core';
export * from './presets';

export function PlRoutePolicyEditor(props: PlRoutePolicyEditorProps): React.ReactElement {
  const preset = props.preset ?? PL_ROUTE_POLICY_EDITOR_DEFAULTS.preset ?? 'form';
  const PresetComponent = PL_ROUTE_POLICY_EDITOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlRoutePolicyEditor.displayName = 'PlRoutePolicyEditor';

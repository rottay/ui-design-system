/**
 * BhSprintRetrospective - Main Export
 * Sprint retrospective form for BitHire ATS platform
 */

import type { BhSprintRetrospectiveProps } from './core';
import { BH_SPRINT_RETROSPECTIVE_DEFAULTS } from './core';
import { BH_SPRINT_RETROSPECTIVE_PRESETS } from './presets';

export {
  type BhSprintRetrospectiveProps,
  type BhSprintRetrospectivePreset,
  type RetroItem,
  BH_SPRINT_RETROSPECTIVE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSprintRetrospective component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSprintRetrospective(props: BhSprintRetrospectiveProps): React.ReactElement {
  const preset = props.preset ?? BH_SPRINT_RETROSPECTIVE_DEFAULTS.preset ?? 'form';
  const PresetComponent = BH_SPRINT_RETROSPECTIVE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSprintRetrospective.displayName = 'BhSprintRetrospective';

export { FormBhSprintRetrospective, CompactBhSprintRetrospective } from './presets';

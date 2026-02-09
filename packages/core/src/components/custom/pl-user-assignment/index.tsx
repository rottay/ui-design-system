/**
 * PlUserAssignment - Main Export
 * Assign and manage user-to-company relationships with roles and permissions
 */

import type { PlUserAssignmentProps } from './core';
import { PL_USER_ASSIGNMENT_DEFAULTS } from './core';
import { PL_USER_ASSIGNMENT_PRESETS } from './presets';

export { type PlUserAssignmentProps, type PlUserAssignmentPreset, PL_USER_ASSIGNMENT_DEFAULTS } from './core';
export * from './presets';

export function PlUserAssignment(props: PlUserAssignmentProps): React.ReactElement {
  const preset = props.preset ?? PL_USER_ASSIGNMENT_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_USER_ASSIGNMENT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlUserAssignment.displayName = 'PlUserAssignment';

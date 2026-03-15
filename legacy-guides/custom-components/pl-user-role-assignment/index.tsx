/**
 * PlUserRoleAssignment - Main Export
 * Assign roles to users with effective permission preview and conflict detection
 */

import type { PlUserRoleAssignmentProps } from './core';
import { PL_USER_ROLE_ASSIGNMENT_DEFAULTS } from './core';
import { PL_USER_ROLE_ASSIGNMENT_PRESETS } from './presets';

export { type PlUserRoleAssignmentProps, type PlUserRoleAssignmentPreset, PL_USER_ROLE_ASSIGNMENT_DEFAULTS } from './core';
export * from './presets';

export function PlUserRoleAssignment(props: PlUserRoleAssignmentProps): React.ReactElement {
  const preset = props.preset ?? PL_USER_ROLE_ASSIGNMENT_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_USER_ROLE_ASSIGNMENT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlUserRoleAssignment.displayName = 'PlUserRoleAssignment';

/**
 * PlMenuRoleAssignment - Main Export
 * Assign menu visibility and access based on user roles in a matrix view
 */

import type { PlMenuRoleAssignmentProps } from './core';
import { PL_MENU_ROLE_ASSIGNMENT_DEFAULTS } from './core';
import { PL_MENU_ROLE_ASSIGNMENT_PRESETS } from './presets';

export { type PlMenuRoleAssignmentProps, type PlMenuRoleAssignmentPreset, PL_MENU_ROLE_ASSIGNMENT_DEFAULTS } from './core';
export * from './presets';

export function PlMenuRoleAssignment(props: PlMenuRoleAssignmentProps): React.ReactElement {
  const preset = props.preset ?? PL_MENU_ROLE_ASSIGNMENT_DEFAULTS.preset ?? 'matrix';
  const PresetComponent = PL_MENU_ROLE_ASSIGNMENT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlMenuRoleAssignment.displayName = 'PlMenuRoleAssignment';

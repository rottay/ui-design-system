/**
 * PlUserRoleAssignment - All Presets
 */

export { TablePlUserRoleAssignment } from './table';
export { PanelPlUserRoleAssignment } from './panel';

import type { PlUserRoleAssignmentPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlUserRoleAssignmentProps } from '../core';
import { TablePlUserRoleAssignment } from './table';
import { PanelPlUserRoleAssignment } from './panel';

export const PL_USER_ROLE_ASSIGNMENT_PRESETS: Record<PlUserRoleAssignmentPreset, ComponentType<PlUserRoleAssignmentProps>> = {
  table: TablePlUserRoleAssignment,
  panel: PanelPlUserRoleAssignment,
};

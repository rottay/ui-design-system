/**
 * PlMenuRoleAssignment - All Presets
 */

export { MatrixPlMenuRoleAssignment } from './matrix';
export { ListPlMenuRoleAssignment } from './list';

import type { PlMenuRoleAssignmentPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlMenuRoleAssignmentProps } from '../core';
import { MatrixPlMenuRoleAssignment } from './matrix';
import { ListPlMenuRoleAssignment } from './list';

export const PL_MENU_ROLE_ASSIGNMENT_PRESETS: Record<PlMenuRoleAssignmentPreset, ComponentType<PlMenuRoleAssignmentProps>> = {
  matrix: MatrixPlMenuRoleAssignment,
  list: ListPlMenuRoleAssignment,
};

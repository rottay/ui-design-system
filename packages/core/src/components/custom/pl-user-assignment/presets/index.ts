/**
 * PlUserAssignment - All Presets
 */

export { TablePlUserAssignment } from './table';
export { MatrixPlUserAssignment } from './matrix';

import type { PlUserAssignmentPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlUserAssignmentProps } from '../core';
import { TablePlUserAssignment } from './table';
import { MatrixPlUserAssignment } from './matrix';

export const PL_USER_ASSIGNMENT_PRESETS: Record<PlUserAssignmentPreset, ComponentType<PlUserAssignmentProps>> = {
  table: TablePlUserAssignment,
  matrix: MatrixPlUserAssignment,
};

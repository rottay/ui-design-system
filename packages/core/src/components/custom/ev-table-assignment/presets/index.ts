/**
 * EvTableAssignment - All Presets
 */

export { VisualEvTableAssignment } from './visual';
export { ListEvTableAssignment } from './list';

import type { EvTableAssignmentPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTableAssignmentProps } from '../core';
import { VisualEvTableAssignment } from './visual';
import { ListEvTableAssignment } from './list';

export const EV_TABLE_ASSIGNMENT_PRESETS: Record<EvTableAssignmentPreset, ComponentType<EvTableAssignmentProps>> = {
  visual: VisualEvTableAssignment,
  list: ListEvTableAssignment,
};

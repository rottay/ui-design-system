/**
 * EvTableAssignment - Main Export
 * Person-to-table assignment with visual drag-and-drop and list views
 */

import type { EvTableAssignmentProps } from './core';
import { EV_TABLE_ASSIGNMENT_DEFAULTS } from './core';
import { EV_TABLE_ASSIGNMENT_PRESETS } from './presets';

export {
  type EvTableAssignmentProps,
  type EvTableAssignmentPreset,
  type TableInfo as EvTableAssignmentTableInfo,
  type AssignedGuest as EvTableAssignmentAssignedGuest,
  EV_TABLE_ASSIGNMENT_DEFAULTS,
} from './core';
export * from './presets';

export function EvTableAssignment(props: EvTableAssignmentProps): React.ReactElement {
  const preset = props.preset ?? EV_TABLE_ASSIGNMENT_DEFAULTS.preset ?? 'visual';
  const PresetComponent = EV_TABLE_ASSIGNMENT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvTableAssignment.displayName = 'EvTableAssignment';

export { VisualEvTableAssignment, ListEvTableAssignment } from './presets';

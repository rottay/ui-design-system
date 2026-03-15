/**
 * EvStaffingPlanner - Main Export
 * Event staffing requirements planner
 * Automatically selects preset based on props
 */

import type { EvStaffingPlannerProps } from './core';
import { EV_STAFFING_PLANNER_DEFAULTS } from './core';
import { EV_STAFFING_PLANNER_PRESETS } from './presets';

export {
  type EvStaffingPlannerProps,
  type EvStaffingPlannerPreset,
  type StaffingRequirement as EvStaffingPlannerStaffingRequirement,
  type StaffInvitation as EvStaffingPlannerStaffInvitation,
  EV_STAFFING_PLANNER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvStaffingPlanner component
 * Renders the appropriate preset based on the preset prop
 */
export function EvStaffingPlanner(props: EvStaffingPlannerProps): React.ReactElement {
  const preset = props.preset ?? EV_STAFFING_PLANNER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_STAFFING_PLANNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvStaffingPlanner.displayName = 'EvStaffingPlanner';

export { OverviewEvStaffingPlanner, DetailEvStaffingPlanner } from './presets';

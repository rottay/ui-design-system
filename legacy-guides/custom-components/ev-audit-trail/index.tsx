/**
 * EvAuditTrail - Main Export
 * Audit log viewer
 * Automatically selects preset based on props
 */

import type { EvAuditTrailProps } from './core';
import { EV_AUDIT_TRAIL_DEFAULTS } from './core';
import { EV_AUDIT_TRAIL_PRESETS } from './presets';

export {
  type EvAuditTrailProps,
  type EvAuditTrailPreset,
  type AuditEntry as EvAuditTrailAuditEntry,
  type AuditFilter as EvAuditTrailAuditFilter,
  EV_AUDIT_TRAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvAuditTrail component
 * Renders the appropriate preset based on the preset prop
 */
export function EvAuditTrail(props: EvAuditTrailProps): React.ReactElement {
  const preset = props.preset ?? EV_AUDIT_TRAIL_DEFAULTS.preset ?? 'table';
  const PresetComponent = EV_AUDIT_TRAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvAuditTrail.displayName = 'EvAuditTrail';

export { TableEvAuditTrail, TimelineEvAuditTrail } from './presets';

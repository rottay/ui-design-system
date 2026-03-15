/**
 * BhAuditTrail - Main Export
 * Activity & Audit Log for BitHire ATS platform
 */

import type { BhAuditTrailProps } from './core';
import { BH_AUDIT_TRAIL_DEFAULTS } from './core';
import { BH_AUDIT_TRAIL_PRESETS } from './presets';

export {
  type BhAuditTrailProps,
  type BhAuditTrailPreset,
  type EntityType,
  type ActionType,
  type AuditEvent,
  type AuditStats,
  type AuditFilter,
  BH_AUDIT_TRAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhAuditTrail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAuditTrail(props: BhAuditTrailProps): React.ReactElement {
  const preset = props.preset ?? BH_AUDIT_TRAIL_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BH_AUDIT_TRAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAuditTrail.displayName = 'BhAuditTrail';

export { TimelineBhAuditTrail, TableBhAuditTrail } from './presets';

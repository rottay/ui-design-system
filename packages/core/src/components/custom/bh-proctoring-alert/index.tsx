/**
 * BhProctoringAlert - Main Export
 * Fixed/sticky banner or toast for critical proctoring events
 */

import type { BhProctoringAlertProps } from './core';
import { BH_PROCTORING_ALERT_DEFAULTS } from './core';
import { BH_PROCTORING_ALERT_PRESETS } from './presets';

export {
  type BhProctoringAlertProps,
  type BhProctoringAlertPreset,
  type ProctoringEventType,
  type ProctoringEventSeverity,
  type ProctoringAlertEvent,
  type AlertVariant,
  BH_PROCTORING_ALERT_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringAlert component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringAlert(props: BhProctoringAlertProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_ALERT_DEFAULTS.preset ?? 'banner';
  const PresetComponent = BH_PROCTORING_ALERT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringAlert.displayName = 'BhProctoringAlert';

export { BannerBhProctoringAlert, ToastBhProctoringAlert } from './presets';

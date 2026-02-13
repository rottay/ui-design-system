/**
 * BhComplianceChecker - Main Export
 * Compliance rules checker and status for BitHire ATS platform
 */

import type { BhComplianceCheckerProps } from './core';
import { BH_COMPLIANCE_CHECKER_DEFAULTS } from './core';
import { BH_COMPLIANCE_CHECKER_PRESETS } from './presets';

export {
  type BhComplianceCheckerProps,
  type BhComplianceCheckerPreset,
  type ComplianceRule,
  BH_COMPLIANCE_CHECKER_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhComplianceChecker component
 * Renders the appropriate preset based on the preset prop
 */
export function BhComplianceChecker(props: BhComplianceCheckerProps): React.ReactElement {
  const preset = props.preset ?? BH_COMPLIANCE_CHECKER_DEFAULTS.preset ?? 'checker';
  const PresetComponent = BH_COMPLIANCE_CHECKER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhComplianceChecker.displayName = 'BhComplianceChecker';

export { CheckerBhComplianceChecker, CompactBhComplianceChecker } from './presets';

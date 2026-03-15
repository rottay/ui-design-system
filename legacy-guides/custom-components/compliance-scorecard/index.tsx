/**
 * ComplianceScorecard - Main Export
 * Automatically selects preset based on props
 */

import type { ComplianceScorecardProps } from './core';
import { COMPLIANCE_SCORECARD_DEFAULTS } from './core';
import { COMPLIANCE_SCORECARD_PRESETS } from './presets';

export { type ComplianceScorecardProps, type ComplianceScorecardPreset, type ComplianceFramework, type ComplianceRequirement, type ComplianceLevel, type RegulationType, COMPLIANCE_SCORECARD_DEFAULTS } from './core';
export { getComplianceLevelColors, getScoreColor, getRegulationLabel } from './core';
export * from './presets';

/**
 * ComplianceScorecard component
 * Renders the appropriate preset based on the preset prop
 */
export function ComplianceScorecard(props: ComplianceScorecardProps): React.ReactElement {
  const preset = props.preset ?? COMPLIANCE_SCORECARD_DEFAULTS.preset ?? 'overview';
  const PresetComponent = COMPLIANCE_SCORECARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

ComplianceScorecard.displayName = 'ComplianceScorecard';

export { OverviewComplianceScorecard, DetailComplianceScorecard, ComparisonComplianceScorecard } from './presets';

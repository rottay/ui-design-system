/**
 * ComplianceScorecard - All Presets
 */

import type { ComplianceScorecardPreset } from '../core';
import { OverviewComplianceScorecard } from './overview';
import { DetailComplianceScorecard } from './detail';
import { ComparisonComplianceScorecard } from './comparison';

export { OverviewComplianceScorecard } from './overview';
export { DetailComplianceScorecard } from './detail';
export { ComparisonComplianceScorecard } from './comparison';

export const COMPLIANCE_SCORECARD_PRESETS: Record<ComplianceScorecardPreset, React.ComponentType<any>> = {
  overview: OverviewComplianceScorecard,
  detail: DetailComplianceScorecard,
  comparison: ComparisonComplianceScorecard,
};

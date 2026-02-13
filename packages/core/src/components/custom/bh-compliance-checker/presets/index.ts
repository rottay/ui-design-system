/**
 * BhComplianceChecker - All Presets
 */

import type { BhComplianceCheckerPreset } from '../core';
import { CheckerBhComplianceChecker } from './checker';
import { CompactBhComplianceChecker } from './compact';

export { CheckerBhComplianceChecker } from './checker';
export { CompactBhComplianceChecker } from './compact';

export const BH_COMPLIANCE_CHECKER_PRESETS: Record<BhComplianceCheckerPreset, React.ComponentType<any>> = {
  'checker': CheckerBhComplianceChecker,
  'compact': CompactBhComplianceChecker,
};

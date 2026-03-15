/**
 * BhComplianceChecker - All Presets
 */

import type { BhComplianceCheckerPreset, BhComplianceCheckerProps } from '../core';
import type { ComponentType } from 'react';
import { CheckerBhComplianceChecker } from './checker';
import { CompactBhComplianceChecker } from './compact';

export { CheckerBhComplianceChecker } from './checker';
export { CompactBhComplianceChecker } from './compact';

export const BH_COMPLIANCE_CHECKER_PRESETS: Record<BhComplianceCheckerPreset, ComponentType<BhComplianceCheckerProps>> = {
  'checker': CheckerBhComplianceChecker,
  'compact': CompactBhComplianceChecker,
};

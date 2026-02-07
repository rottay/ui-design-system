/**
 * BhIndividualHome - All Presets
 */

import type { BhIndividualHomePreset } from '../core';
import { StandardBhIndividualHome } from './standard';

export { StandardBhIndividualHome } from './standard';

export const BH_INDIVIDUAL_HOME_PRESETS: Record<BhIndividualHomePreset, React.ComponentType<any>> = {
  standard: StandardBhIndividualHome,
};

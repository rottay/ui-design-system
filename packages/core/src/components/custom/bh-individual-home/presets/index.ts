/**
 * BhIndividualHome - All Presets
 */

import type { BhIndividualHomePreset, BhIndividualHomeProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhIndividualHome } from './standard';

export { StandardBhIndividualHome } from './standard';

export const BH_INDIVIDUAL_HOME_PRESETS: Record<BhIndividualHomePreset, ComponentType<BhIndividualHomeProps>> = {
  standard: StandardBhIndividualHome,
};

/**
 * BhPositionDetail - All Presets
 */

import type { BhPositionDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhPositionDetailProps } from '../core';
import { StandardBhPositionDetail } from './standard';

export { StandardBhPositionDetail } from './standard';

export const BH_POSITION_DETAIL_PRESETS: Record<BhPositionDetailPreset, ComponentType<BhPositionDetailProps>> = {
  standard: StandardBhPositionDetail,
};

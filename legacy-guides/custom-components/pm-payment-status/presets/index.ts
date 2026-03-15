/**
 * PmPaymentStatus - All Presets
 */

export { TrackerPmPaymentStatus } from './tracker';
export { BadgePmPaymentStatus } from './badge';

import type { PmPaymentStatusPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPaymentStatusProps } from '../core';
import { TrackerPmPaymentStatus } from './tracker';
import { BadgePmPaymentStatus } from './badge';

export const PM_PAYMENT_STATUS_PRESETS: Record<PmPaymentStatusPreset, ComponentType<PmPaymentStatusProps>> = {
  tracker: TrackerPmPaymentStatus,
  badge: BadgePmPaymentStatus,
};

/**
 * BhProctoringAlert - All Presets
 */

import type { BhProctoringAlertPreset, BhProctoringAlertProps } from '../core';
import type { ComponentType } from 'react';
import { BannerBhProctoringAlert } from './banner';
import { ToastBhProctoringAlert } from './toast';

export { BannerBhProctoringAlert } from './banner';
export { ToastBhProctoringAlert } from './toast';

export const BH_PROCTORING_ALERT_PRESETS: Record<BhProctoringAlertPreset, ComponentType<BhProctoringAlertProps>> = {
  'banner': BannerBhProctoringAlert,
  'toast': ToastBhProctoringAlert,
};

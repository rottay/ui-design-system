/**
 * BhProctoringAlert - All Presets
 */

import type { BhProctoringAlertPreset } from '../core';
import { BannerBhProctoringAlert } from './banner';
import { ToastBhProctoringAlert } from './toast';

export { BannerBhProctoringAlert } from './banner';
export { ToastBhProctoringAlert } from './toast';

export const BH_PROCTORING_ALERT_PRESETS: Record<BhProctoringAlertPreset, React.ComponentType<any>> = {
  'banner': BannerBhProctoringAlert,
  'toast': ToastBhProctoringAlert,
};

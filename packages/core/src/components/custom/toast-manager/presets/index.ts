import { stackedPreset } from './stacked';
import { minimalPreset } from './minimal';
import type { ToastManagerPreset } from '../core';

export { stackedPreset, minimalPreset };

export const PRESETS: Record<ToastManagerPreset, typeof stackedPreset> = {
  stacked: stackedPreset,
  minimal: minimalPreset,
};

import type { BillingPanelPreset } from '../core';
import { Standard } from './standard';
import { Compact } from './compact';

export const PRESETS: Record<BillingPanelPreset, React.ComponentType<any>> = {
  'standard': Standard,
  'compact': Compact,
};

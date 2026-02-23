import type { BillingPanelPreset, BillingPanelProps } from '../core';
import type { ComponentType } from 'react';
import { Standard } from './standard';
import { Compact } from './compact';

export const PRESETS: Record<BillingPanelPreset, ComponentType<BillingPanelProps>> = {
  'standard': Standard,
  'compact': Compact,
};

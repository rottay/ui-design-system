import type { WebhookConfigPreset } from '../core';
import { Standard } from './standard';
import { Compact } from './compact';

export const PRESETS: Record<WebhookConfigPreset, React.ComponentType<any>> = {
  'standard': Standard,
  'compact': Compact,
};

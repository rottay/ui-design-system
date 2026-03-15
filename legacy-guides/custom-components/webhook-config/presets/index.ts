import type { WebhookConfigPreset, WebhookConfigProps } from '../core';
import type { ComponentType } from 'react';
import { Standard } from './standard';
import { Compact } from './compact';

export const PRESETS: Record<WebhookConfigPreset, ComponentType<WebhookConfigProps>> = {
  'standard': Standard,
  'compact': Compact,
};

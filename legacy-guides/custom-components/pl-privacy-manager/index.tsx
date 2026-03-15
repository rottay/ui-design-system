/**
 * PlPrivacyManager - Main Export
 * Manage privacy settings, data consent preferences, and GDPR compliance options
 */

import React from 'react';
import type { PlPrivacyManagerProps } from './core';
import { PL_PRIVACY_MANAGER_DEFAULTS } from './core';
import { PL_PRIVACY_MANAGER_PRESETS } from './presets';

export { type PlPrivacyManagerProps, type PlPrivacyManagerPreset, PL_PRIVACY_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlPrivacyManager(props: PlPrivacyManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_PRIVACY_MANAGER_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PL_PRIVACY_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlPrivacyManager.displayName = 'PlPrivacyManager';

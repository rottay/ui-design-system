/**
 * PlPrivacyManager Preset Exports
 */

export { PanelPlPrivacyManager } from './panel';
export { WizardPlPrivacyManager } from './wizard';

import type { PlPrivacyManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlPrivacyManagerProps } from '../core';
import { PanelPlPrivacyManager } from './panel';
import { WizardPlPrivacyManager } from './wizard';

export const PL_PRIVACY_MANAGER_PRESETS: Record<PlPrivacyManagerPreset, ComponentType<PlPrivacyManagerProps>> = {
  panel: PanelPlPrivacyManager,
  wizard: WizardPlPrivacyManager,
};

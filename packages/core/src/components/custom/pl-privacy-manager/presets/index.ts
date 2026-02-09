/**
 * PlPrivacyManager Preset Exports
 */

export { PanelPlPrivacyManager } from './panel';
export { WizardPlPrivacyManager } from './wizard';

export const PRESETS = {
  panel: () => import('./panel').then((m) => m.PanelPlPrivacyManager),
  wizard: () => import('./wizard').then((m) => m.WizardPlPrivacyManager),
} as const;

export type PresetName = keyof typeof PRESETS;

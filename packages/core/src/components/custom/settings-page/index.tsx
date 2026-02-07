import type { SettingsPageProps } from './core';
import { SETTINGS_PAGE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { SettingsPageProps, SettingsPagePreset, SettingsSection } from './core';
export { SETTINGS_PAGE_DEFAULTS } from './core';

export function SettingsPage(props: SettingsPageProps) {
  const preset = props.preset ?? SETTINGS_PAGE_DEFAULTS.preset ?? 'sidebar-nav';
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown SettingsPage preset: ${preset}`);
  }

  return <PresetComponent {...props} />;
}

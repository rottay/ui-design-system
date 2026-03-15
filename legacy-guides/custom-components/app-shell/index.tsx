import type { AppShellProps } from './core';
import { APP_SHELL_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { AppShellProps, AppShellPreset } from './core';
export { APP_SHELL_DEFAULTS } from './core';

export function AppShell(props: AppShellProps) {
  const preset = props.preset ?? APP_SHELL_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown AppShell preset: ${preset}`);
  }

  return <PresetComponent {...props} />;
}

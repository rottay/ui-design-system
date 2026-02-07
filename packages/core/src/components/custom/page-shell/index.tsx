import type { PageShellProps } from './core';
import { PAGE_SHELL_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { PageShellProps, PageShellPreset, PageShellTab, PageShellBreadcrumb, PageShellAction } from './core';
export { PAGE_SHELL_DEFAULTS } from './core';

export function PageShell(props: PageShellProps) {
  const preset = props.preset ?? PAGE_SHELL_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown PageShell preset: ${preset}`);
  }

  return <PresetComponent {...props} />;
}

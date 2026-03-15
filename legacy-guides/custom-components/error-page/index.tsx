import type { ErrorPageProps } from './core';
import { ERROR_PAGE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ErrorPageProps, ErrorPagePreset, ErrorPageAction, ErrorCode } from './core';
export { ERROR_MESSAGES, ERROR_PAGE_DEFAULTS } from './core';

export function ErrorPage(props: ErrorPageProps) {
  const preset = props.preset ?? ERROR_PAGE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown ErrorPage preset: ${preset}`);
  }

  return <PresetComponent {...props} />;
}

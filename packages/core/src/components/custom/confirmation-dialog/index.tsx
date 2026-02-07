import type { ConfirmationDialogProps } from './core';
import { CONFIRMATION_DIALOG_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ConfirmationDialogProps, ConfirmationDialogPreset } from './core';
export { CONFIRMATION_DIALOG_DEFAULTS } from './core';

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const mergedProps = { ...CONFIRMATION_DIALOG_DEFAULTS, ...props };
  const preset = mergedProps.preset || 'standard';
  const PresetComponent = PRESETS[preset];

  return <PresetComponent {...mergedProps} />;
}

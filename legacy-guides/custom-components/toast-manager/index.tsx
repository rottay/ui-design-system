import type { ToastManagerProps } from './core';
import { TOAST_MANAGER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ToastManagerProps, ToastManagerPreset, Toast, ToastType, ToastPosition } from './core';
export { TOAST_MANAGER_DEFAULTS } from './core';

export function ToastManager(props: ToastManagerProps) {
  const mergedProps = { ...TOAST_MANAGER_DEFAULTS, ...props };
  const preset = mergedProps.preset || 'stacked';
  const PresetComponent = PRESETS[preset];

  return <PresetComponent {...mergedProps} />;
}

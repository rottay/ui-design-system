import type { KeyboardShortcutsProps } from './core';
import { KEYBOARD_SHORTCUTS_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { KeyboardShortcutsProps, KeyboardShortcutsPreset, ShortcutCategory } from './core';
export { KEYBOARD_SHORTCUTS_DEFAULTS } from './core';

export function KeyboardShortcuts(props: KeyboardShortcutsProps): React.ReactElement | null {
  const preset = props.preset ?? KEYBOARD_SHORTCUTS_DEFAULTS.preset ?? 'modal';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

KeyboardShortcuts.displayName = 'KeyboardShortcuts';

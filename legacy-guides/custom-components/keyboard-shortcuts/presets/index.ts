import type { KeyboardShortcutsPreset, KeyboardShortcutsProps } from '../core';
import { ModalPreset } from './modal';
import { InlinePreset } from './inline';

export const PRESETS: Record<
  KeyboardShortcutsPreset,
  React.ComponentType<KeyboardShortcutsProps>
> = {
  modal: ModalPreset,
  inline: InlinePreset,
};

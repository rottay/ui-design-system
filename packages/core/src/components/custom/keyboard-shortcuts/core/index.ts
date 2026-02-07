import type { EngineAwareProps } from '../../../../types';

export type KeyboardShortcutsPreset = 'modal' | 'inline';

export interface ShortcutCategory {
  key: string;
  label: string;
  shortcuts: {
    key: string;
    keys: string[];
    description: string;
  }[];
}

export interface KeyboardShortcutsProps extends EngineAwareProps {
  preset?: KeyboardShortcutsPreset;
  categories: ShortcutCategory[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const KEYBOARD_SHORTCUTS_DEFAULTS = {
  preset: 'modal' as KeyboardShortcutsPreset,
  open: false,
};

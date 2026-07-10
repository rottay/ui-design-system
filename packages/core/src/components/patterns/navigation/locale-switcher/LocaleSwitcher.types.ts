/**
 * @fileoverview Type definitions for the LocaleSwitcher pattern. Defines
 * LocaleDef (code, label, flag) and the component props controlling
 * size, flag/label visibility, and locale selection behavior.
 */

import type { Size } from '../../../../contracts/common';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Defines a single locale option available in the switcher.
 */
export interface LocaleDef {
  /** BCP-47 language code (e.g. "en", "es", "pt") */
  code: string;
  /** Human-readable display name in the locale's own language */
  label: string;
  /** Optional flag emoji displayed alongside the label */
  flag?: string;
}

/**
 * Default locales supported by the design system.
 */
export const DEFAULT_LOCALES: LocaleDef[] = [
  { code: 'es', label: 'Espanol', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'pt', label: 'Portugues', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'fr', label: 'Francais', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', flag: '\u{1F1F8}\u{1F1E6}' },
];

/**
 * Props for the LocaleSwitcher pattern component.
 * Renders a compact dropdown that lets users switch the active language.
 *
 * @example
 * ```tsx
 * <PatternLocaleSwitcher
 *   locale="en"
 *   onChange={(code) => setLocale(code)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <PatternLocaleSwitcher
 *   locale="es"
 *   onChange={(code) => setLocale(code)}
 *   size="sm"
 *   showLabel={false}
 *   locales={[
 *     { code: 'es', label: 'Espanol', flag: '\u{1F1EA}\u{1F1F8}' },
 *     { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
 *   ]}
 * />
 * ```
 */
export interface LocaleSwitcherProps extends PatternBaseProps {
  /** Current active locale code */
  locale: string;
  /** Called when the user selects a new locale */
  onChange: (locale: string) => void;
  /** Available locales. Default: all 5 DS locales */
  locales?: LocaleDef[];
  /** Size variant */
  size?: Extract<Size, 'sm' | 'md'>;
  /** Show flag emoji. Default: true */
  showFlag?: boolean;
  /** Show label text. Default: true on md, false on sm */
  showLabel?: boolean;
}

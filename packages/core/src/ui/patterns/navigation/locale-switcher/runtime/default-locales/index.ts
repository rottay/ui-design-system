/** Runtime values and operations separated from the public type contract. */

import type { LocaleDef } from '../../contracts';

/**
 * Default locales supported by the design system.
 */
export const DEFAULT_LOCALES: LocaleDef[] = [
  { code: 'es', label: 'Español', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'pt', label: 'Português', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'fr', label: 'Français', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', flag: '\u{1F1F8}\u{1F1E6}' },
];

import type { ReactNode } from 'react';
import type {
  LocaleTranslations,
  SupportedLocale,
} from '@/foundation/i18n/kernel/contracts';

/**
 * How the provider publishes `lang` / `dir` into the DOM.
 *
 * - `none` (default) — the provider renders no element of its own. Direction
 *   still reaches components through context (`useDirection`), and the
 *   application owns the `<html lang dir>` pair via
 *   `resolveDocumentLocaleAttributes`, which is the only placement present in
 *   the server HTML and the only one UA chrome honours.
 * - `element` — the provider wraps its children in a layout-transparent
 *   (`display: contents`) element carrying `lang` and `dir`. Use it when the
 *   design system is mounted inside a document it does not control, or for a
 *   locale ISLAND whose direction differs from the surrounding document.
 */
export type I18nDirectionScope = 'none' | 'element';

export interface I18nProviderProps {
  locale: SupportedLocale;
  /**
   * The locale consulted when the active locale has no copy for a key. This is
   * authoritative: resolution stops here rather than hopping to a further
   * language. Defaults to `DEFAULT_FALLBACK_LOCALE`.
   */
  fallbackLocale?: SupportedLocale;
  customTranslations?: Partial<LocaleTranslations>;
  onLocaleChange?: (locale: SupportedLocale) => void;
  /** @default 'none' */
  directionScope?: I18nDirectionScope;
  children: ReactNode;
}

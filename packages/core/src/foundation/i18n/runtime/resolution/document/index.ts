/**
 * Server-renderable `lang` / `dir` attributes for a locale.
 *
 * `<html>` belongs to the application, not to the design system, so the DS
 * cannot render it. What the DS CAN do is stop making the application guess:
 * this resolver is React-free and side-effect-free, so a server layout can
 * spread it directly onto its own `<html>` element and have the very first
 * byte of HTML carry the correct direction.
 *
 * Without it the only writer of `dir` was a client `useEffect`, which means
 * an Arabic page is served as LTR, painted as LTR, and flips to RTL after
 * hydration — a full-page reflow the user sees.
 *
 * @example
 * // app/layout.tsx (server component)
 * export default function RootLayout({ children }) {
 *   const locale = toSupportedLocale(headers().get('accept-language'));
 *   return <html {...resolveDocumentLocaleAttributes(locale)}>{children}</html>;
 * }
 */

import type { SupportedLocale, TextDirection } from '@/foundation/i18n/kernel/contracts';
import { LOCALE_CONFIGS } from '@/foundation/i18n/runtime/catalog/configuration';

export interface DocumentLocaleAttributes {
  lang: SupportedLocale;
  dir: TextDirection;
}

export function resolveDocumentLocaleAttributes(
  locale: SupportedLocale,
): DocumentLocaleAttributes {
  const config = LOCALE_CONFIGS[locale];
  return { lang: config.code, dir: config.direction };
}

/**
 * Direction for a locale, without the attribute wrapper. Callers that already
 * hold a locale and only need the axis (paging arrows, drag deltas, popover
 * placement) use this instead of measuring the DOM.
 */
export function resolveLocaleDirection(locale: SupportedLocale): TextDirection {
  return LOCALE_CONFIGS[locale].direction;
}

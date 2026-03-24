# I18n System Catalog

Source: `ui-design-system/packages/core/src/i18n/`

The i18n subsystem provides locale-aware strings, formatting, and directionality for both the design system internals and consuming applications.

---

## Architecture

```
i18n/
  context/          -> I18nProvider, I18nContext, useI18nContext
  hooks/            -> useTranslation, useLocale
  locales/          -> Per-locale translation dictionaries (es, en, pt, fr, ar)
  types/            -> Type definitions + LOCALE_CONFIGS constant
  utils/formatters/ -> Locale-aware formatting functions (Intl API)
  toSupportedLocale.ts -> BCP-47 locale normalizer
```

---

## Supported Locales

| Code | Name | Direction | Date Locale | Number Locale |
|------|------|:---------:|-------------|---------------|
| `es` | Espanol | LTR | es-ES | es-ES |
| `en` | English | LTR | en-US | en-US |
| `pt` | Portugues | LTR | pt-BR | pt-BR |
| `fr` | Francais | LTR | fr-FR | fr-FR |
| `ar` | Arabic | **RTL** | ar-SA | ar-SA |

Type: `SupportedLocale = 'es' | 'en' | 'pt' | 'fr' | 'ar'`

Defined in `LOCALE_CONFIGS` (exported from types).

---

## I18nProvider

Source: `i18n/context/I18nProvider`

Wraps the application (or a subtree) to provide locale context to all descendants.

```tsx
import { I18nProvider } from '@rottay/design-system/i18n';

<I18nProvider locale="es" fallbackLocale="en">
  <App />
</I18nProvider>
```

### Props (`I18nProviderProps`)

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `locale` | `SupportedLocale` | Yes | Initial active locale |
| `fallbackLocale` | `SupportedLocale` | No | Fallback when a translation key is missing |
| `customTranslations` | `Partial<LocaleTranslations>` | No | Tenant-specific translation overrides |
| `onLocaleChange` | `(locale: SupportedLocale) => void` | No | Callback fired when locale changes |
| `children` | `ReactNode` | Yes | -- |

### Context Value (`I18nContextValue`)

| Property | Type | Description |
|----------|------|-------------|
| `locale` | `SupportedLocale` | Current active locale |
| `setLocale` | `(locale) => void` | Change the active locale |
| `t` | `TranslateFunction` | Translation function |
| `config` | `LocaleConfig` | Full config for the current locale |

---

## Hooks

### useTranslation

Returns a namespace-scoped translation function.

```tsx
import { useTranslation } from '@rottay/design-system/i18n';

function MyComponent() {
  const { t } = useTranslation('components');
  return <button>{t('button.submit')}</button>;
}
```

Return type: `UseTranslationResult`

### useLocale

Provides read/write access to the active locale and its configuration.

```tsx
import { useLocale } from '@rottay/design-system/i18n';

function LocaleSwitcher() {
  const { locale, setLocale, config } = useLocale();
  // config.direction -> 'ltr' | 'rtl'
}
```

Return type: `UseLocaleResult`

---

## Translation Namespaces

Type: `TranslationNamespace = 'common' | 'components' | 'errors' | 'validation'`

Each locale provides dictionaries for all four namespaces:

| Namespace | Purpose |
|-----------|---------|
| `common` | General-purpose strings (actions, labels, status) |
| `components` | Component-internal strings (placeholder text, aria labels) |
| `errors` | Error messages |
| `validation` | Form validation messages |

### Translation Dictionary Structure

```ts
interface LocaleTranslations {
  common: TranslationDictionary;      // Record<string, any>
  components: TranslationDictionary;
  errors: TranslationDictionary;
  validation: TranslationDictionary;
}
```

### TranslateFunction

```ts
type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;
```

Supports parameter interpolation: `t('greeting', { name: 'Daniel' })`.

---

## Formatting Utilities

Source: `i18n/utils/formatters/`

All formatters are built on the `Intl` API with try/catch guards and dev-only error logging. They accept an explicit locale string and work both inside and outside React.

| Function | Signature | Description |
|----------|-----------|-------------|
| `formatDate` | `(date, locale, options?) -> string` | Date formatting via `Intl.DateTimeFormat` |
| `formatNumber` | `(value, locale, options?) -> string` | Number formatting with locale-specific grouping |
| `formatCurrency` | `(value, locale, currency?) -> string` | Monetary formatting (defaults to USD) |
| `formatRelativeTime` | `(date, locale) -> string` | Relative time ("5 minutes ago") via `Intl.RelativeTimeFormat` |
| `formatPercent` | `(value, locale, decimals?) -> string` | Percentage formatting (0.75 -> "75%") |
| `formatDateRange` | `(start, end, locale, options?) -> string` | Date range using `Intl.DateTimeFormat.formatRange` with fallback |
| `formatFileSize` | `(bytes, locale, decimals?) -> string` | Human-readable file size (KB, MB, GB) |
| `formatList` | `(items, locale, type?) -> string` | Grammatically correct list joining ("A, B, and C") via `Intl.ListFormat` |

---

## toSupportedLocale Utility

Source: `i18n/toSupportedLocale.ts`

Normalizes a BCP-47 locale string (e.g., `"en-US"`, `"es-AR"`) to a 2-letter `SupportedLocale` code.

```ts
import { toSupportedLocale } from '@rottay/design-system/i18n';

toSupportedLocale('en-US');      // 'en'
toSupportedLocale('es-AR');      // 'es'
toSupportedLocale('de-DE');      // 'en' (fallback)
toSupportedLocale(undefined);    // 'en' (fallback)
toSupportedLocale('pt-BR', 'es'); // 'pt'
```

Parameters:
- `raw`: input locale string (nullable)
- `fallback`: default locale if input is missing or unsupported (defaults to `'en'`)

---

## Tenant Translation Overrides

Tenants can inject custom translations via the `customTranslations` prop on `I18nProvider`. These are merged on top of the built-in locale dictionaries, allowing tenant-specific branding of component strings without forking the translation files.

```tsx
<I18nProvider
  locale="en"
  customTranslations={{
    common: { 'app.name': 'BitHire' },
    components: { 'button.submit': 'Apply Now' },
  }}
>
  <App />
</I18nProvider>
```

---

## Summary

| Category | Count |
|----------|------:|
| Supported locales | 5 (es, en, pt, fr, ar) |
| Translation namespaces | 4 (common, components, errors, validation) |
| Formatting utilities | 8 |
| Hooks | 2 (useTranslation, useLocale) |
| Context exports | 3 (I18nProvider, useI18nContext, I18nContext) |

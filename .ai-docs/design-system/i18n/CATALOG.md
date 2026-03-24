# DS I18n System

## Supported Locales (5)
| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `pt` | Portuguese |
| `fr` | French |
| `ar` | Arabic (RTL) |

## Components

### I18nProvider
From `@rottay/design-system`:
```tsx
<I18nProvider locale="es" fallbackLocale="en">
  {children}
</I18nProvider>
```

### toSupportedLocale()
Normalizes BCP-47 strings to supported 2-letter codes:
```ts
import { toSupportedLocale } from '@rottay/design-system';
toSupportedLocale('en-US');  // -> 'en'
toSupportedLocale('es-AR');  // -> 'es'
toSupportedLocale('de-DE');  // -> 'en' (fallback)
toSupportedLocale(undefined); // -> 'en' (fallback)
```

## Locale Resolution (canonical)
```ts
locale = toSupportedLocale(
  tenantConfig?.locale       // tenant preference
  ?? session?.user?.locale   // user preference (BCP-47)
  ?? verticalDefault         // vertical default
);
```

## Translation System
Each locale directory contains translation keys used by DS components:
- Button labels (Cancel, OK, Submit, etc.)
- Table chrome (No data, Loading, etc.)
- Form validation messages
- Date formatting patterns
- Accessibility labels

## RTL Support
Arabic (`ar`) locale triggers RTL layout via `dir="rtl"` on the root element.

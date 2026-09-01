# Internationalization examples

These examples use the package API. They are documentation, not production source, so they are not emitted to `dist`.

## Provider and translations

```tsx
import {
  I18nProvider,
  type SupportedLocale,
  useLocale,
  useTranslation,
} from '@rottay/design-system';

export function App() {
  return (
    <I18nProvider locale="es" fallbackLocale="en">
      <Page />
    </I18nProvider>
  );
}

function Page() {
  const { t } = useTranslation('components');
  const { locale, setLocale, config } = useLocale();

  return (
    <main>
      <p>{t('pagination.page', { current: 1, total: 10 })}</p>
      <p>Current language: {config.name}</p>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as SupportedLocale)}
      >
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pt">Português</option>
        <option value="fr">Français</option>
      </select>
    </main>
  );
}
```

Use a namespace when the keys belong to one catalog:

```tsx
function ValidationMessage() {
  const { t } = useTranslation('validation');
  return <span role="alert">{t('password.min_length', { min: 8 })}</span>;
}
```

## Locale-aware formatting

```tsx
import { formatCurrency, formatDate, useLocale } from '@rottay/design-system';

function Summary() {
  const { config } = useLocale();

  return (
    <section>
      <p>{formatCurrency(1234.56, config.numberLocale, 'USD')}</p>
      <p>
        {formatDate(new Date(), config.dateLocale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </section>
  );
}
```

## Custom translations and persistence

```tsx
function LocalizedApp() {
  return (
    <I18nProvider
      locale="es"
      fallbackLocale="en"
      customTranslations={{
        common: { submit: 'Guardar cambios' },
        components: { button: { loading: 'Procesando…' } },
      }}
      onLocaleChange={(locale) => localStorage.setItem('locale', locale)}
    >
      <App />
    </I18nProvider>
  );
}
```

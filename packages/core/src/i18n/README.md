# Sistema de Internacionalización (i18n)

Sistema completo de internacionalización para el Design System Rottay.

## Características

- ✅ **4 locales soportados**: Español (es), English (en), Português (pt), Français (fr)
- ✅ **Namespaces organizados**: common, components, errors, validation
- ✅ **Interpolación de parámetros**: `t('page', { current: 1, total: 10 })`
- ✅ **Fallback automático**: Si falta traducción en locale actual, usa español
- ✅ **Traducciones custom por tenant**: Override de traducciones específicas
- ✅ **RTL-ready**: Soporte preparado para idiomas right-to-left
- ✅ **Formatters Intl**: Fecha, número, moneda, tiempo relativo, listas
- ✅ **Type-safe**: TypeScript con tipos completos
- ✅ **Client-side**: Usa 'use client' para Next.js App Router

## Setup Básico

```tsx
// app/layout.tsx
import { I18nProvider } from '@rottay/design-system';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider locale="es">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

## Uso en Componentes

### Hook useTranslation

```tsx
import { useTranslation } from '@rottay/design-system';

function MyButton() {
  // Sin namespace
  const { t } = useTranslation();
  return <button>{t('common.submit')}</button>; // => "Enviar"
}

function MyAvatar() {
  // Con namespace
  const { t } = useTranslation('components');
  return <div>{t('avatar.loading')}</div>; // => "Cargando avatar..."
}

function MyPagination() {
  // Con interpolación
  const { t } = useTranslation('components');
  const text = t('pagination.page', { current: 1, total: 10 });
  // => "Página 1 de 10"
  return <span>{text}</span>;
}
```

### Hook useLocale

```tsx
import { useLocale } from '@rottay/design-system';

function LanguageSwitcher() {
  const { locale, setLocale, config } = useLocale();

  return (
    <div>
      <p>Current: {config.name}</p> {/* => "Español" */}
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('es')}>Español</button>
      <button onClick={() => setLocale('pt')}>Português</button>
      <button onClick={() => setLocale('fr')}>Français</button>
    </div>
  );
}
```

## Formatters

### Fecha

```tsx
import { formatDate, useLocale } from '@rottay/design-system';

function DateDisplay() {
  const { config } = useLocale();
  const date = new Date();

  return (
    <div>
      {formatDate(date, config.dateLocale)}
      {/* es-ES: "25 de diciembre de 2025" */}
      {/* en-US: "December 25, 2025" */}
    </div>
  );
}
```

### Número

```tsx
import { formatNumber } from '@rottay/design-system';

formatNumber(1234567.89, 'es-ES');  // => "1.234.567,89"
formatNumber(1234567.89, 'en-US');  // => "1,234,567.89"
```

### Moneda

```tsx
import { formatCurrency } from '@rottay/design-system';

formatCurrency(1234.56, 'es-ES', 'EUR');  // => "1.234,56 €"
formatCurrency(1234.56, 'en-US', 'USD');  // => "$1,234.56"
```

### Tiempo Relativo

```tsx
import { formatRelativeTime } from '@rottay/design-system';

const pastDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos atrás

formatRelativeTime(pastDate, 'es-ES');  // => "hace 5 minutos"
formatRelativeTime(pastDate, 'en-US');  // => "5 minutes ago"
```

### Listas

```tsx
import { formatList } from '@rottay/design-system';

const items = ['Manzana', 'Naranja', 'Plátano'];

formatList(items, 'es-ES', 'conjunction');  // => "Manzana, Naranja y Plátano"
formatList(items, 'en-US', 'conjunction');  // => "Manzana, Naranja, and Plátano"
formatList(items, 'es-ES', 'disjunction'); // => "Manzana, Naranja o Plátano"
```

### Tamaño de Archivo

```tsx
import { formatFileSize } from '@rottay/design-system';

formatFileSize(1536, 'es-ES');        // => "1,50 KB"
formatFileSize(1048576, 'es-ES');     // => "1,00 MB"
formatFileSize(1073741824, 'es-ES');  // => "1,00 GB"
```

## Traducciones Personalizadas por Tenant

```tsx
<I18nProvider
  locale="es"
  customTranslations={{
    'common.submit': 'Guardar cambios',
    'components.button.loading': 'Procesando...',
  }}
>
  {children}
</I18nProvider>
```

## Callback de Cambio de Locale

```tsx
<I18nProvider
  locale="es"
  onLocaleChange={(newLocale) => {
    console.log('Locale changed to:', newLocale);
    // Guardar en localStorage, cookies, API, etc.
  }}
>
  {children}
</I18nProvider>
```

## Estructura de Traducciones

```
locales/
├── es/
│   ├── common.json        # Palabras comunes (yes, no, save, cancel, etc.)
│   ├── components.json    # Strings de componentes UI
│   ├── errors.json        # Mensajes de error
│   └── validation.json    # Mensajes de validación de forms
├── en/
│   └── ...
├── pt/
│   └── ...
└── fr/
    └── ...
```

## Locales Soportados

| Código | Idioma | Nombre Nativo | Dirección | Date Locale | Number Locale |
|--------|--------|---------------|-----------|-------------|---------------|
| `es` | Español | Español | ltr | es-ES | es-ES |
| `en` | English | English | ltr | en-US | en-US |
| `pt` | Português | Português | ltr | pt-BR | pt-BR |
| `fr` | Français | Français | ltr | fr-FR | fr-FR |

## TypeScript Types

```typescript
import type {
  SupportedLocale,
  LocaleConfig,
  TranslationNamespace,
  TranslateFunction,
  I18nProviderProps,
  I18nContextValue,
} from '@rottay/design-system';

const locale: SupportedLocale = 'es'; // 'es' | 'en' | 'pt' | 'fr'
const namespace: TranslationNamespace = 'components'; // 'common' | 'components' | 'errors' | 'validation'
```

## Filosofía de i18n

1. **Componentes agnósticos al idioma**: Los primitivos NO contienen strings hardcodeados
2. **Strings externalizados**: Todo texto visible viene de props o context
3. **RTL-ready**: Soporte para idiomas right-to-left preparado
4. **Formateo delegado**: Fechas, números, monedas se formatean con Intl API
5. **Fallbacks explícitos**: Siempre hay un valor por defecto en español

## Ejemplo Completo

```tsx
// App.tsx
import { I18nProvider } from '@rottay/design-system';

function App() {
  return (
    <I18nProvider
      locale="es"
      fallbackLocale="en"
      onLocaleChange={(locale) => {
        localStorage.setItem('locale', locale);
      }}
    >
      <MyApp />
    </I18nProvider>
  );
}

// MyComponent.tsx
import { useTranslation, useLocale, formatDate } from '@rottay/design-system';

function MyComponent() {
  const { t } = useTranslation('components');
  const { locale, setLocale, config } = useLocale();

  return (
    <div>
      <h1>{t('avatar.loading')}</h1>

      <p>
        {t('pagination.page', { current: 1, total: 10 })}
      </p>

      <p>
        {formatDate(new Date(), config.dateLocale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as SupportedLocale)}
      >
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pt">Português</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
```

## Agregar Nuevas Traducciones

1. Editar archivos JSON en `locales/{locale}/`
2. Respetar la estructura de namespaces
3. Usar `{param}` para interpolación
4. Mantener consistencia entre todos los locales

```json
// locales/es/components.json
{
  "mycomponent": {
    "title": "Mi Título",
    "description": "Descripción con {count} elementos"
  }
}
```

```tsx
// En el componente
const { t } = useTranslation('components');
t('mycomponent.title'); // => "Mi Título"
t('mycomponent.description', { count: 5 }); // => "Descripción con 5 elementos"
```

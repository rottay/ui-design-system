/**
 * @fileoverview Runnable usage examples for the i18n subsystem.
 *
 * This file is NOT part of the production bundle. It serves as living
 * documentation showing common patterns: basic setup, namespace scoping,
 * parameter interpolation, locale switching, and Intl-based formatting.
 */

import { I18nProvider, useTranslation, useLocale, formatDate, formatCurrency } from './index';

// ============================================================================
// EJEMPLO 1: Setup básico
// ============================================================================

export function App() {
  return (
    <I18nProvider locale="es">
      <MyApp />
    </I18nProvider>
  );
}

// ============================================================================
// EJEMPLO 2: Traducción básica
// ============================================================================

export function BasicTranslation() {
  const { t } = useTranslation();

  return (
    <div>
      <button>{t('common.submit')}</button>
      <button>{t('common.cancel')}</button>
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Traducción con namespace
// ============================================================================

export function NamespacedTranslation() {
  const { t } = useTranslation('components');

  return (
    <div>
      <p>{t('avatar.loading')}</p>
      <p>{t('button.loading')}</p>
      <p>{t('input.placeholder')}</p>
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Interpolación de parámetros
// ============================================================================

export function InterpolationExample() {
  const { t } = useTranslation('components');

  return (
    <div>
      <p>{t('pagination.page', { current: 1, total: 10 })}</p>
      {/* => "Página 1 de 10" */}

      <p>{t('table.rows_selected', { count: 5 })}</p>
      {/* => "5 filas seleccionadas" */}
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Cambio de idioma
// ============================================================================

export function LanguageSwitcher() {
  const { locale, setLocale, config } = useLocale();

  return (
    <div>
      <p>Current language: {config.name}</p>

      <button onClick={() => setLocale('es')}>Español</button>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('pt')}>Português</button>
      <button onClick={() => setLocale('fr')}>Français</button>

      <p>Locale code: {locale}</p>
      <p>Text direction: {config.direction}</p>
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Formateo de fechas
// ============================================================================

export function DateFormatting() {
  const { config } = useLocale();
  const now = new Date();

  return (
    <div>
      <p>
        {formatDate(now, config.dateLocale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      {/* es-ES: "25 de diciembre de 2025" */}
      {/* en-US: "December 25, 2025" */}
    </div>
  );
}

// ============================================================================
// EJEMPLO 7: Formateo de moneda
// ============================================================================

export function CurrencyFormatting() {
  const { config } = useLocale();
  const price = 1234.56;

  return (
    <div>
      <p>{formatCurrency(price, config.numberLocale, 'USD')}</p>
      {/* es-ES: "1.234,56 US$" */}
      {/* en-US: "$1,234.56" */}
    </div>
  );
}

// ============================================================================
// EJEMPLO 8: Provider con configuración avanzada
// ============================================================================

export function AdvancedProvider() {
  return (
    <I18nProvider
      locale="es"
      fallbackLocale="en"
      customTranslations={{
        'common.submit': 'Guardar cambios',
        'components.button.loading': 'Procesando...',
      }}
      onLocaleChange={(newLocale) => {
        console.log('Locale changed to:', newLocale);
        localStorage.setItem('locale', newLocale);
      }}
    >
      <MyApp />
    </I18nProvider>
  );
}

// ============================================================================
// EJEMPLO 9: Componente completo con i18n
// ============================================================================

export function CompleteComponent() {
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
          day: 'numeric',
        })}
      </p>

      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
      >
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pt">Português</option>
        <option value="fr">Français</option>
      </select>

      <button>{t('button.submit')}</button>
    </div>
  );
}

// ============================================================================
// EJEMPLO 10: Usar traducciones de errores
// ============================================================================

export function ErrorHandling() {
  const { t } = useTranslation('errors');

  const showError = (errorCode: string) => {
    return t(errorCode);
  };

  return (
    <div>
      <p>{showError('generic')}</p>
      <p>{showError('network')}</p>
      <p>{showError('not_found')}</p>
    </div>
  );
}

// ============================================================================
// EJEMPLO 11: Validaciones de formulario
// ============================================================================

export function ValidationMessages() {
  const { t } = useTranslation('validation');

  return (
    <form>
      <input type="email" />
      <span className="error">
        {t('email')}
        {/* => "Debe ser un email válido" */}
      </span>

      <input type="password" />
      <span className="error">
        {t('password.min_length', { min: 8 })}
        {/* => "La contraseña debe tener al menos 8 caracteres" */}
      </span>
    </form>
  );
}

function MyApp() {
  return <div>My App</div>;
}

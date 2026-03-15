/**
 * Tenant Schema
 * Validation and type guards for tenant configuration
 */

import type { TenantConfig, TenantBranding, TenantPlan, EngineName } from '../../../core/types';
import type { SupportedLocale } from '../../i18n/types';

/**
 * Validate tenant branding
 */
export function isValidBranding(branding: unknown): branding is TenantBranding {
  if (!branding || typeof branding !== 'object') return false;
  const b = branding as TenantBranding;
  return typeof b.companyName === 'string';
}

/**
 * Validate tenant plan
 */
export function isValidPlan(plan: unknown): plan is TenantPlan {
  return plan === 'starter' || plan === 'pro' || plan === 'enterprise';
}

/**
 * Validate engine name
 */
export function isValidEngineName(engine: unknown): engine is EngineName {
  return engine === 'classic' || engine === 'modern' || engine === 'rustic' || engine === 'athena';
}

/**
 * Validate supported locale
 */
export function isValidLocale(locale: unknown): locale is SupportedLocale {
  return locale === 'es' || locale === 'en' || locale === 'pt' || locale === 'fr' || locale === 'ar';
}

/**
 * Validate complete tenant config
 */
export function isValidTenantConfig(config: unknown): config is TenantConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as TenantConfig;

  return (
      typeof c.slug === 'string' &&
      typeof c.name === 'string' &&
      isValidEngineName(c.engine) &&
      typeof c.theme === 'string' &&
      (c.locale === undefined || isValidLocale(c.locale)) &&
      (c.fallbackLocale === undefined || isValidLocale(c.fallbackLocale)) &&
      isValidPlan(c.plan) &&
      Array.isArray(c.features) &&
      isValidBranding(c.branding)
  );
}

/**
 * Create a minimal valid tenant config
 */
export function createTenantConfig(partial: Partial<TenantConfig> & { slug: string; name: string }): TenantConfig {
  return {
    slug: partial.slug,
    name: partial.name,
    domain: partial.domain,
    engine: partial.engine ?? 'classic',
    theme: partial.theme ?? 'base',
    locale: partial.locale,
    fallbackLocale: partial.fallbackLocale,
    plan: partial.plan ?? 'starter',
    features: partial.features ?? [],
    branding: {
      companyName: partial.branding?.companyName ?? partial.name,
      logo: partial.branding?.logo,
      logoMark: partial.branding?.logoMark,
      favicon: partial.branding?.favicon,
      primaryColor: partial.branding?.primaryColor,
      secondaryColor: partial.branding?.secondaryColor,
      accentColor: partial.branding?.accentColor,
    },
    customTranslations: partial.customTranslations,
  };
}

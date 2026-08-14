/**
 * @fileoverview Tenant schema guards and normalizers.
 * @description Runtime validation helpers for tenant payloads coming from
 * registries, static assets, APIs, or app-provided config.
 */

import type { TenantConfig, TenantBranding, TenantPlan, EngineName } from '../../../../../foundation/contracts';
import type { SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import { isTenantIdentityAllowed } from '@/foundation/tokens/ts/presentation/brand-themes';

/**
 * Branding is intentionally permissive: only `companyName` is required.
 * The rest of the visual system can be filled by presets or token defaults.
 */
export function isValidBranding(branding: unknown): branding is TenantBranding {
  if (!branding || typeof branding !== 'object') return false;
  const b = branding as TenantBranding;
  return typeof b.companyName === 'string';
}

/**
 * Plans are a closed union because feature gating depends on predictable values.
 */
export function isValidPlan(plan: unknown): plan is TenantPlan {
  return plan === 'starter' || plan === 'pro' || plan === 'enterprise';
}

/**
 * Engine validation guards the runtime boundary between config data and lazy
 * engine loading.
 */
export function isValidEngineName(engine: unknown): engine is EngineName {
  return engine === 'classic' || engine === 'modern' || engine === 'rustic' || engine === 'custom';
}

const LOWER_KEBAB_TENANT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Public loader requests use one canonical, path-safe tenant identifier. */
export function assertLowerKebabTenantSlug(slug: unknown): asserts slug is string {
  if (typeof slug !== 'string' || !LOWER_KEBAB_TENANT_SLUG.test(slug)) {
    throw new Error('[design-system] Tenant slug must be canonical lower-kebab case.');
  }
}

/**
 * Locale validation stays explicit to avoid accepting arbitrary values that the
 * i18n dictionaries cannot actually serve.
 */
export function isValidLocale(locale: unknown): locale is SupportedLocale {
  return locale === 'es' || locale === 'en' || locale === 'pt' || locale === 'fr' || locale === 'ar';
}

/**
 * Validates the minimum contract required for the DS to render a tenant safely.
 *
 * This does not deep-validate every optional nested object. The goal is to
 * reject clearly invalid payloads at the boundary while keeping the schema
 * light enough for runtime use.
 */
export function isValidTenantConfig(config: unknown): config is TenantConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as TenantConfig;

  // Validation checks the structural contract (required fields, closed enums)
  // but intentionally skips deep validation of optional nested objects like
  // personality, tokenOverrides, and customTranslations. Partial personality
  // objects are valid because the merge chain fills gaps from lower layers.
  return (
      typeof c.slug === 'string' &&
      typeof c.name === 'string' &&
      (c.engine === undefined || isValidEngineName(c.engine)) &&
      typeof c.theme === 'string' &&
      (c.locale === undefined || isValidLocale(c.locale)) &&
      (c.fallbackLocale === undefined || isValidLocale(c.fallbackLocale)) &&
      isValidPlan(c.plan) &&
      Array.isArray(c.features) &&
      isValidBranding(c.branding) &&
      isTenantIdentityAllowed({
        slug: c.slug,
        name: c.name,
        companyName: c.branding?.companyName,
        verticalKey: c.vertical,
      }) &&
      (c.vertical === undefined || typeof c.vertical === 'string') &&
      (c.componentPack === undefined || typeof c.componentPack === 'string')
  );
}

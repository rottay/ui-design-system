import type { MarkSize, MarkVariant } from './types';

export const BRAND_MARK_NAMES = [
  'openai',
  'anthropic',
  'github',
  'google',
  'linkedin',
  'instagram',
  'x',
  'chrome',
] as const;

export type BrandMarkName = (typeof BRAND_MARK_NAMES)[number];

export const CLOUD_PROVIDERS = ['aws'] as const;
export type CloudProvider = (typeof CLOUD_PROVIDERS)[number];

export const CLOUD_SERVICES = ['lambda', 'bedrock', 's3', 'rds'] as const;
export type CloudService = (typeof CLOUD_SERVICES)[number];

export const MARK_VARIANTS = ['color', 'mono', 'light', 'dark', 'wordmark'] as const;

type SourceBrandVariant = 'default' | 'mono' | 'light' | 'dark' | 'wordmark';
export type CloudOpticalVariant = '16' | '32' | '64' | 'default';

interface InternalBrandVariantResolution {
  readonly resolved: MarkVariant;
  readonly sourceVariant: SourceBrandVariant;
}

type InternalBrandVariantMap = Readonly<Record<MarkVariant, InternalBrandVariantResolution>>;

const variants = (
  value: Record<MarkVariant, InternalBrandVariantResolution>,
): InternalBrandVariantMap => Object.freeze(value);

/**
 * Every public variant is resolved per asset before it reaches the renderer.
 * This prevents unsupported supplier values from being passed through and makes
 * each fallback deterministic.
 */
const BRAND_VARIANT_REGISTRY: Readonly<Record<BrandMarkName, InternalBrandVariantMap>> =
  Object.freeze({
    openai: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'light', sourceVariant: 'light' },
      light: { resolved: 'light', sourceVariant: 'light' },
      dark: { resolved: 'dark', sourceVariant: 'dark' },
      wordmark: { resolved: 'wordmark', sourceVariant: 'wordmark' },
    }),
    anthropic: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'mono', sourceVariant: 'mono' },
      light: { resolved: 'light', sourceVariant: 'light' },
      dark: { resolved: 'dark', sourceVariant: 'dark' },
      wordmark: { resolved: 'wordmark', sourceVariant: 'wordmark' },
    }),
    github: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'mono', sourceVariant: 'mono' },
      light: { resolved: 'light', sourceVariant: 'light' },
      dark: { resolved: 'dark', sourceVariant: 'dark' },
      wordmark: { resolved: 'wordmark', sourceVariant: 'wordmark' },
    }),
    google: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'mono', sourceVariant: 'mono' },
      light: { resolved: 'mono', sourceVariant: 'mono' },
      dark: { resolved: 'mono', sourceVariant: 'mono' },
      wordmark: { resolved: 'wordmark', sourceVariant: 'wordmark' },
    }),
    linkedin: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'color', sourceVariant: 'default' },
      light: { resolved: 'color', sourceVariant: 'default' },
      dark: { resolved: 'color', sourceVariant: 'default' },
      wordmark: { resolved: 'wordmark', sourceVariant: 'wordmark' },
    }),
    instagram: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'mono', sourceVariant: 'mono' },
      light: { resolved: 'mono', sourceVariant: 'mono' },
      dark: { resolved: 'mono', sourceVariant: 'mono' },
      wordmark: { resolved: 'wordmark', sourceVariant: 'wordmark' },
    }),
    x: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'mono', sourceVariant: 'mono' },
      light: { resolved: 'mono', sourceVariant: 'mono' },
      dark: { resolved: 'mono', sourceVariant: 'mono' },
      wordmark: { resolved: 'mono', sourceVariant: 'mono' },
    }),
    chrome: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'mono', sourceVariant: 'mono' },
      light: { resolved: 'mono', sourceVariant: 'mono' },
      dark: { resolved: 'mono', sourceVariant: 'mono' },
      wordmark: { resolved: 'color', sourceVariant: 'default' },
    }),
  });

/** Public supplier-free fallback matrix, useful to preview effective variants. */
export const BRAND_MARK_VARIANTS: Readonly<
  Record<BrandMarkName, Readonly<Record<MarkVariant, MarkVariant>>>
> = Object.freeze(
  Object.fromEntries(
    BRAND_MARK_NAMES.map((name) => [
      name,
      Object.freeze(
        Object.fromEntries(
          MARK_VARIANTS.map((variant) => [variant, BRAND_VARIANT_REGISTRY[name][variant].resolved]),
        ) as Record<MarkVariant, MarkVariant>,
      ),
    ]),
  ) as Record<BrandMarkName, Readonly<Record<MarkVariant, MarkVariant>>>,
);

const BRAND_MARK_NAME_SET: ReadonlySet<string> = new Set(BRAND_MARK_NAMES);
const CLOUD_PROVIDER_SET: ReadonlySet<string> = new Set(CLOUD_PROVIDERS);
const CLOUD_SERVICE_SET: ReadonlySet<string> = new Set(CLOUD_SERVICES);
const MARK_VARIANT_SET: ReadonlySet<string> = new Set(MARK_VARIANTS);

export function isBrandMarkName(value: unknown): value is BrandMarkName {
  return typeof value === 'string' && BRAND_MARK_NAME_SET.has(value);
}

export function isCloudProvider(value: unknown): value is CloudProvider {
  return typeof value === 'string' && CLOUD_PROVIDER_SET.has(value);
}

export function isCloudService(value: unknown): value is CloudService {
  return typeof value === 'string' && CLOUD_SERVICE_SET.has(value);
}

export function isMarkVariant(value: unknown): value is MarkVariant {
  return typeof value === 'string' && MARK_VARIANT_SET.has(value);
}

export function getBrandVariantResolution(
  name: BrandMarkName,
  requested: MarkVariant,
): InternalBrandVariantResolution {
  return BRAND_VARIANT_REGISTRY[name][requested];
}

const TOKEN_PIXEL_SIZES: Readonly<Record<Exclude<MarkSize, number>, number>> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/** Picks the purpose-drawn AWS tier whose exported canvas best fits the visual size. */
export function resolveCloudOpticalVariant(size: unknown): CloudOpticalVariant {
  const pixels = typeof size === 'number'
    ? (Number.isFinite(size) && size > 0 ? size : TOKEN_PIXEL_SIZES.md)
    : TOKEN_PIXEL_SIZES[size as keyof typeof TOKEN_PIXEL_SIZES] ?? TOKEN_PIXEL_SIZES.md;

  if (pixels <= 24) return '16';
  if (pixels <= 40) return '32';
  if (pixels <= 64) return 'default';
  return '64';
}

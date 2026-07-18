import {
  BRAND_MARK_NAMES,
  MARK_VARIANTS,
  type BrandMarkName,
  type BrandSourceVariant,
  type MarkVariant,
} from '../../../foundation/catalog';

export interface BrandVariantResolution {
  readonly resolved: MarkVariant;
  readonly sourceVariant: BrandSourceVariant;
}

type BrandVariantMap = Readonly<Record<MarkVariant, BrandVariantResolution>>;

const variants = (value: Record<MarkVariant, BrandVariantResolution>): BrandVariantMap =>
  Object.freeze(value);

/** Complete deterministic fallback registry for the governed brand corpus. */
const BRAND_VARIANT_REGISTRY: Readonly<Record<BrandMarkName, BrandVariantMap>> =
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
    microsoft: variants({
      color: { resolved: 'color', sourceVariant: 'default' },
      mono: { resolved: 'color', sourceVariant: 'default' },
      light: { resolved: 'color', sourceVariant: 'default' },
      dark: { resolved: 'color', sourceVariant: 'default' },
      wordmark: { resolved: 'wordmark', sourceVariant: 'wordmark' },
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

export function getBrandVariantResolution(
  name: BrandMarkName,
  requested: MarkVariant,
): BrandVariantResolution {
  return BRAND_VARIANT_REGISTRY[name][requested];
}

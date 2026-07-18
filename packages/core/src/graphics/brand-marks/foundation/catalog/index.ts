import type { CSSProperties } from 'react';

/** Canonical supplier-independent corpus. Runtime adapters may only consume these names. */
export const BRAND_MARK_NAMES = [
  'openai',
  'anthropic',
  'github',
  'google',
  'linkedin',
  'instagram',
  'x',
  'chrome',
  'microsoft',
] as const;

export type BrandMarkName = (typeof BRAND_MARK_NAMES)[number];

export const CLOUD_PROVIDERS = ['aws'] as const;
export type CloudProvider = (typeof CLOUD_PROVIDERS)[number];

export const CLOUD_SERVICES = ['lambda', 'bedrock', 's3', 'rds'] as const;
export type CloudService = (typeof CLOUD_SERVICES)[number];

export const MARK_VARIANTS = ['color', 'mono', 'light', 'dark', 'wordmark'] as const;
export type MarkVariant = (typeof MARK_VARIANTS)[number];

export type MarkSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MarkSize = MarkSizeToken | number;

/** Supplier-facing variants remain internal to the governed adapter boundary. */
export type BrandSourceVariant = 'default' | 'mono' | 'light' | 'dark' | 'wordmark';
export type CloudOpticalVariant = '16' | '32' | '64' | 'default';

interface MarkVisualProps {
  size?: MarkSize;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

type LabeledMark = {
  /** Non-empty accessible name for an informative mark. */
  label: string;
  decorative?: false;
};

type DecorativeMark = {
  label?: never;
  /** Decorative intent must be explicit. */
  decorative: true;
};

type MarkAccessibility = LabeledMark | DecorativeMark;

export type BrandMarkProps = MarkVisualProps & MarkAccessibility & {
  name: BrandMarkName;
  variant?: MarkVariant;
};

export type CloudServiceMarkProps = MarkVisualProps & MarkAccessibility & {
  provider: CloudProvider;
  service: CloudService;
};

export type MarkLicense = 'MIT' | 'CC0-1.0' | 'CC-BY-ND-2.0';

export interface MarkSourcePackage {
  readonly packageName: string;
  readonly version: string;
}

interface MarkAssetProvenanceBase {
  readonly slug: string;
  readonly title: string;
  readonly license: MarkLicense;
  readonly url: string;
  readonly catalog: MarkSourcePackage;
  readonly renderer: MarkSourcePackage;
  /** Asset licenses and inclusion do not grant rights to use owner trademarks. */
  readonly trademarkNotice: string;
}

export interface BrandMarkProvenance extends MarkAssetProvenanceBase {
  readonly kind: 'brand';
  readonly name: BrandMarkName;
}

export interface CloudServiceMarkProvenance extends MarkAssetProvenanceBase {
  readonly kind: 'cloud-service';
  readonly provider: CloudProvider;
  readonly service: CloudService;
}

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

import type { CSSProperties } from 'react';

import type { BrandMarkName, CloudProvider, CloudService } from './registry';

export type MarkVariant = 'color' | 'mono' | 'light' | 'dark' | 'wordmark';
export type MarkSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MarkSize = MarkSizeToken | number;

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


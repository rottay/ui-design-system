import type { ComponentType } from 'react';

import type { BrandTheme } from '../../../../../../../../foundation/contracts/composition/tenants/themes';

/**
 * A white-label skin for the custom engine.
 *
 * The public declaration lives apart from DOM application so an engine-aware
 * component can consume the lightweight registered-pack seam without retaining
 * the brand-theme compiler in every component bundle.
 */
export interface SkinPack {
  /** Pack key, matched by `TenantConfig.componentPack`. */
  id: string;
  /** Stylesheet targeting stable anatomy/state selectors. */
  css: string;
  /** Bounded raw design-token overrides in the `--ds-*` namespace. */
  tokenOverrides?: Record<string, string | number>;
  /** Premium theme input, compiled once at registration/application time. */
  brandTheme?: BrandTheme;
  /** Optional bespoke component overrides scoped to this pack. */
  components?: Record<string, ComponentType<unknown>>;
}

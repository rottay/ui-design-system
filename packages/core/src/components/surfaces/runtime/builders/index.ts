/**
 * @fileoverview Productive surface configuration builders.
 * @description Small, typed construction boundaries retained only where an
 * application renderer calls them. Responsive defaults live here only when a
 * surface consumes the corresponding contract at runtime.
 */

import type {
  AuthSurfaceConfig,
  FormSurfaceConfig,
  MarketingSurfaceConfig,
} from '../../foundation/contracts';

/**
 * Preserve the productive auth configuration construction boundary.
 *
 * The mobile stacking default is consumed by the shared responsive resolver.
 */
export function createAuthSurfaceConfig(
  config: AuthSurfaceConfig
): AuthSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a form surface config with defaults consumed by the form renderer.
 */
export function createFormSurfaceConfig(
  config: FormSurfaceConfig
): FormSurfaceConfig {
  return {
    ...config,
    visual: {
      maxWidth: '100%',
      hideAsideOnMobile: true,
      mobileActionsSticky: true,
      ...config.visual,
    },
  };
}

/**
 * Preserve the productive marketing configuration construction boundary.
 *
 * The mobile stacking default is consumed by the shared responsive resolver.
 */
export function createMarketingSurfaceConfig(
  config: MarketingSurfaceConfig
): MarketingSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      ...config.visual,
    },
  };
}

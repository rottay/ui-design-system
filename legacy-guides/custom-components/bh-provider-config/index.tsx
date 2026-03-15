/**
 * BhProviderConfig - Main Export
 * AI Provider Management for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhProviderConfigProps } from './core';
import { BH_PROVIDER_CONFIG_DEFAULTS } from './core';
import { BH_PROVIDER_CONFIG_PRESETS } from './presets';

export {
  type BhProviderConfigProps,
  type BhProviderConfigPreset,
  type ProviderItem,
  type ProviderType,
  type ProviderStatus,
  type CircuitBreakerState,
  type TestStatus,
  type ApiKeyInfo,
  type ModelInfo,
  type FallbackChain,
  type TestResult,
  type DragState,
  BH_PROVIDER_CONFIG_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhProviderConfig component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProviderConfig(props: BhProviderConfigProps): React.ReactElement {
  const preset = props.preset ?? BH_PROVIDER_CONFIG_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_PROVIDER_CONFIG_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProviderConfig.displayName = 'BhProviderConfig';

export { DashboardBhProviderConfig, DetailBhProviderConfig } from './presets';

import type { IntegrationHubProps } from './core';
import { INTEGRATION_HUB_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { IntegrationHubProps, IntegrationHubPreset, Integration } from './core';
export { INTEGRATION_HUB_DEFAULTS } from './core';

export function IntegrationHub(props: IntegrationHubProps): React.ReactElement {
  const preset = props.preset ?? INTEGRATION_HUB_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

IntegrationHub.displayName = 'IntegrationHub';

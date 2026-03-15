/**
 * BhAgentAbTest - Main Export
 * A/B test config with split slider and side-by-side metrics
 */

import type { BhAgentAbTestProps } from './core';
import { BH_AGENT_AB_TEST_DEFAULTS } from './core';
import { BH_AGENT_AB_TEST_PRESETS } from './presets';

export {
  type BhAgentAbTestProps,
  type BhAgentAbTestPreset,
  type AbTestVariant,
  BH_AGENT_AB_TEST_DEFAULTS,
} from './core';
export * from './presets';

export function BhAgentAbTest(props: BhAgentAbTestProps): React.ReactElement {
  const preset = props.preset ?? BH_AGENT_AB_TEST_DEFAULTS.preset ?? 'config';
  const PresetComponent = BH_AGENT_AB_TEST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAgentAbTest.displayName = 'BhAgentAbTest';

/**
 * BhAgentTester - Main Export
 * Agent Validation Console for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhAgentTesterProps } from './core';
import { BH_AGENT_TESTER_DEFAULTS } from './core';
import { BH_AGENT_TESTER_PRESETS } from './presets';

export {
  type BhAgentTesterProps,
  type BhAgentTesterPreset,
  type ChatMessage,
  type ChatRole,
  type TestConfig,
  type ValidationCheck,
  type ValidationStatus,
  type TranscriptLine,
  type CostEstimate,
  type AgentInfo,
  type AudioState,
  type AudioPlaybackState,
  BH_AGENT_TESTER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhAgentTester component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAgentTester(props: BhAgentTesterProps): React.ReactElement {
  const preset = props.preset ?? BH_AGENT_TESTER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_AGENT_TESTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAgentTester.displayName = 'BhAgentTester';

export { StandardBhAgentTester } from './presets';

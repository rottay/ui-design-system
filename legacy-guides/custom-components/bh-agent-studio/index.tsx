/**
 * BhAgentStudio - Main Export
 * AI Agent Builder for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhAgentStudioProps } from './core';
import { BH_AGENT_STUDIO_DEFAULTS } from './core';
import { BH_AGENT_STUDIO_PRESETS } from './presets';

export {
  type BhAgentStudioProps,
  type BhAgentStudioPreset,
  type AgentType,
  type VoiceProvider,
  type PersonalityTrait,
  type ScriptSection,
  type ToolConfig,
  type CallSettings,
  type ValidationResult,
  type ValidationStatus,
  type AgentData,
  type VoiceOption,
  type ModelOption,
  BH_AGENT_STUDIO_DEFAULTS,
  DEFAULT_AGENT_DATA,
} from './core';
export * from './presets';

/**
 * BhAgentStudio component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAgentStudio(props: BhAgentStudioProps): React.ReactElement {
  const preset = props.preset ?? BH_AGENT_STUDIO_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_AGENT_STUDIO_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAgentStudio.displayName = 'BhAgentStudio';

export { FullBhAgentStudio, GuidedBhAgentStudio } from './presets';

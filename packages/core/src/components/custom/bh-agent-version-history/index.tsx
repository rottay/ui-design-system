/**
 * BhAgentVersionHistory - Main Export
 * Timeline of agent versions with diff view
 */

import type { BhAgentVersionHistoryProps } from './core';
import { BH_AGENT_VERSION_HISTORY_DEFAULTS } from './core';
import { BH_AGENT_VERSION_HISTORY_PRESETS } from './presets';

export {
  type BhAgentVersionHistoryProps,
  type BhAgentVersionHistoryPreset,
  type AgentVersion,
  BH_AGENT_VERSION_HISTORY_DEFAULTS,
} from './core';
export * from './presets';

export function BhAgentVersionHistory(props: BhAgentVersionHistoryProps): React.ReactElement {
  const preset = props.preset ?? BH_AGENT_VERSION_HISTORY_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BH_AGENT_VERSION_HISTORY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAgentVersionHistory.displayName = 'BhAgentVersionHistory';

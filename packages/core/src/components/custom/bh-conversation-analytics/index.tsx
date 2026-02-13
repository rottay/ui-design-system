/**
 * BhConversationAnalytics - Main Export
 * Conversation volume trends, score distribution, completion rates, and agent performance.
 */

import type { BhConversationAnalyticsProps } from './core';
import { BH_CONVERSATION_ANALYTICS_DEFAULTS } from './core';
import { BH_CONVERSATION_ANALYTICS_PRESETS } from './presets';

export {
  type BhConversationAnalyticsProps,
  type BhConversationAnalyticsPreset,
  type ConversationVolumePoint,
  type ScoreDistribution,
  type AgentPerformance,
  BH_CONVERSATION_ANALYTICS_DEFAULTS,
} from './core';
export * from './presets';

export function BhConversationAnalytics(props: BhConversationAnalyticsProps): React.ReactElement {
  const preset = props.preset ?? BH_CONVERSATION_ANALYTICS_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_CONVERSATION_ANALYTICS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhConversationAnalytics.displayName = 'BhConversationAnalytics';

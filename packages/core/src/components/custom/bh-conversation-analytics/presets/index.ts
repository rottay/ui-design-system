/**
 * BhConversationAnalytics - All Presets
 */

export { DashboardBhConversationAnalytics } from './dashboard';
export { CompactBhConversationAnalytics } from './compact';

import type { BhConversationAnalyticsPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhConversationAnalyticsProps } from '../core';
import { DashboardBhConversationAnalytics } from './dashboard';
import { CompactBhConversationAnalytics } from './compact';

export const BH_CONVERSATION_ANALYTICS_PRESETS: Record<BhConversationAnalyticsPreset, ComponentType<BhConversationAnalyticsProps>> = {
  dashboard: DashboardBhConversationAnalytics,
  compact: CompactBhConversationAnalytics,
};

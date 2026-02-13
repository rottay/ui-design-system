/**
 * BhAgentAbTest - Core Interface
 * A/B test config with split slider and side-by-side metrics
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhAgentAbTestPreset = 'config' | 'compact';

export interface AbTestVariant {
  id: string;
  name: string;
  agentVersionId: string;
  trafficPercent: number;
  metrics: {
    conversations: number;
    avgScore: number;
    completionRate: number;
    avgDuration: number;
  };
}

export interface BhAgentAbTestProps extends EngineAwareProps {
  preset?: BhAgentAbTestPreset;
  testName?: string;
  variants: AbTestVariant[];
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate?: Date;
  endDate?: Date;
  onTrafficChange?: (variantId: string, percent: number) => void;
  onStatusChange?: (status: string) => void;
  selectedVariantId?: string | null;
  onVariantClick?: (variantId: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_AGENT_AB_TEST_DEFAULTS: Partial<BhAgentAbTestProps> = {
  preset: 'config',
};

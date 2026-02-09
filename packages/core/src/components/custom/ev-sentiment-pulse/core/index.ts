import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type SentimentPulsePreset = 'pulse' | 'analysis';

export interface SentimentSignal {
  id: string;
  source: 'chat' | 'social' | 'tips' | 'complaints' | 'survey';
  content: string;
  sentiment: number;
  timestamp: Date;
}

export interface SentimentSummary {
  overallScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  topPositive: string[];
  topNegative: string[];
  aiSummary: string;
}

export interface SentimentPulseProps extends EngineAwareProps {
  preset?: SentimentPulsePreset;
  signals?: SentimentSignal[];
  summary?: SentimentSummary;
  trendingTopics?: string[];
  onSignalClick?: (signalId: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const SENTIMENT_PULSE_DEFAULTS: Required<
  Pick<SentimentPulseProps, 'preset' | 'signals' | 'trendingTopics'>
> = {
  preset: 'pulse',
  signals: [],
  trendingTopics: [],
};

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type FeedbackCollectorPreset = 'survey' | 'results';

export interface FeedbackQuestion {
  id: string;
  type: 'nps' | 'stars' | 'emoji' | 'multiple-choice' | 'text';
  question: string;
  options?: string[];
}

export interface FeedbackResponse {
  id: string;
  questionId: string;
  value: string | number;
  respondentId?: string;
  timestamp: Date;
}

export interface FeedbackSummary {
  questionId: string;
  avgScore?: number;
  distribution?: Record<string, number>;
  wordCloud?: { word: string; count: number }[];
}

export interface FeedbackCollectorProps extends EngineAwareProps {
  preset?: FeedbackCollectorPreset;
  questions?: FeedbackQuestion[];
  responses?: FeedbackResponse[];
  summaries?: FeedbackSummary[];
  eventName?: string;
  onSubmitResponse?: (questionId: string, value: string | number) => void;
  style?: CSSProperties;
  className?: string;
}

export const FEEDBACK_COLLECTOR_DEFAULTS: Required<
  Pick<FeedbackCollectorProps, 'preset' | 'questions' | 'responses' | 'summaries'>
> = {
  preset: 'survey',
  questions: [],
  responses: [],
  summaries: [],
};

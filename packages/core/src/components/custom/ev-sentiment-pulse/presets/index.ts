export { SentimentPulsePulse } from './pulse';
export { SentimentPulseAnalysis } from './analysis';

import type { SentimentPulsePreset } from '../core';
import type { ComponentType } from 'react';
import type { SentimentPulseProps } from '../core';
import { SentimentPulsePulse } from './pulse';
import { SentimentPulseAnalysis } from './analysis';

export const PRESETS: Record<
  SentimentPulsePreset,
  ComponentType<SentimentPulseProps>
> = {
  pulse: SentimentPulsePulse,
  analysis: SentimentPulseAnalysis,
};

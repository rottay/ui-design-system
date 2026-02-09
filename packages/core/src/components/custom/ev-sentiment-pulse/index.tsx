import type { SentimentPulseProps } from './core';
import { SENTIMENT_PULSE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  SentimentPulseProps,
  SentimentSignal,
  SentimentSummary,
  SentimentPulsePreset,
} from './core';

export type EvSentimentPulseProps = SentimentPulseProps;

export function SentimentPulse(props: SentimentPulseProps) {
  const { preset = SENTIMENT_PULSE_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

SentimentPulse.displayName = 'SentimentPulse';

export const EvSentimentPulse = SentimentPulse;
export { SentimentPulsePulse, SentimentPulseAnalysis } from './presets';

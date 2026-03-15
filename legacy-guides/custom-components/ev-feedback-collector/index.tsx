import type { FeedbackCollectorProps } from './core';
import { FEEDBACK_COLLECTOR_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  FeedbackCollectorProps,
  FeedbackQuestion,
  FeedbackResponse,
  FeedbackSummary,
  FeedbackCollectorPreset,
} from './core';

export type EvFeedbackCollectorProps = FeedbackCollectorProps;

export function FeedbackCollector(props: FeedbackCollectorProps) {
  const { preset = FEEDBACK_COLLECTOR_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

FeedbackCollector.displayName = 'FeedbackCollector';

export const EvFeedbackCollector = FeedbackCollector;
export { FeedbackCollectorSurvey, FeedbackCollectorResults } from './presets';

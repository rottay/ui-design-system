/**
 * BhRubricBuilder - Main Export
 * Scoring Rubric Editor for BitHire ATS platform
 */

import type { BhRubricBuilderProps } from './core';
import { BH_RUBRIC_BUILDER_DEFAULTS } from './core';
import { BH_RUBRIC_BUILDER_PRESETS } from './presets';

export {
  type BhRubricBuilderProps,
  type BhRubricBuilderPreset,
  type ScoringDimension,
  type ScoreLevel,
  type ValidationError,
  type RubricStatus,
  type ScorableType,
  BH_RUBRIC_BUILDER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhRubricBuilder component
 * Renders the appropriate preset based on the preset prop
 */
export function BhRubricBuilder(props: BhRubricBuilderProps): React.ReactElement {
  const preset = props.preset ?? BH_RUBRIC_BUILDER_DEFAULTS.preset ?? 'editor';
  const PresetComponent = BH_RUBRIC_BUILDER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRubricBuilder.displayName = 'BhRubricBuilder';

export { EditorBhRubricBuilder, PreviewBhRubricBuilder } from './presets';

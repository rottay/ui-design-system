/**
 * BhTranscriptViewer - Main Export
 * Interview transcript viewer with highlighted evidence from scoring.
 */

import type { BhTranscriptViewerProps } from './core';
import { BH_TRANSCRIPT_VIEWER_DEFAULTS } from './core';
import { BH_TRANSCRIPT_VIEWER_PRESETS } from './presets';

export {
  type BhTranscriptViewerProps,
  type BhTranscriptViewerPreset,
  type TranscriptSegment,
  type TranscriptHighlight,
  type ScoringDimension,
  type TranscriptMeta,
  BH_TRANSCRIPT_VIEWER_DEFAULTS,
} from './core';
export * from './presets';

export function BhTranscriptViewer(props: BhTranscriptViewerProps): React.ReactElement {
  const preset = props.preset ?? BH_TRANSCRIPT_VIEWER_DEFAULTS.preset ?? 'reader';
  const PresetComponent = BH_TRANSCRIPT_VIEWER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTranscriptViewer.displayName = 'BhTranscriptViewer';

export { ReaderBhTranscriptViewer, AnalystBhTranscriptViewer } from './presets';

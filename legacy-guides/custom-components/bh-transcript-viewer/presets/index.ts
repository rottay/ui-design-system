/**
 * BhTranscriptViewer - All Presets
 */

export { ReaderBhTranscriptViewer } from './reader';
export { AnalystBhTranscriptViewer } from './analyst';

import type { BhTranscriptViewerPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTranscriptViewerProps } from '../core';
import { ReaderBhTranscriptViewer } from './reader';
import { AnalystBhTranscriptViewer } from './analyst';

export const BH_TRANSCRIPT_VIEWER_PRESETS: Record<BhTranscriptViewerPreset, ComponentType<BhTranscriptViewerProps>> = {
  reader: ReaderBhTranscriptViewer,
  analyst: AnalystBhTranscriptViewer,
};

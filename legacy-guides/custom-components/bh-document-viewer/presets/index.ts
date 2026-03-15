/**
 * BhDocumentViewer - All Presets
 */

import type { BhDocumentViewerPreset, BhDocumentViewerProps } from '../core';
import type { ComponentType } from 'react';
import { ViewerBhDocumentViewer } from './viewer';
import { CompactBhDocumentViewer } from './compact';

export { ViewerBhDocumentViewer } from './viewer';
export { CompactBhDocumentViewer } from './compact';

export const BH_DOCUMENT_VIEWER_PRESETS: Record<BhDocumentViewerPreset, ComponentType<BhDocumentViewerProps>> = {
  'viewer': ViewerBhDocumentViewer,
  'compact': CompactBhDocumentViewer,
};

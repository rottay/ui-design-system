/**
 * BhDocumentViewer - All Presets
 */

import type { BhDocumentViewerPreset } from '../core';
import { ViewerBhDocumentViewer } from './viewer';
import { CompactBhDocumentViewer } from './compact';

export { ViewerBhDocumentViewer } from './viewer';
export { CompactBhDocumentViewer } from './compact';

export const BH_DOCUMENT_VIEWER_PRESETS: Record<BhDocumentViewerPreset, React.ComponentType<any>> = {
  'viewer': ViewerBhDocumentViewer,
  'compact': CompactBhDocumentViewer,
};

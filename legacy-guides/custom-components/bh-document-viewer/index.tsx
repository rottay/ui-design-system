/**
 * BhDocumentViewer - Main Export
 * PDF/image viewer placeholder with annotation tools
 */

import type { BhDocumentViewerProps } from './core';
import { BH_DOCUMENT_VIEWER_DEFAULTS } from './core';
import { BH_DOCUMENT_VIEWER_PRESETS } from './presets';

export {
  type BhDocumentViewerProps,
  type BhDocumentViewerPreset,
  type DocumentAnnotation,
  BH_DOCUMENT_VIEWER_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhDocumentViewer component
 * Renders the appropriate preset based on the preset prop
 */
export function BhDocumentViewer(props: BhDocumentViewerProps): React.ReactElement {
  const preset = props.preset ?? BH_DOCUMENT_VIEWER_DEFAULTS.preset ?? 'viewer';
  const PresetComponent = BH_DOCUMENT_VIEWER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhDocumentViewer.displayName = 'BhDocumentViewer';

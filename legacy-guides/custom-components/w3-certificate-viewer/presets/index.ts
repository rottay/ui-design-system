/**
 * W3CertificateViewer - All Presets
 */

export { CardW3CertificateViewer } from './card';
export { DocumentW3CertificateViewer } from './document';

import type { W3CertificateViewerPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3CertificateViewerProps } from '../core';
import { CardW3CertificateViewer } from './card';
import { DocumentW3CertificateViewer } from './document';

export const W3_CERTIFICATE_VIEWER_PRESETS: Record<W3CertificateViewerPreset, ComponentType<W3CertificateViewerProps>> = {
  card: CardW3CertificateViewer,
  document: DocumentW3CertificateViewer,
};

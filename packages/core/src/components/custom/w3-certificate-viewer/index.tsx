/**
 * W3CertificateViewer - Main Export
 * View blockchain-verified certificates with QR codes and verification status
 */

import type { W3CertificateViewerProps } from './core';
import { W3_CERTIFICATE_VIEWER_DEFAULTS } from './core';
import { W3_CERTIFICATE_VIEWER_PRESETS } from './presets';

export { type W3CertificateViewerProps, type W3CertificateViewerPreset, W3_CERTIFICATE_VIEWER_DEFAULTS } from './core';
export * from './presets';

export function W3CertificateViewer(props: W3CertificateViewerProps): React.ReactElement {
  const preset = props.preset ?? W3_CERTIFICATE_VIEWER_DEFAULTS.preset ?? 'card';
  const PresetComponent = W3_CERTIFICATE_VIEWER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3CertificateViewer.displayName = 'W3CertificateViewer';

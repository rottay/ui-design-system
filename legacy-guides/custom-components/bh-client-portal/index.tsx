/**
 * BhClientPortal - Main Export
 * Simplified read-only dashboard for external clients.
 */

import type { BhClientPortalProps } from './core';
import { BH_CLIENT_PORTAL_DEFAULTS } from './core';
import { BH_CLIENT_PORTAL_PRESETS } from './presets';

export {
  type BhClientPortalProps,
  type BhClientPortalPreset,
  type ClientPosition,
  type ClientPipelineStage,
  type ClientInterview,
  type ClientMetrics,
  type ClientInfo,
  BH_CLIENT_PORTAL_DEFAULTS,
} from './core';
export * from './presets';

export function BhClientPortal(props: BhClientPortalProps): React.ReactElement {
  const preset = props.preset ?? BH_CLIENT_PORTAL_DEFAULTS.preset ?? 'executive';
  const PresetComponent = BH_CLIENT_PORTAL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhClientPortal.displayName = 'BhClientPortal';

export { ExecutiveBhClientPortal, OperationalBhClientPortal } from './presets';

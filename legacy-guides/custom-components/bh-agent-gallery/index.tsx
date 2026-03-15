/**
 * BhAgentGallery - Main Export
 * Agent Browse & Select for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhAgentGalleryProps } from './core';
import { BH_AGENT_GALLERY_DEFAULTS } from './core';
import { BH_AGENT_GALLERY_PRESETS } from './presets';

export {
  type BhAgentGalleryProps,
  type BhAgentGalleryPreset,
  type AgentTab,
  type AgentStatus,
  type AgentType,
  type AgentSummary,
  type AgentPreview,
  type AgentFilter,
  type AgentViewMode,
  BH_AGENT_GALLERY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhAgentGallery component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAgentGallery(props: BhAgentGalleryProps): React.ReactElement {
  const preset = props.preset ?? BH_AGENT_GALLERY_DEFAULTS.preset ?? 'gallery';
  const PresetComponent = BH_AGENT_GALLERY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAgentGallery.displayName = 'BhAgentGallery';

export { GalleryBhAgentGallery, ListBhAgentGallery } from './presets';

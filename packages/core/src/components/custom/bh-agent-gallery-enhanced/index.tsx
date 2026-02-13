/**
 * BhAgentGalleryEnhanced - Main Export
 * Enhanced agent card gallery with search, filters, usage stats
 * Automatically selects preset based on props
 */

import type { BhAgentGalleryEnhancedProps } from './core';
import { BH_AGENT_GALLERY_ENHANCED_DEFAULTS } from './core';
import { BH_AGENT_GALLERY_ENHANCED_PRESETS } from './presets';

export {
  type BhAgentGalleryEnhancedProps,
  type BhAgentGalleryEnhancedPreset,
  type AgentCard,
  BH_AGENT_GALLERY_ENHANCED_DEFAULTS,
} from './core';
export * from './presets';

export function BhAgentGalleryEnhanced(props: BhAgentGalleryEnhancedProps): React.ReactElement {
  const preset = props.preset ?? BH_AGENT_GALLERY_ENHANCED_DEFAULTS.preset ?? 'gallery';
  const PresetComponent = BH_AGENT_GALLERY_ENHANCED_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAgentGalleryEnhanced.displayName = 'BhAgentGalleryEnhanced';

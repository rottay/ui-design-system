/**
 * BhMessageTemplateGallery - Main Export
 * Browse/search templates with preview and usage stats for BitHire ATS platform
 */

import type { BhMessageTemplateGalleryProps } from './core';
import { BH_MESSAGE_TEMPLATE_GALLERY_DEFAULTS } from './core';
import { BH_MESSAGE_TEMPLATE_GALLERY_PRESETS } from './presets';

export {
  type BhMessageTemplateGalleryProps,
  type BhMessageTemplateGalleryPreset,
  type MessageTemplate,
  BH_MESSAGE_TEMPLATE_GALLERY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhMessageTemplateGallery component
 * Renders the appropriate preset based on the preset prop
 */
export function BhMessageTemplateGallery(props: BhMessageTemplateGalleryProps): React.ReactElement {
  const preset = props.preset ?? BH_MESSAGE_TEMPLATE_GALLERY_DEFAULTS.preset ?? 'gallery';
  const PresetComponent = BH_MESSAGE_TEMPLATE_GALLERY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhMessageTemplateGallery.displayName = 'BhMessageTemplateGallery';

export { GalleryBhMessageTemplateGallery, CompactBhMessageTemplateGallery } from './presets';

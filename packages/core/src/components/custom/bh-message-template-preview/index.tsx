/**
 * BhMessageTemplatePreview - Main Export
 * Template preview with sample data for BitHire ATS platform
 */

import type { BhMessageTemplatePreviewProps } from './core';
import { BH_MESSAGE_TEMPLATE_PREVIEW_DEFAULTS } from './core';
import { BH_MESSAGE_TEMPLATE_PREVIEW_PRESETS } from './presets';

export {
  type BhMessageTemplatePreviewProps,
  type BhMessageTemplatePreviewPreset,
  BH_MESSAGE_TEMPLATE_PREVIEW_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhMessageTemplatePreview component
 * Renders the appropriate preset based on the preset prop
 */
export function BhMessageTemplatePreview(props: BhMessageTemplatePreviewProps): React.ReactElement {
  const preset = props.preset ?? BH_MESSAGE_TEMPLATE_PREVIEW_DEFAULTS.preset ?? 'preview';
  const PresetComponent = BH_MESSAGE_TEMPLATE_PREVIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhMessageTemplatePreview.displayName = 'BhMessageTemplatePreview';

export { PreviewBhMessageTemplatePreview, CompactBhMessageTemplatePreview } from './presets';

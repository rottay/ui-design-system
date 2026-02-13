/**
 * BhMessageTemplatePreview - All Presets
 */

export { PreviewBhMessageTemplatePreview } from './preview';
export { CompactBhMessageTemplatePreview } from './compact';

import type { BhMessageTemplatePreviewPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhMessageTemplatePreviewProps } from '../core';
import { PreviewBhMessageTemplatePreview } from './preview';
import { CompactBhMessageTemplatePreview } from './compact';

export const BH_MESSAGE_TEMPLATE_PREVIEW_PRESETS: Record<BhMessageTemplatePreviewPreset, ComponentType<BhMessageTemplatePreviewProps>> = {
  preview: PreviewBhMessageTemplatePreview,
  compact: CompactBhMessageTemplatePreview,
};

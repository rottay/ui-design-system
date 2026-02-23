/**
 * BhTemplateDesigner - All Presets
 */

import type { BhTemplateDesignerPreset, BhTemplateDesignerProps } from '../core';
import type { ComponentType } from 'react';
import { CanvasBhTemplateDesigner } from './canvas';
import { FormBhTemplateDesigner } from './form';

export { CanvasBhTemplateDesigner } from './canvas';
export { FormBhTemplateDesigner } from './form';

export const BH_TEMPLATE_DESIGNER_PRESETS: Record<BhTemplateDesignerPreset, ComponentType<BhTemplateDesignerProps>> = {
  canvas: CanvasBhTemplateDesigner,
  form: FormBhTemplateDesigner,
};

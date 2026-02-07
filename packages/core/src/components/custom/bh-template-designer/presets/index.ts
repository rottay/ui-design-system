/**
 * BhTemplateDesigner - All Presets
 */

import type { BhTemplateDesignerPreset } from '../core';
import { CanvasBhTemplateDesigner } from './canvas';
import { FormBhTemplateDesigner } from './form';

export { CanvasBhTemplateDesigner } from './canvas';
export { FormBhTemplateDesigner } from './form';

export const BH_TEMPLATE_DESIGNER_PRESETS: Record<BhTemplateDesignerPreset, React.ComponentType<any>> = {
  canvas: CanvasBhTemplateDesigner,
  form: FormBhTemplateDesigner,
};

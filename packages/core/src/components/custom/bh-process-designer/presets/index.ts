/**
 * BhProcessDesigner - All Presets
 */

export { VisualBhProcessDesigner } from './visual';
export { CompactBhProcessDesigner } from './compact';

import type { BhProcessDesignerPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhProcessDesignerProps } from '../core';
import { VisualBhProcessDesigner } from './visual';
import { CompactBhProcessDesigner } from './compact';

export const BH_PROCESS_DESIGNER_PRESETS: Record<BhProcessDesignerPreset, ComponentType<BhProcessDesignerProps>> = {
  visual: VisualBhProcessDesigner,
  compact: CompactBhProcessDesigner,
};

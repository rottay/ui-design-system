/**
 * EvScreenController - All Presets
 */

export { EditorEvScreenController } from './editor';
export { PreviewEvScreenController } from './preview';

import type { EvScreenControllerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvScreenControllerProps } from '../core';
import { EditorEvScreenController } from './editor';
import { PreviewEvScreenController } from './preview';

export const EV_SCREEN_CONTROLLER_PRESETS: Record<EvScreenControllerPreset, ComponentType<EvScreenControllerProps>> = {
  editor: EditorEvScreenController,
  preview: PreviewEvScreenController,
};

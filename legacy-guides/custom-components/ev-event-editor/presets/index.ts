/**
 * EvEventEditor - All Presets
 */

export { WizardEvEventEditor } from './wizard';
export { SinglePageEvEventEditor } from './single-page';

import type { EvEventEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvEventEditorProps } from '../core';
import { WizardEvEventEditor } from './wizard';
import { SinglePageEvEventEditor } from './single-page';

export const EV_EVENT_EDITOR_PRESETS: Record<EvEventEditorPreset, ComponentType<EvEventEditorProps>> = {
  wizard: WizardEvEventEditor,
  'single-page': SinglePageEvEventEditor,
};

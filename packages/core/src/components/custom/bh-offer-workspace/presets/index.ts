/**
 * BhOfferWorkspace - All Presets
 */

import type { BhOfferWorkspacePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhOfferWorkspaceProps } from '../core';
import { EditorBhOfferWorkspace } from './editor';
import { TrackerBhOfferWorkspace } from './tracker';

export { EditorBhOfferWorkspace } from './editor';
export { TrackerBhOfferWorkspace } from './tracker';

export const BH_OFFER_WORKSPACE_PRESETS: Record<BhOfferWorkspacePreset, ComponentType<BhOfferWorkspaceProps>> = {
  editor: EditorBhOfferWorkspace,
  tracker: TrackerBhOfferWorkspace,
};

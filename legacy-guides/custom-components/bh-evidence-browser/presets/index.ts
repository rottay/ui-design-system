/**
 * BhEvidenceBrowser - All Presets
 */

import type { BhEvidenceBrowserPreset, BhEvidenceBrowserProps } from '../core';
import type { ComponentType } from 'react';
import { SplitPaneBhEvidenceBrowser } from './split-pane';
import { CompactBhEvidenceBrowser } from './compact';

export { SplitPaneBhEvidenceBrowser } from './split-pane';
export { CompactBhEvidenceBrowser } from './compact';

export const BH_EVIDENCE_BROWSER_PRESETS: Record<BhEvidenceBrowserPreset, ComponentType<BhEvidenceBrowserProps>> = {
  'split-pane': SplitPaneBhEvidenceBrowser,
  compact: CompactBhEvidenceBrowser,
};

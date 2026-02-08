/**
 * BhEvidenceBrowser - All Presets
 */

import type { BhEvidenceBrowserPreset } from '../core';
import { SplitPaneBhEvidenceBrowser } from './split-pane';
import { CompactBhEvidenceBrowser } from './compact';

export { SplitPaneBhEvidenceBrowser } from './split-pane';
export { CompactBhEvidenceBrowser } from './compact';

export const BH_EVIDENCE_BROWSER_PRESETS: Record<BhEvidenceBrowserPreset, React.ComponentType<any>> = {
  'split-pane': SplitPaneBhEvidenceBrowser,
  compact: CompactBhEvidenceBrowser,
};

/**
 * BhEvidenceBrowser - Main Export
 * Split-pane transcript + evidence highlighting for dm-scoring Evidence entities.
 */

import type { BhEvidenceBrowserProps } from './core';
import { BH_EVIDENCE_BROWSER_DEFAULTS } from './core';
import { BH_EVIDENCE_BROWSER_PRESETS } from './presets';

export {
  type BhEvidenceBrowserProps,
  type BhEvidenceBrowserPreset,
  type EvidenceItem,
  type TranscriptSegment,
  type EvidenceImpact,
  type SpeakerRole,
  type EvidenceFilter,
  BH_EVIDENCE_BROWSER_DEFAULTS,
  IMPACT_OPTIONS,
  getImpactColors,
  getImpactLabel,
  getImpactIcon,
  getSpeakerColors,
} from './core';
export * from './presets';

export function BhEvidenceBrowser(props: BhEvidenceBrowserProps): React.ReactElement {
  const preset = props.preset ?? BH_EVIDENCE_BROWSER_DEFAULTS.preset ?? 'split-pane';
  const PresetComponent = BH_EVIDENCE_BROWSER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhEvidenceBrowser.displayName = 'BhEvidenceBrowser';

export { SplitPaneBhEvidenceBrowser, CompactBhEvidenceBrowser } from './presets';

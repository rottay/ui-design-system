/**
 * BhGhostRiskPanel - Main Export
 * Dashboard panel showing candidate ghost risk scores and intervention controls.
 */

import type { BhGhostRiskPanelProps } from './core';
import { BH_GHOST_RISK_PANEL_DEFAULTS } from './core';
import { BH_GHOST_RISK_PANEL_PRESETS } from './presets';

export {
  type BhGhostRiskPanelProps,
  type BhGhostRiskPanelPreset,
  type GhostRiskCandidate,
  type GhostRiskStats,
  type RiskLevel,
  type TrendDirection,
  BH_GHOST_RISK_PANEL_DEFAULTS,
  getRiskLevelColor,
  getRiskLevelBgColor,
  getRiskLevelBorderColor,
  getRiskLevelLabel,
  getTrendInfo,
} from './core';
export * from './presets';

export function BhGhostRiskPanel(props: BhGhostRiskPanelProps): React.ReactElement {
  const preset = props.preset ?? BH_GHOST_RISK_PANEL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = BH_GHOST_RISK_PANEL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhGhostRiskPanel.displayName = 'BhGhostRiskPanel';

export { PanelBhGhostRiskPanel } from './presets';

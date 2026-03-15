/**
 * BhGhostRiskPanel - All Presets
 */

import type { BhGhostRiskPanelPreset, BhGhostRiskPanelProps } from '../core';
import type { ComponentType } from 'react';
import { PanelBhGhostRiskPanel } from './panel';

export { PanelBhGhostRiskPanel } from './panel';

export const BH_GHOST_RISK_PANEL_PRESETS: Record<BhGhostRiskPanelPreset, ComponentType<BhGhostRiskPanelProps>> = {
  panel: PanelBhGhostRiskPanel,
};

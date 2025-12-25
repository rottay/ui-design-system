/**
 * DashboardCard - Main Export
 */

// import React from 'react';
import type { DashboardCardProps } from './core';
import { DASHBOARD_CARD_DEFAULTS } from './core';
import { DASHBOARD_CARD_PRESETS } from './presets';

export { type DashboardCardProps, type DashboardCardPreset, type TrendDirection, DASHBOARD_CARD_DEFAULTS } from './core';
export * from './presets';

export function DashboardCard(props: DashboardCardProps): React.ReactElement {
  const preset = props.preset ?? DASHBOARD_CARD_DEFAULTS.preset ?? 'trending';
  const PresetComponent = DASHBOARD_CARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

DashboardCard.displayName = 'DashboardCard';

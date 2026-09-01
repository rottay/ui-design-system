/**
 * @fileoverview DashboardHeader contracts — the type surface both engines
 * render against.
 *
 * @module Structures/Headers/DashboardHeader/Contracts
 * @category Structure
 * @package @rottay/design-system
 */

import { type ReactNode } from 'react';

/** A compact KPI shown alongside the page identity. */
export interface DashboardMetric {
  key: string;
  label: string;
  value: string | number;
  change?: {
    value: string;
    direction: 'up' | 'down' | 'flat';
  };
  icon?: ReactNode;
}

/** A utility action rendered in the header's action cluster. */
export interface DashboardAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'default';
}

/** Operational connection states a dashboard header can advertise. */
export type DashboardStatusState = 'live' | 'connected' | 'syncing' | 'offline' | 'warning';

export interface DashboardHeaderProps {
  /** Page title. */
  title: string;
  /** Subtitle or context line. */
  subtitle?: string;
  /** Compact KPI metrics displayed alongside the title. */
  metrics?: DashboardMetric[];
  /** Status indicator (live/connected/syncing/offline). */
  status?: {
    state: DashboardStatusState;
    label?: string;
  };
  /** Utility actions (right side). */
  actions?: DashboardAction[];
  /** Search slot rendered in the header. */
  searchSlot?: ReactNode;
  /** Time range selector slot. */
  timeRangeSlot?: ReactNode;
  /** When true, renders a compact single-row header (for phone breakpoints). */
  compact?: boolean;
  /** Optional icon next to the title. */
  icon?: ReactNode;
}

/**
 * English floors for the status labels; the `dashboard_status_*` catalog keys
 * override them when an I18nProvider is mounted.
 */
export const STATUS_LABEL_FLOOR: Record<DashboardStatusState, string> = {
  live: 'Live',
  connected: 'Connected',
  syncing: 'Syncing',
  offline: 'Offline',
  warning: 'Warning',
};

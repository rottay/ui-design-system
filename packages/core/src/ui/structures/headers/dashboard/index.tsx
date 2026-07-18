'use client';

/**
 * @fileoverview DashboardHeader -- structures-tier dashboard/overview page header.
 *
 * @description
 * Engine-free header for operational cockpit pages: dashboards, analytics views,
 * real-time monitors, event-day command centers. Unlike CollectionHeader (hero
 * title + action cluster) or DetailHeader (entity breadcrumbs + tabs), DashboardHeader
 * provides metric/status slots alongside the title for at-a-glance KPIs.
 *
 * Features:
 *   - Title + subtitle
 *   - Metric cards row (compact KPI chips)
 *   - Status indicator (live/connected/syncing)
 *   - Utility actions (right side)
 *   - Search slot
 *   - Compact mode for phone breakpoints
 *   - Optional time range selector slot
 *
 * Domain-agnostic: all copy and data come from props.
 */

import { type ReactNode } from 'react';
import { Box, Button, Flex, Text } from '../../../primitives';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

export interface DashboardAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'default';
}

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

// ---------------------------------------------------------------------------
// Status indicator
// ---------------------------------------------------------------------------

function StatusDot({ state, label }: { state: DashboardStatusState; label?: string }) {
  return (
    <Flex
      data-part="status-dot"
      data-state={state}
      align="center"
      gap={2}
      style={{
        padding: '2px 10px',
      }}
    >
      <Box
        data-part="status-dot-glyph"
        data-state={state}
        style={{
          width: 6,
          height: 6,
          flexShrink: 0,
          animation: state === 'live' || state === 'syncing' ? 'ds-foundation-pulse 2s infinite' : undefined,
        }}
      />
      <Text data-part="status-dot-text" data-state={state} size="xs" style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
        {label ?? state.charAt(0).toUpperCase() + state.slice(1)}
      </Text>
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// Metric chip
// ---------------------------------------------------------------------------

function MetricChip({ metric }: { metric: DashboardMetric }) {
  return (
    <Flex
      data-part="metric-chip"
      align="center"
      gap={2}
      style={{
        padding: '6px 12px',
      }}
    >
      {metric.icon && (
        <Box data-part="metric-chip-icon" style={{ flexShrink: 0 }}>
          {metric.icon}
        </Box>
      )}
      <Box>
        <Text data-part="metric-chip-label" size="xs" color="muted" style={{ lineHeight: 1.2 }}>
          {metric.label}
        </Text>
        <Flex align="baseline" gap={1}>
          <Text data-part="metric-chip-value" size="sm" weight="semibold" style={{ lineHeight: 1.2 }}>
            {metric.value}
          </Text>
          {metric.change && (
            <Text data-part="metric-chip-change" data-direction={metric.change.direction} size="xs" style={{ lineHeight: 1.2 }}>
              {metric.change.direction === 'up' ? '+' : metric.change.direction === 'down' ? '-' : ''}
              {metric.change.value}
            </Text>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// DashboardHeader
// ---------------------------------------------------------------------------

export function DashboardHeader({
  title,
  subtitle,
  metrics,
  status,
  actions,
  searchSlot,
  timeRangeSlot,
  compact,
  icon,
}: DashboardHeaderProps) {
  // ---------- Compact mode (phone) ----------
  if (compact) {
    return (
      <Box
        data-part="root"
        data-compact="true"
        className="ds-structure ds-dashboard-header"
        as="header"
        role="banner"
        aria-label={title}
        style={{
          padding: 'var(--ds-spacing-sm, 8px) var(--ds-spacing-md, 16px)',
        }}
      >
        <Flex justify="between" align="center" gap={3}>
          <Flex align="center" gap={2} style={{ flex: 1, minWidth: 0 }}>
            {icon && <Box data-part="icon" aria-hidden="true" style={{ flexShrink: 0 }}>{icon}</Box>}
            <Text data-part="title" size="md" weight="semibold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </Text>
            {status && <StatusDot state={status.state} label={status.label} />}
          </Flex>
          {actions && actions.length > 0 && (
            <Box
              data-part="actions"
              role="toolbar"
              aria-label="Actions"
              style={{ display: 'flex', gap: 4 }}
            >
              {actions.slice(0, 2).map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant === 'primary' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={action.onClick}
                  aria-label={action.label}
                  className="ds-dashboard-header__action"
                >
                  {action.icon ?? action.label}
                </Button>
              ))}
            </Box>
          )}
        </Flex>
        {/* Scrollable metric chips in compact */}
        {metrics && metrics.length > 0 && (
          <Box
            data-part="metrics-row"
            data-compact="true"
            role="group"
            aria-label="Key metrics"
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 8,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 2,
            }}
          >
            {metrics.map((m) => (
              <MetricChip key={m.key} metric={m} />
            ))}
          </Box>
        )}
      </Box>
    );
  }

  // ---------- Full mode (desktop / tablet) ----------
  return (
    <Box
      data-part="root"
      data-compact="false"
      className="ds-structure ds-dashboard-header"
      as="header"
      role="banner"
      aria-label={title}
      style={{
        padding: 'var(--ds-spacing-md, 16px) var(--ds-spacing-lg, 24px)',
      }}
    >
      {/* Row 1: title + status + actions */}
      <Flex justify="between" align="center" gap={4} style={{ marginBottom: metrics || searchSlot || timeRangeSlot ? 12 : 0 }}>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap={3}>
            {icon && <Box data-part="icon" aria-hidden="true" style={{ flexShrink: 0 }}>{icon}</Box>}
            <Box>
              <Flex align="center" gap={2}>
                <Text data-part="title" size="xl" weight="semibold">{title}</Text>
                {status && <StatusDot state={status.state} label={status.label} />}
              </Flex>
              {subtitle && (
                <Text data-part="subtitle" size="sm" color="muted" style={{ marginTop: 2 }}>{subtitle}</Text>
              )}
            </Box>
          </Flex>
        </Box>

        <Flex data-part="actions" align="center" gap={3}>
          {timeRangeSlot}
          {searchSlot}
          {actions && actions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant === 'primary' ? 'primary' : action.variant === 'secondary' ? 'default' : 'ghost'}
              size="sm"
              onClick={action.onClick}
              icon={action.icon}
              className="ds-dashboard-header__action"
            >
              {action.label}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Row 2: metric chips */}
      {metrics && metrics.length > 0 && (
        <Box data-part="metrics-row" data-compact="false" role="group" aria-label="Key metrics" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {metrics.map((m) => (
            <MetricChip key={m.key} metric={m} />
          ))}
        </Box>
      )}
    </Box>
  );
}

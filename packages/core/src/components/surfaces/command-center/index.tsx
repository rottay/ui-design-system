/**
 * @fileoverview CommandCenterSurface - entry point dashboard for managers/admins.
 *
 * Composes: KPI strip + quick actions + recent activity + flexible body sections.
 * For: admin dashboards, manager cockpits, recruiter hubs, event control rooms.
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Box } from '../../primitives/layout/Box';
import { Stack } from '../../primitives/layout/Stack';
import { Flex } from '../../primitives/layout/Flex';
import { Text } from '../../primitives/display/Typography';
import { PatternStatsGrid } from '../../patterns/stats-grid';
import type { StatDef } from '../../patterns/types';
import { PatternActivityLog } from '../../patterns/activity-log';
import type { Activity } from '../../patterns/activity-log/ActivityLog.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatItem {
  key: string;
  label: string;
  value: string | number;
  change?: { value: number; direction: 'up' | 'down' | 'flat' };
  icon?: ReactNode;
}

export interface QuickAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'default';
}

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
  icon?: ReactNode;
}

export interface CommandSection {
  key: string;
  title?: string;
  span?: 1 | 2 | 3;
  render: () => ReactNode;
}

export interface InsightItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export interface CommandCenterSurfaceProps {
  /** Page title. */
  title: string;
  /** Optional greeting (e.g., "Good morning, Daniel"). */
  greeting?: string;
  /** KPI stats strip. */
  stats?: StatItem[];
  /** Primary quick actions. */
  quickActions?: QuickAction[];
  /** Recent activity feed. */
  recentActivity?: {
    items: ActivityItem[];
    viewAllHref?: string;
    onViewAll?: () => void;
  };
  /** Insights/alerts banner. */
  insights?: InsightItem[];
  /** Body sections (flexible grid). */
  sections?: CommandSection[];
  /** Header/footer slots. */
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  /** Loading state. */
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

function mapChangeDirection(
  direction: 'up' | 'down' | 'flat',
): 'increase' | 'decrease' | 'neutral' {
  if (direction === 'up') return 'increase';
  if (direction === 'down') return 'decrease';
  return 'neutral';
}

function mapStatsToStatDefs(stats: StatItem[]): StatDef[] {
  return stats.map((stat) => ({
    key: stat.key,
    label: stat.label,
    value: stat.value,
    icon: stat.icon,
    change: stat.change ? Math.abs(stat.change.value) : undefined,
    changeType: stat.change
      ? mapChangeDirection(stat.change.direction)
      : undefined,
    suffix: stat.change ? '%' : undefined,
  }));
}

function mapActivityItems(items: ActivityItem[]): Activity[] {
  return items.map((item) => ({
    id: item.id,
    user: { name: '' },
    action: item.text,
    timestamp: item.timestamp,
    metadata: item.icon ? { icon: item.icon } : undefined,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandCenterSurface(props: CommandCenterSurfaceProps) {
  const {
    title,
    greeting,
    stats,
    quickActions,
    recentActivity,
    insights,
    sections,
    headerSlot,
    footerSlot,
    loading,
  } = props;

  return (
    <Stack spacing="lg">
      {headerSlot}

      {/* Header with greeting */}
      <Box>
        {greeting && <Text size="sm" color="muted">{greeting}</Text>}
        <Text size="xl" weight="semibold">{title}</Text>
      </Box>

      {/* Insights/alerts */}
      {insights && insights.length > 0 && (
        <Stack spacing="sm">
          {insights.map((insight) => (
            <Flex
              key={insight.id}
              align="center"
              gap={3}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--ds-radius-md, 8px)',
                border: `1px solid var(--ds-color-${insight.type}, var(--ds-color-border-primary))`,
                background: `var(--ds-color-${insight.type}-bg, var(--ds-color-bg-secondary))`,
              }}
            >
              <Box style={{ flex: 1 }}>
                <Text size="sm" weight="medium">{insight.title}</Text>
                {insight.description && <Text size="xs" color="muted">{insight.description}</Text>}
              </Box>
              {insight.action && (
                <button
                  onClick={insight.action.onClick}
                  style={{
                    padding: '4px 12px',
                    border: '1px solid var(--ds-color-border-primary)',
                    borderRadius: 'var(--ds-radius-sm, 6px)',
                    background: 'transparent',
                    color: 'var(--ds-color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {insight.action.label}
                </button>
              )}
            </Flex>
          ))}
        </Stack>
      )}

      {/* Stats strip */}
      {(stats && stats.length > 0) || loading ? (
        <PatternStatsGrid
          loading={loading}
          stats={stats && stats.length > 0 ? mapStatsToStatDefs(stats) : []}
          columns={stats ? Math.min(stats.length, 4) : 4}
          variant="outlined"
        />
      ) : null}

      {/* Quick actions */}
      {quickActions && quickActions.length > 0 && (
        <Flex gap={2} wrap="wrap">
          {quickActions.map((action) => (
            <button
              key={action.key}
              onClick={action.onClick}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--ds-color-border-primary)',
                borderRadius: 'var(--ds-radius-md, 8px)',
                background: action.variant === 'primary'
                  ? 'var(--ds-color-primary)'
                  : 'var(--ds-color-bg-secondary)',
                color: action.variant === 'primary'
                  ? 'var(--ds-color-text-on-primary, #fff)'
                  : 'var(--ds-color-text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
              }}
            >
              {action.icon && <span style={{ marginRight: '6px' }}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </Flex>
      )}

      {/* Recent activity */}
      {((recentActivity && recentActivity.items.length > 0) || loading) && (
        <Box>
          <Flex
            align="center"
            style={{ marginBottom: '8px' }}
          >
            <Text size="sm" weight="medium" style={{ flex: 1 }}>Recent Activity</Text>
            {recentActivity?.viewAllHref && !recentActivity.onViewAll && (
              <a
                href={recentActivity.viewAllHref}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ds-color-primary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                View all
              </a>
            )}
            {recentActivity?.onViewAll && (
              <button
                onClick={() => {
                  if (recentActivity.onViewAll) {
                    recentActivity.onViewAll();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ds-color-primary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                View all
              </button>
            )}
          </Flex>
          <PatternActivityLog
            loading={loading}
            activities={recentActivity ? mapActivityItems(recentActivity.items.slice(0, 5)) : []}
            emptyMessage="No recent activity."
          />
        </Box>
      )}

      {/* Body sections */}
      {sections && sections.length > 0 && (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {sections.map((section) => (
            <Box
              key={section.key}
              style={{
                gridColumn: section.span ? `span ${section.span}` : undefined,
              }}
            >
              {section.title && (
                <Text size="sm" weight="medium" style={{ marginBottom: '12px' }}>{section.title}</Text>
              )}
              {section.render()}
            </Box>
          ))}
        </Box>
      )}

      {footerSlot}
    </Stack>
  );
}

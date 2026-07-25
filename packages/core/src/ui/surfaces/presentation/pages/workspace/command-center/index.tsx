/**
 * @fileoverview CommandCenterSurface - entry point dashboard for managers/admins.
 *
 * Composes: KPI strip + quick actions + recent activity + flexible body sections.
 * For: admin dashboards, manager cockpits, recruiter hubs, event control rooms.
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Box } from '../../../../../primitives/layout/Box';
import { Stack } from '../../../../../primitives/layout/Stack';
import { Flex } from '../../../../../primitives/layout/Flex';
import { Text } from '../../../../../primitives/display/Typography';
import { Card } from '../../../../../primitives/display/Card';
import { Button } from '../../../../../primitives/inputs/Button';
import { Skeleton } from '../../../../../primitives/feedback/Skeleton';
import { PatternStatsGrid } from '../../../../../patterns/data/stats-grid';
import type { StatDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import { PatternActivityLog } from '../../../../../patterns/communication/activity-log';
import type { Activity } from '../../../../../patterns/communication/activity-log/contracts';

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
  description?: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'default';
}

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
  /** Optional icon for use with custom `renderActivity`. Not consumed by the default ActivityLog renderer. */
  icon?: ReactNode;
  /** The user/actor who performed the action. */
  user?: { name: string; avatar?: string };
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
    user: item.user ?? { name: 'System' },
    action: item.text,
    timestamp: item.timestamp,
    // icon is available on ActivityItem for custom renderActivity implementations
    // but is not passed to metadata since the default ActivityLog renderer does not consume it.
  }));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InsightCard({ insight }: { insight: InsightItem }) {
  return (
    <Card className="ds-command-center__insight-card" variant="outlined">
      <Card.Body>
        <Flex
          className="ds-command-center__insight-tile"
          data-part="insight-tile"
          data-tone={insight.type}
          align="center"
          gap={3}
        >
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text className="ds-command-center__insight-title" data-part="insight-title" size="sm" weight="medium">{insight.title}</Text>
            {insight.description && (
              <Text
                className="ds-command-center__muted-text"
                size="xs"
                color="muted"
                style={{ marginTop: 'var(--ds-spacing-xs, 4px)' }}
              >
                {insight.description}
              </Text>
            )}
          </Box>
          {insight.action && (
            <Button
              size="xs"
              variant="secondary"
              onClick={insight.action.onClick}
            >
              {insight.action.label}
            </Button>
          )}
        </Flex>
      </Card.Body>
    </Card>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Card
      className="ds-command-center__quick-action-card"
      variant="outlined"
      style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease, border-color 0.15s ease' }}
      onClick={action.onClick}
    >
      <Card.Body>
        <Flex align="center" gap={3}>
          {action.icon && (
            <Box
              className="ds-command-center__quick-action-icon"
              data-part="quick-action-icon"
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {action.icon}
            </Box>
          )}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text className="ds-command-center__quick-action-title" data-part="quick-action-title" size="sm" weight="medium">{action.label}</Text>
            {action.description && (
              <Text
                className="ds-command-center__muted-text"
                size="xs"
                color="muted"
                style={{ marginTop: 'var(--ds-spacing-xs, 4px)' }}
              >
                {action.description}
              </Text>
            )}
          </Box>
        </Flex>
      </Card.Body>
    </Card>
  );
}

function QuickActionSkeleton() {
  return (
    <Card variant="outlined">
      <Card.Body>
        <Flex align="center" gap={3}>
          <Skeleton variant="rounded" width={36} height={36} />
          <Box style={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton variant="text" width="40%" height={12} style={{ marginTop: 6 }} />
          </Box>
        </Flex>
      </Card.Body>
    </Card>
  );
}

function InsightSkeleton() {
  return (
    <Card variant="outlined">
      <Card.Body>
        <Flex align="center" gap={3}>
          <Skeleton variant="rounded" width={4} height={32} />
          <Box style={{ flex: 1 }}>
            <Skeleton variant="text" width="50%" height={14} />
            <Skeleton variant="text" width="70%" height={12} style={{ marginTop: 6 }} />
          </Box>
        </Flex>
      </Card.Body>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          <Flex align="center" gap={3}>
            <Skeleton variant="text" width="100%" height={14} />
          </Flex>
          <Flex align="center" gap={3}>
            <Skeleton variant="text" width="80%" height={14} />
          </Flex>
          <Flex align="center" gap={3}>
            <Skeleton variant="text" width="90%" height={14} />
          </Flex>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function SectionSkeleton() {
  return (
    <Card variant="outlined">
      <Card.Body>
        <Skeleton variant="text" width="30%" height={16} />
        <Skeleton variant="text" rows={3} style={{ marginTop: 12 }} />
      </Card.Body>
    </Card>
  );
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

  const hasNoContent =
    !loading &&
    (!stats || stats.length === 0) &&
    (!quickActions || quickActions.length === 0) &&
    (!recentActivity || recentActivity.items.length === 0) &&
    (!insights || insights.length === 0) &&
    (!sections || sections.length === 0);

  return (
    <Stack
      className="ds-surface ds-command-center"
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      data-empty={hasNoContent ? 'true' : 'false'}
      spacing="lg"
    >
      {headerSlot}

      {/* Header with greeting */}
      <Box className="ds-command-center__header" data-part="header">
        {loading ? (
          <>
            <Skeleton variant="text" width="30%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton variant="text" width="45%" height={24} />
          </>
        ) : (
          <>
            {greeting && (
              <Text
                className="ds-command-center__muted-text"
                size="sm"
                color="muted"
                style={{ marginBottom: 'var(--ds-spacing-xs, 4px)' }}
              >
                {greeting}
              </Text>
            )}
            <Text className="ds-command-center__title" data-part="title" size="xl" weight="semibold">{title}</Text>
          </>
        )}
      </Box>

      {/* Insights/alerts */}
      {loading && (!insights || insights.length === 0) && (
        <Stack spacing="sm">
          <InsightSkeleton />
        </Stack>
      )}
      {insights && insights.length > 0 && (
        <Stack spacing="sm">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
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

      {/* Quick actions grid */}
      {loading && (!quickActions || quickActions.length === 0) && (
        <Box>
          <Skeleton variant="text" width="20%" height={14} style={{ marginBottom: 12 }} />
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'var(--ds-spacing-sm, 8px)',
            }}
          >
            <QuickActionSkeleton />
            <QuickActionSkeleton />
            <QuickActionSkeleton />
          </Box>
        </Box>
      )}
      {quickActions && quickActions.length > 0 && (
        <Box>
          <Text
            className="ds-command-center__muted-text"
            size="sm"
            weight="medium"
            color="muted"
            style={{ marginBottom: 'var(--ds-spacing-sm, 8px)' }}
          >
            Quick Actions
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'var(--ds-spacing-sm, 8px)',
            }}
          >
            {quickActions.map((action) => (
              <QuickActionCard key={action.key} action={action} />
            ))}
          </Box>
        </Box>
      )}

      {/* Recent activity */}
      {loading && (!recentActivity || recentActivity.items.length === 0) && (
        <Box>
          <Skeleton variant="text" width="25%" height={14} style={{ marginBottom: 12 }} />
          <ActivitySkeleton />
        </Box>
      )}
      {recentActivity && recentActivity.items.length > 0 && (
        <Card className="ds-command-center__recent-activity" variant="outlined">
          <Card.Body>
            <Flex
              align="center"
              style={{ marginBottom: 'var(--ds-spacing-sm, 8px)' }}
            >
              <Text size="sm" weight="medium" style={{ flex: 1 }}>Recent Activity</Text>
              {recentActivity.viewAllHref && !recentActivity.onViewAll && (
                <a href={recentActivity.viewAllHref} style={{ textDecoration: 'none' }}>
                  <Button size="xs" variant="link">
                    View all
                  </Button>
                </a>
              )}
              {recentActivity.onViewAll && (
                <Button
                  size="xs"
                  variant="link"
                  onClick={() => {
                    if (recentActivity.onViewAll) {
                      recentActivity.onViewAll();
                    }
                  }}
                >
                  View all
                </Button>
              )}
            </Flex>
            <PatternActivityLog
              loading={loading}
              activities={mapActivityItems(recentActivity.items.slice(0, 5))}
              emptyMessage="No recent activity."
            />
          </Card.Body>
        </Card>
      )}

      {/* Body sections */}
      {loading && (!sections || sections.length === 0) && (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
            gap: 'var(--ds-spacing-md, 16px)',
          }}
        >
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </Box>
      )}
      {sections && sections.length > 0 && (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
            gap: 'var(--ds-spacing-md, 16px)',
          }}
        >
          {sections.map((section) => (
            <Card
              key={section.key}
              variant="outlined"
              style={{
                gridColumn: section.span ? `span ${section.span}` : undefined,
              }}
            >
              <Card.Body>
                {section.title && (
                  <Text
                    size="sm"
                    weight="medium"
                    style={{ marginBottom: 'var(--ds-spacing-sm, 8px)' }}
                  >
                    {section.title}
                  </Text>
                )}
                {section.render()}
              </Card.Body>
            </Card>
          ))}
        </Box>
      )}

      {/* Empty state */}
      {hasNoContent && (
        <Card variant="outlined">
          <Card.Body>
            <Flex
              align="center"
              justify="center"
              style={{
                padding: 'var(--ds-spacing-xl, 32px) var(--ds-spacing-md, 16px)',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-sm, 8px)',
              }}
            >
              <Text size="lg" weight="medium" color="muted">No data to display</Text>
              <Text size="sm" color="muted">
                Configure stats, actions, or sections to populate this dashboard.
              </Text>
            </Flex>
          </Card.Body>
        </Card>
      )}

      {footerSlot}
    </Stack>
  );
}

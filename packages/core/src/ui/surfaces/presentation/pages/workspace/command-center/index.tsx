/**
 * @fileoverview CommandCenterSurface - entry point dashboard for managers/admins.
 *
 * Composes: KPI strip + quick actions + recent activity + flexible body sections.
 * For: admin dashboards, manager cockpits, recruiter hubs, event control rooms.
 *
 * The surface COORDINATES composed primitives/patterns (Card, PatternStatsGrid,
 * PatternActivityLog, NavLink, SurfaceEmptyState) and owns no chrome of its own:
 * every paint decision lives in `skin/command-center.css`, keyed on the BEM
 * hooks and `data-*` contract stamped below.
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Box } from '../../../../../primitives/layout/Box';
import { Stack } from '../../../../../primitives/layout/Stack';
import { Flex } from '../../../../../primitives/layout/Flex';
import { Heading, Text } from '../../../../../primitives/display/Typography';
import { Card } from '../../../../../primitives/display/Card';
import { Button } from '../../../../../primitives/inputs/Button';
import { NavLink } from '../../../../../primitives/navigation';
import { Skeleton } from '../../../../../primitives/feedback/Skeleton';
import { PatternStatsGrid } from '../../../../../patterns/data/stats-grid';
import type { StatDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import { PatternActivityLog } from '../../../../../patterns/communication/activity-log';
import type { Activity } from '../../../../../patterns/communication/activity-log/contracts';
import { useCollectionStagger } from '../../../../../patterns/foundation/motion';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';

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

function mapActivityItems(items: ActivityItem[], systemActorName: string): Activity[] {
  return items.map((item) => ({
    id: item.id,
    user: item.user ?? { name: systemActorName },
    action: item.text,
    timestamp: item.timestamp,
    // icon is available on ActivityItem for custom renderActivity implementations
    // but is not passed to metadata since the default ActivityLog renderer does not consume it.
  }));
}

/** Governed tone iconography for insight tiles: the semantic role icons carry
 *  their own tone ink (`defaultTone`), so the tile needs no per-tone paint and
 *  never a one-sided chromatic rail (`insight-accent` stays absent by pin). */
const INSIGHT_ICON_BY_TONE: Record<
  InsightItem['type'],
  typeof StatusInfoIcon
> = {
  info: StatusInfoIcon,
  warning: StatusWarningIcon,
  success: StatusSuccessIcon,
  error: StatusErrorIcon,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InsightCard({ insight }: { insight: InsightItem }) {
  const ToneIcon = INSIGHT_ICON_BY_TONE[insight.type];
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
          <span
            className="ds-command-center__insight-icon"
            data-part="insight-icon"
            data-tone={insight.type}
            aria-hidden="true"
          >
            <ToneIcon decorative size={16} />
          </span>
          <Box className="ds-command-center__insight-body">
            <Text className="ds-command-center__insight-title" data-part="insight-title" size="sm" weight="medium">{insight.title}</Text>
            {insight.description && (
              <Text
                className="ds-command-center__insight-description ds-command-center__muted-text"
                size="xs"
                color="muted"
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

function QuickActionCard({
  action,
  staggerIndex,
  staggerAnimated,
}: {
  action: QuickAction;
  staggerIndex: number;
  staggerAnimated: boolean;
}) {
  return (
    <Card
      className="ds-command-center__quick-action-card"
      variant="outlined"
      onClick={action.onClick}
      data-ds-stagger-item={staggerAnimated ? '' : undefined}
      style={
        staggerAnimated
          ? ({ '--ds-stagger-index': staggerIndex } as React.CSSProperties)
          : undefined
      }
    >
      <Card.Body>
        <Flex align="center" gap={3}>
          {action.icon && (
            <Box
              className="ds-command-center__quick-action-icon"
              data-part="quick-action-icon"
            >
              {action.icon}
            </Box>
          )}
          <Box className="ds-command-center__quick-action-body">
            <Text className="ds-command-center__quick-action-title" data-part="quick-action-title" size="sm" weight="medium">{action.label}</Text>
            {action.description && (
              <Text
                className="ds-command-center__quick-action-description ds-command-center__muted-text"
                size="xs"
                color="muted"
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
          <Box className="ds-command-center__skeleton-grow">
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton className="ds-command-center__skeleton-line" variant="text" width="40%" height={12} />
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
          <Skeleton variant="rounded" width={16} height={16} />
          <Box className="ds-command-center__skeleton-grow">
            <Skeleton variant="text" width="50%" height={14} />
            <Skeleton className="ds-command-center__skeleton-line" variant="text" width="70%" height={12} />
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
        <Skeleton className="ds-command-center__skeleton-body" variant="text" rows={3} />
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

  const { tSurfaceOr } = useSurfaceTranslations();

  // Entrance choreography for the quick-action collection (collection.insert
  // recipe). Gated by the active motion policy: a reduced/calm context renders
  // every card at its final state. `--ds-stagger-index` is the sanctioned
  // custom-property passthrough, not inline paint.
  const stagger = useCollectionStagger(quickActions?.length ?? 0);

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
      aria-busy={loading || undefined}
    >
      {headerSlot}

      {/* Visually-hidden live label beside aria-busy (sr-only idiom, same as
          the decision-inbox / record-workbench siblings; skin owns geometry). */}
      {loading && (
        <Text
          as="span"
          className="ds-command-center__loading-label"
          data-part="loading-label"
        >
          {tSurfaceOr('command_center.loading_label', 'Loading…')}
        </Text>
      )}

      {/* Header with greeting */}
      <Box className="ds-command-center__header" data-part="header">
        {loading ? (
          <>
            <Skeleton className="ds-command-center__skeleton-greeting" variant="text" width="30%" height={14} />
            <Skeleton variant="text" width="45%" height={24} />
          </>
        ) : (
          <>
            {greeting && (
              <Text
                className="ds-command-center__greeting ds-command-center__muted-text"
                size="sm"
                color="muted"
              >
                {greeting}
              </Text>
            )}
            <Heading
              className="ds-command-center__title"
              data-part="title"
              level="h1"
              textStyle="pageTitle"
            >
              {title}
            </Heading>
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
        <Stack
          as="section"
          spacing="sm"
          data-part="insights"
          aria-label={tSurfaceOr('command_center.insights_aria', 'Insights')}
        >
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
          <Skeleton className="ds-command-center__skeleton-heading" variant="text" width="20%" height={14} />
          <Box className="ds-command-center__quick-actions-grid" data-part="quick-actions-grid">
            <QuickActionSkeleton />
            <QuickActionSkeleton />
            <QuickActionSkeleton />
          </Box>
        </Box>
      )}
      {quickActions && quickActions.length > 0 && (
        <Box className="ds-command-center__quick-actions" data-part="quick-actions">
          <Heading
            level="h2"
            textStyle="sectionTitle"
            className="ds-command-center__section-heading"
          >
            {tSurfaceOr('command_center.quick_actions', 'Quick Actions')}
          </Heading>
          <Box
            className={
              stagger.animated
                ? `ds-command-center__quick-actions-grid ${stagger.containerClassName}`
                : 'ds-command-center__quick-actions-grid'
            }
            data-part="quick-actions-grid"
            style={
              stagger.animated
                ? ({
                    '--ds-stagger-step': stagger.stepCss,
                    '--ds-stagger-max': stagger.maxCss,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.key}
                action={action}
                staggerIndex={index}
                staggerAnimated={stagger.animated}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Recent activity */}
      {loading && (!recentActivity || recentActivity.items.length === 0) && (
        <Box>
          <Skeleton className="ds-command-center__skeleton-heading" variant="text" width="25%" height={14} />
          <ActivitySkeleton />
        </Box>
      )}
      {recentActivity && recentActivity.items.length > 0 && (
        <Card className="ds-command-center__recent-activity" variant="outlined">
          <Card.Body>
            <Flex
              align="center"
              className="ds-command-center__recent-activity-header"
            >
              <Heading
                level="h2"
                textStyle="sectionTitle"
                className="ds-command-center__recent-activity-title"
              >
                {tSurfaceOr('command_center.recent_activity', 'Recent Activity')}
              </Heading>
              {recentActivity.viewAllHref && !recentActivity.onViewAll && (
                <NavLink
                  className="ds-command-center__view-all"
                  href={recentActivity.viewAllHref}
                >
                  {tSurfaceOr('command_center.view_all', 'View all')}
                </NavLink>
              )}
              {recentActivity.onViewAll && (
                <Button
                  size="xs"
                  variant="link"
                  onClick={recentActivity.onViewAll}
                >
                  {tSurfaceOr('command_center.view_all', 'View all')}
                </Button>
              )}
            </Flex>
            <PatternActivityLog
              loading={loading}
              activities={mapActivityItems(
                recentActivity.items.slice(0, 5),
                tSurfaceOr('command_center.system_actor', 'System'),
              )}
              emptyMessage={tSurfaceOr('command_center.activity_empty', 'No recent activity.')}
            />
          </Card.Body>
        </Card>
      )}

      {/* Body sections */}
      {loading && (!sections || sections.length === 0) && (
        <Box className="ds-command-center__sections-grid" data-part="sections-grid">
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </Box>
      )}
      {sections && sections.length > 0 && (
        <Box className="ds-command-center__sections-grid" data-part="sections-grid">
          {sections.map((section) => (
            <Card
              key={section.key}
              variant="outlined"
              className="ds-command-center__section-card"
              data-span={section.span}
            >
              <Card.Body>
                {section.title && (
                  <Heading
                    level="h2"
                    textStyle="sectionTitle"
                    className="ds-command-center__section-title"
                  >
                    {section.title}
                  </Heading>
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
            <SurfaceEmptyState
              title={tSurfaceOr('command_center.empty_title', 'No data to display')}
              description={tSurfaceOr(
                'command_center.empty_description',
                'Configure stats, actions, or sections to populate this dashboard.',
              )}
            />
          </Card.Body>
        </Card>
      )}

      {footerSlot}
    </Stack>
  );
}

'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the ActivityLog pattern.
 * Renders a chronological timeline of user activities inside an Ant Design Card,
 * using the Timeline component with color-coded dots and action Tags. Provides
 * optional multi-select filters for action type and user, plus diff rendering
 * that shows old/new values with strikethrough formatting.
 *
 * @example
 * <ClassicActivityLog
 *   activities={[
 *     { id: '1', action: 'created', user: { name: 'Ana' }, timestamp: new Date().toISOString() },
 *   ]}
 *   actionTypes={['created', 'updated', 'deleted']}
 *   onFilterChange={(f) => setFilters(f)}
 * />
 */

import React from 'react';
import { Timeline, Avatar, Tag, Card, Select, DatePicker, Space, Empty } from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActivityLogProps, Activity } from '../ActivityLog.types';

// CSS-variable-based colors for timeline dot icons, mapped by action verb.
const ACTIVITY_ICON_COLORS = {
  created: 'var(--ds-color-success)',
  updated: 'var(--ds-color-primary)',
  deleted: 'var(--ds-color-error)',
  viewed: 'var(--ds-color-secondary)',
  synced: 'var(--ds-color-warning)',
  fallback: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))',
} as const;

// Ant Design icon per action type, displayed as the Timeline dot.
const actionIcons: Record<string, React.ReactNode> = {
  created: <PlusOutlined style={{ color: ACTIVITY_ICON_COLORS.created }} />,
  updated: <EditOutlined style={{ color: ACTIVITY_ICON_COLORS.updated }} />,
  deleted: <DeleteOutlined style={{ color: ACTIVITY_ICON_COLORS.deleted }} />,
  viewed: <EyeOutlined style={{ color: ACTIVITY_ICON_COLORS.viewed }} />,
  synced: <SyncOutlined style={{ color: ACTIVITY_ICON_COLORS.synced }} />,
};

// Ant Design Tag color name per action type (not CSS variables -- Ant resolves these internally).
const actionColors: Record<string, string> = {
  created: 'green',
  updated: 'blue',
  deleted: 'red',
  viewed: 'purple',
  synced: 'orange',
};

/**
 * Resolves a timeline dot icon by substring-matching the action name against
 * known verbs (created, updated, deleted, viewed, synced). Falls back to EditOutlined.
 */
function getActionIcon(action: string): React.ReactNode {
  const lower = action.toLowerCase();
  for (const [key, icon] of Object.entries(actionIcons)) {
    if (lower.includes(key)) return icon;
  }
  return <EditOutlined style={{ color: ACTIVITY_ICON_COLORS.fallback }} />;
}

/** Resolves an Ant Design Tag color name from an action string via substring match. */
function getActionColor(action: string): string {
  const lower = action.toLowerCase();
  for (const [key, color] of Object.entries(actionColors)) {
    if (lower.includes(key)) return color;
  }
  return 'default';
}

/**
 * Converts an ISO timestamp to a human-friendly relative string.
 * Uses minute/hour/day thresholds, falling back to a locale-formatted date
 * for anything older than 7 days.
 */
function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Renders a field-level diff showing old values with strikethrough and new values in bold. */
function renderDiff(diff: Record<string, { from: unknown; to: unknown }>): React.ReactNode {
  return (
    <div
      style={{
        marginTop: 8,
        fontSize: 12,
        color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))',
      }}
    >
      {Object.entries(diff).map(([field, { from, to }]) => (
        <div key={field}>
          <strong>{field}:</strong> <span style={{ textDecoration: 'line-through' }}>{String(from)}</span> {'->'} <span style={{ fontWeight: 500 }}>{String(to)}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Classic engine activity log built on Ant Design's Timeline + Card.
 * Displays a chronological list of activities with icon dots, user avatars,
 * action tags, entity references, and optional field-level diffs. Includes
 * multi-select filters for action type and user.
 *
 * @param props - {@link ActivityLogProps}
 * @returns An Ant Design Card wrapping a filterable Timeline.
 */
export default function ClassicActivityLog(props: ActivityLogProps) {
  const {
    activities,
    filters,
    onFilterChange,
    emptyMessage = 'No activity recorded',
    actionTypes,
    users,
    renderActivity,
    onActivityClick,
    loading,
    className,
    style,
  } = props;

  if (loading) {
    return (
      <Card className={className} style={style} loading>
        <div />
      </Card>
    );
  }

  return (
    <Card
      className={`ds-pattern-activity-log ds-engine-classic ${className ?? ''}`}
      style={style}
    >
      {/* Filter bar */}
      {onFilterChange && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {actionTypes && actionTypes.length > 0 && (
            <Select
              mode="multiple"
              placeholder="Filter by action"
              value={filters?.type || []}
              onChange={(val) => onFilterChange({ ...filters, type: val })}
              style={{ minWidth: 180 }}
              allowClear
              options={actionTypes.map(t => ({ label: t, value: t }))}
              size="small"
            />
          )}
          {users && users.length > 0 && (
            <Select
              mode="multiple"
              placeholder="Filter by user"
              value={filters?.user || []}
              onChange={(val) => onFilterChange({ ...filters, user: val })}
              style={{ minWidth: 180 }}
              allowClear
              options={users.map(u => ({ label: u.name, value: u.name }))}
              size="small"
            />
          )}
        </div>
      )}

      {activities.length === 0 ? (
        <Empty description={emptyMessage} />
      ) : (
        <Timeline
          items={activities.map(activity => ({
            key: activity.id,
            dot: getActionIcon(activity.action),
            children: renderActivity ? renderActivity(activity) : (
              <div
                onClick={() => onActivityClick?.(activity)}
                style={{ cursor: onActivityClick ? 'pointer' : undefined }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Avatar
                    src={activity.user.avatar}
                    icon={!activity.user.avatar ? <UserOutlined /> : undefined}
                    size="small"
                  />
                  <span style={{ fontWeight: 500 }}>{activity.user.name}</span>
                  <Tag color={getActionColor(activity.action)}>{activity.action}</Tag>
                  {activity.entityType && (
                    <span
                      style={{
                        color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))',
                        fontSize: 12,
                      }}
                    >
                      on {activity.entityType}
                      {activity.entityId ? ` #${activity.entityId}` : ''}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))',
                    fontSize: 12,
                    marginLeft: 32,
                  }}
                >
                  {formatTimestamp(activity.timestamp)}
                </div>
                {activity.diff && (
                  <div style={{ marginLeft: 32 }}>{renderDiff(activity.diff)}</div>
                )}
              </div>
            ),
          }))}
        />
      )}
    </Card>
  );
}

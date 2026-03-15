'use client';

/**
 * BhSprintBoard - Planning Preset
 * Sprint planning board with backlog/sprint two-column layout,
 * capacity gauge, team members sidebar, and drag indicators.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  User,
  Users,
  Target,
  GripVertical,
  ArrowRight,
  Plus,
  Tag,
  AlertTriangle,
  Briefcase,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Gauge,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createDividerStyle,
  ICON_SIZES,
} from '../../../helpers';
import type { BhSprintBoardProps, BacklogItem, TeamMember } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getTypeIcon(type: BacklogItem['type']) {
  switch (type) {
    case 'candidate':
      return User;
    case 'job':
      return Briefcase;
    case 'task':
      return CheckSquare;
  }
}

function getTypeColor(type: BacklogItem['type'], tokens: PresetContext['tokens']): string {
  switch (type) {
    case 'candidate':
      return tokens.colors.primaryScale[600];
    case 'job':
      return tokens.colors.infoScale[600];
    case 'task':
      return tokens.colors.successScale[600];
  }
}

function getPriorityConfig(priority: BacklogItem['priority'], tokens: PresetContext['tokens']) {
  switch (priority) {
    case 'high':
      return { label: 'High', color: 'error' as const, scale: tokens.colors.errorScale };
    case 'medium':
      return { label: 'Med', color: 'warning' as const, scale: tokens.colors.warningScale };
    case 'low':
      return { label: 'Low', color: 'success' as const, scale: tokens.colors.successScale };
  }
}

/* ------------------------------------------------------------------ */
/*  Capacity Gauge                                                     */
/* ------------------------------------------------------------------ */

function CapacityGauge({
  committed,
  capacity,
  tokens,
  compact,
}: {
  committed: number;
  capacity: number;
  tokens: PresetContext['tokens'];
  compact?: boolean;
}) {
  const typography = getPersonalityTypography(tokens);
  const pct = capacity > 0 ? Math.round((committed / capacity) * 100) : 0;
  const isOvercommitted = pct > 100;

  const barColor = isOvercommitted
    ? tokens.colors.errorScale[500]
    : pct > 80
    ? tokens.colors.warningScale[500]
    : tokens.colors.successScale[500];

  const barBg = isOvercommitted
    ? tokens.colors.errorScale[100]
    : pct > 80
    ? tokens.colors.warningScale[100]
    : tokens.colors.successScale[100];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: compact ? 1 : undefined }}>
      <div style={{ flex: 1, minWidth: compact ? 40 : 120 }}>
        <div
          style={{
            width: '100%',
            height: compact ? 6 : 8,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: barBg,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(pct, 100)}%`,
              height: '100%',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: barColor,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
      <span
        style={{
          ...typography.caption,
          color: isOvercommitted ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
          whiteSpace: 'nowrap',
          fontWeight: tokens.typography.fontWeight.semibold,
        }}
      >
        {committed}/{capacity}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Backlog Item Row                                                   */
/* ------------------------------------------------------------------ */

function BacklogItemRow({
  item,
  tokens,
  index,
  onAssignItem,
  showDragHandle,
}: {
  item: BacklogItem;
  tokens: PresetContext['tokens'];
  index: number;
  onAssignItem?: BhSprintBoardProps['onAssignItem'];
  showDragHandle?: boolean;
}) {
  const typography = getPersonalityTypography(tokens);
  const TypeIcon = getTypeIcon(item.type);
  const typeColor = getTypeColor(item.type, tokens);
  const priorityConfig = getPriorityConfig(item.priority, tokens);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: tokens.spacing[2],
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
        transition: createEntranceAnimation(tokens).transition,
        transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
      }}
    >
      {/* Drag handle indicator (visual only) */}
      {showDragHandle && (
        <div style={{ color: tokens.colors.neutral[500], cursor: 'grab', display: 'flex' }}>
          <GripVertical size={ICON_SIZES.label} />
        </div>
      )}

      {/* Type Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: tokens.borderRadius.sm,
          backgroundColor: `${typeColor}15`,
          color: typeColor,
          flexShrink: 0,
        }}
      >
        <TypeIcon size={ICON_SIZES.label} />
      </div>

      {/* Title & Tags */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...typography.body,
            color: tokens.colors.neutral[900],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </div>
        {item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: tokens.spacing[0], marginTop: 2, flexWrap: 'wrap' }}>
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  ...typography.caption,
                  color: tokens.colors.neutral[500],
                  backgroundColor: tokens.colors.primaryScale[50],
                  padding: `1px ${tokens.spacing[0]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: 10,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Priority Badge */}
      <span
        style={{
          ...createBadgeStyle(tokens, priorityConfig.color),
          ...typography.caption,
          fontSize: 10,
          flexShrink: 0,
        }}
      >
        {priorityConfig.label}
      </span>

      {/* Points Pill */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 24,
          height: 24,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[100],
          color: tokens.colors.primaryScale[700],
          ...typography.caption,
          fontWeight: tokens.typography.fontWeight.semibold,
          flexShrink: 0,
        }}
      >
        {item.points}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Team Member Row                                                    */
/* ------------------------------------------------------------------ */

function TeamMemberRow({
  member,
  tokens,
  assignedItems,
}: {
  member: TeamMember;
  tokens: PresetContext['tokens'];
  assignedItems: BacklogItem[];
}) {
  const typography = getPersonalityTypography(tokens);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginBottom: tokens.spacing[2] }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: tokens.spacing[2],
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          cursor: assignedItems.length > 0 ? 'pointer' : 'default',
        }}
        onClick={() => assignedItems.length > 0 && setExpanded(!expanded)}
      >
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              ...createIconContainerStyle(tokens, { size: 28 }),
              borderRadius: tokens.borderRadius.full,
            }}
          >
            <User size={ICON_SIZES.inline} />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...typography.body, color: tokens.colors.neutral[900], fontSize: 13 }}>
            {member.name}
          </div>
          <CapacityGauge committed={member.committed} capacity={member.capacity} tokens={tokens} compact />
        </div>

        {assignedItems.length > 0 && (
          expanded ? <ChevronUp size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[500] }} /> :
          <ChevronDown size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[500] }} />
        )}
      </div>

      {expanded && assignedItems.length > 0 && (
        <div style={{ paddingLeft: tokens.spacing[6], marginTop: tokens.spacing[1], display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          {assignedItems.map((item, idx) => (
            <BacklogItemRow key={item.id} item={item} tokens={tokens} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function PlanningSkeletons({ tokens }: { tokens: PresetContext['tokens'] }) {
  const s = createPersonalitySkeletonStyle(tokens);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
      {[1, 2].map((col) => (
        <div key={col} style={{ ...createCardStyle(tokens), padding: tokens.spacing[6] }}>
          <div style={{ ...s, width: '50%', height: 18, marginBottom: tokens.spacing[4] }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ ...s, width: '100%', height: 44, marginBottom: tokens.spacing[2], borderRadius: tokens.borderRadius.md }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const PlanningBhSprintBoard = createPreset<BhSprintBoardProps>(
  'PlanningBhSprintBoard',
  ({ props, tokens }) => {
    const {
      data,
      loading = false,
      onAssignItem,
      onReorderItem,
      onUpdatePoints,
      className,
      style,
    } = props;

    const typography = getPersonalityTypography(tokens);

    // ================================================================
    // LOADING
    // ================================================================

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
          <PlanningSkeletons tokens={tokens} />
        </div>
      );
    }

    // ================================================================
    // EMPTY STATE
    // ================================================================

    if (!data) {
      return (
        <div className={className} style={{ ...style }}>
          <div style={createEmptyStateStyle(tokens)}>
            <div style={{ marginBottom: tokens.spacing[2], color: tokens.colors.neutral[400] }}>
              <Target size={ICON_SIZES.hero} />
            </div>
            <div style={{ ...typography.subtitle, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>No Sprint Planning</div>
            <div style={{ ...typography.caption, color: tokens.colors.neutral[400] }}>
              Sprint planning data is not available. Start planning by adding backlog items.
            </div>
          </div>
        </div>
      );
    }

    const backlogItems = data.backlogItems ?? [];
    const assignedItems = data.assignedItems ?? [];
    const teamMembers = data.teamMembers ?? [];

    // Group assigned items by assignee
    const assignedByMember = useMemo(() => {
      const map: Record<string, BacklogItem[]> = {};
      for (const item of assignedItems) {
        if (item.assigneeId) {
          if (!map[item.assigneeId]) map[item.assigneeId] = [];
          map[item.assigneeId].push(item);
        }
      }
      return map;
    }, [assignedItems]);

    // ================================================================
    // MAIN RENDER
    // ================================================================

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
        {/* Header with capacity gauge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: tokens.spacing[2],
          }}
        >
          <div>
            <div style={{ ...typography.title, color: tokens.colors.neutral[900] }}>{data.sprintName}</div>
            <div style={{ ...typography.caption, color: tokens.colors.neutral[500], marginTop: tokens.spacing[0] }}>
              Sprint Planning
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Gauge size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[500] }} />
              <span style={{ ...typography.caption, color: tokens.colors.neutral[500] }}>Capacity:</span>
            </div>
            <div style={{ minWidth: 200 }}>
              <CapacityGauge committed={data.committed} capacity={data.capacity} tokens={tokens} />
            </div>
          </div>
        </div>

        <div style={createDividerStyle(tokens)} />

        {/* Two-column layout + Team sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 260px', gap: tokens.spacing[6] }}>
          {/* Backlog Column */}
          <div>
            <div
              style={{
                ...createPersonalitySectionHeaderStyle(tokens),
                marginBottom: tokens.spacing[4],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Backlog ({backlogItems.length})</span>
              <span
                style={{
                  ...typography.caption,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.normal,
                }}
              >
                {backlogItems.reduce((sum, i) => sum + i.points, 0)} pts
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              {backlogItems.length === 0 ? (
                <div
                  style={{
                    ...typography.body,
                    color: tokens.colors.neutral[500],
                    textAlign: 'center',
                    padding: tokens.spacing[8],
                  }}
                >
                  No backlog items
                </div>
              ) : (
                backlogItems.map((item, idx) => (
                  <BacklogItemRow
                    key={item.id}
                    item={item}
                    tokens={tokens}
                    index={idx}
                    onAssignItem={onAssignItem}
                    showDragHandle
                  />
                ))
              )}
            </div>
          </div>

          {/* Sprint Column */}
          <div>
            <div
              style={{
                ...createPersonalitySectionHeaderStyle(tokens),
                marginBottom: tokens.spacing[4],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Sprint ({assignedItems.length})</span>
              <span
                style={{
                  ...typography.caption,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.normal,
                }}
              >
                {assignedItems.reduce((sum, i) => sum + i.points, 0)} pts
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              {assignedItems.length === 0 ? (
                <div
                  style={{
                    ...typography.body,
                    color: tokens.colors.neutral[500],
                    textAlign: 'center',
                    padding: tokens.spacing[8],
                    border: `2px dashed ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md,
                  }}
                >
                  Drag items here to add to sprint
                </div>
              ) : (
                assignedItems.map((item, idx) => (
                  <BacklogItemRow
                    key={item.id}
                    item={item}
                    tokens={tokens}
                    index={idx}
                    showDragHandle
                  />
                ))
              )}
            </div>
          </div>

          {/* Team Members Sidebar */}
          <div>
            <div
              style={{
                ...createPersonalitySectionHeaderStyle(tokens),
                marginBottom: tokens.spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}
            >
              <Users size={ICON_SIZES.label} />
              Team ({teamMembers.length})
            </div>

            <div>
              {teamMembers.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  tokens={tokens}
                  assignedItems={assignedByMember[member.id] ?? []}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

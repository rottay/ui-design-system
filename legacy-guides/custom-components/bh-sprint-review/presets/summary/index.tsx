'use client';

/**
 * BhSprintReview - Summary Preset
 * Sprint review summary with goals progress, metrics grid,
 * highlights/improvements sections, and velocity comparison.
 */

import { useState, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BarChart3,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Zap,
  Award,
  Lightbulb,
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
  createDividerStyle,
  ICON_SIZES,
} from '../../../helpers';
import type { BhSprintReviewProps, SprintGoal, SprintMetric } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function getGoalStatusConfig(status: SprintGoal['status']) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', icon: CheckCircle2, color: 'success' as const };
    case 'partial':
      return { label: 'Partial', icon: AlertCircle, color: 'warning' as const };
    case 'missed':
      return { label: 'Missed', icon: XCircle, color: 'error' as const };
  }
}

function getTrendIcon(trend: SprintMetric['trend']) {
  switch (trend) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    case 'stable':
      return Minus;
  }
}

function getTrendColor(trend: SprintMetric['trend'], tokens: PresetContext['tokens']): string {
  switch (trend) {
    case 'up':
      return tokens.colors.successScale[600];
    case 'down':
      return tokens.colors.errorScale[600];
    case 'stable':
      return tokens.colors.neutral[500];
  }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ tokens }: { tokens: PresetContext['tokens'] }) {
  const s = createPersonalitySkeletonStyle(tokens);
  return (
    <div style={{ ...createCardStyle(tokens), padding: tokens.spacing[6] }}>
      <div style={{ ...s, width: '40%', height: 18, marginBottom: tokens.spacing[4] }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div style={{ ...s, width: '70%', height: 14, marginBottom: tokens.spacing[1] }} />
            <div style={{ ...s, width: '50%', height: 24 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Goal Card                                                          */
/* ------------------------------------------------------------------ */

function GoalCard({
  goal,
  tokens,
  index,
  onViewDetails,
}: {
  goal: SprintGoal;
  tokens: PresetContext['tokens'];
  index: number;
  onViewDetails?: BhSprintReviewProps['onViewDetails'];
}) {
  const typography = getPersonalityTypography(tokens);
  const config = getGoalStatusConfig(goal.status);
  const StatusIcon = config.icon;
  const pct = goal.target > 0 ? Math.round((goal.achieved / goal.target) * 100) : 0;

  const statusColorMap = {
    success: tokens.colors.successScale,
    warning: tokens.colors.warningScale,
    error: tokens.colors.errorScale,
  };
  const scale = statusColorMap[config.color];

  return (
    <div
      style={{
        ...createCardStyle(tokens),
        padding: tokens.spacing[4],
        cursor: onViewDetails ? 'pointer' : 'default',
        transition: createEntranceAnimation(tokens).transition,
        transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
      }}
      onClick={() => onViewDetails?.('goal', index)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
        <div style={{ ...typography.subtitle, color: tokens.colors.neutral[900], flex: 1 }}>{goal.title}</div>
        <span style={{ ...createBadgeStyle(tokens, config.color), display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[0] }}>
          <StatusIcon size={ICON_SIZES.inline} />
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: tokens.spacing[1] }}>
        <div
          style={{
            width: '100%',
            height: 8,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: scale[100],
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(pct, 100)}%`,
              height: '100%',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: scale[500],
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', ...typography.caption, color: tokens.colors.neutral[500] }}>
        <span>{goal.achieved} / {goal.target}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Metric Card                                                        */
/* ------------------------------------------------------------------ */

function MetricCard({
  metric,
  tokens,
  index,
  onViewDetails,
}: {
  metric: SprintMetric;
  tokens: PresetContext['tokens'];
  index: number;
  onViewDetails?: BhSprintReviewProps['onViewDetails'];
}) {
  const typography = getPersonalityTypography(tokens);
  const TrendIcon = getTrendIcon(metric.trend);
  const trendColor = getTrendColor(metric.trend, tokens);

  return (
    <div
      style={{
        ...createCardStyle(tokens),
        padding: tokens.spacing[4],
        cursor: onViewDetails ? 'pointer' : 'default',
        transition: createEntranceAnimation(tokens).transition,
        transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
      }}
      onClick={() => onViewDetails?.('metric', index)}
    >
      <div style={{ ...typography.caption, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
        {metric.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1] }}>
        <span style={{ ...typography.title, color: tokens.colors.neutral[900], fontSize: 28 }}>
          {metric.value}
        </span>
        <span style={{ ...typography.caption, color: tokens.colors.neutral[500] }}>{metric.unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0], marginTop: tokens.spacing[1] }}>
        <TrendIcon size={ICON_SIZES.label} style={{ color: trendColor }} />
        <span style={{ ...typography.caption, color: trendColor }}>
          {metric.trend === 'up' ? 'Trending up' : metric.trend === 'down' ? 'Trending down' : 'Stable'}
        </span>
        {metric.benchmark != null && (
          <span style={{ ...typography.caption, color: tokens.colors.neutral[500], marginLeft: tokens.spacing[1] }}>
            (benchmark: {metric.benchmark} {metric.unit})
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Velocity Chart (simple SVG bar comparison)                         */
/* ------------------------------------------------------------------ */

function VelocityChart({
  current,
  previous,
  tokens,
}: {
  current: number;
  previous?: number;
  tokens: PresetContext['tokens'];
}) {
  const typography = getPersonalityTypography(tokens);
  const maxVal = Math.max(current, previous ?? 0, 1);
  const barWidth = 60;
  const chartHeight = 120;
  const gap = 20;

  const currentHeight = (current / maxVal) * (chartHeight - 20);
  const prevHeight = previous ? (previous / maxVal) * (chartHeight - 20) : 0;

  const totalWidth = previous != null ? barWidth * 2 + gap : barWidth;
  const change = previous ? Math.round(((current - previous) / previous) * 100) : 0;

  return (
    <div style={{ ...createCardStyle(tokens), padding: tokens.spacing[6] }}>
      <div style={{ ...typography.subtitle, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[4] }}>
        Team Velocity
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: gap }}>
        {previous != null && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ ...typography.caption, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[0] }}>
              {previous}
            </span>
            <svg width={barWidth} height={chartHeight}>
              <rect
                x={0}
                y={chartHeight - prevHeight}
                width={barWidth}
                height={prevHeight}
                rx={tokens.borderRadius.sm}
                fill={tokens.colors.primaryScale[200]}
              />
            </svg>
            <span style={{ ...typography.caption, color: tokens.colors.neutral[500], marginTop: tokens.spacing[0] }}>
              Previous
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ ...typography.body, color: tokens.colors.neutral[900], fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[0] }}>
            {current}
          </span>
          <svg width={barWidth} height={chartHeight}>
            <rect
              x={0}
              y={chartHeight - currentHeight}
              width={barWidth}
              height={currentHeight}
              rx={tokens.borderRadius.sm}
              fill={tokens.colors.primaryScale[500]}
            />
          </svg>
          <span style={{ ...typography.caption, color: tokens.colors.neutral[500], marginTop: tokens.spacing[0] }}>
            Current
          </span>
        </div>
      </div>

      {previous != null && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[1],
            marginTop: tokens.spacing[4],
            ...typography.body,
            color: change >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600],
            fontWeight: tokens.typography.fontWeight.semibold,
          }}
        >
          {change >= 0 ? <ArrowUpRight size={ICON_SIZES.label} /> : <ArrowDownRight size={ICON_SIZES.label} />}
          {change >= 0 ? '+' : ''}{change}% from previous sprint
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  List Section (Highlights / Improvements)                           */
/* ------------------------------------------------------------------ */

function ListSection({
  title,
  items,
  tokens,
  accentColor,
  icon: Icon,
}: {
  title: string;
  items: string[];
  tokens: PresetContext['tokens'];
  accentColor: string;
  icon: typeof Star;
}) {
  const typography = getPersonalityTypography(tokens);

  if (!items.length) return null;

  return (
    <div
      style={{
        ...createCardStyle(tokens),
        padding: tokens.spacing[6],
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          marginBottom: tokens.spacing[4],
          ...typography.subtitle,
          color: tokens.colors.neutral[900],
        }}
      >
        <Icon size={ICON_SIZES.section} style={{ color: accentColor }} />
        {title}
      </div>
      <ol style={{ margin: 0, paddingLeft: tokens.spacing[6] }}>
        {items.map((item, idx) => (
          <li
            key={idx}
            style={{
              ...typography.body,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[2],
              lineHeight: 1.6,
            }}
          >
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const SummaryBhSprintReview = createPreset<BhSprintReviewProps>(
  'SummaryBhSprintReview',
  ({ props, tokens }) => {
    const {
      data,
      loading = false,
      onViewDetails,
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
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} tokens={tokens} />
          ))}
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
              <BarChart3 size={ICON_SIZES.hero} />
            </div>
            <div style={{ ...typography.subtitle, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>No Sprint Review</div>
            <div style={{ ...typography.caption, color: tokens.colors.neutral[400] }}>
              Sprint review data is not available yet. The review will be generated once the sprint is completed.
            </div>
          </div>
        </div>
      );
    }

    // ================================================================
    // MAIN RENDER
    // ================================================================

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div>
          <div style={{ ...typography.title, color: tokens.colors.neutral[900] }}>{data.sprintName}</div>
          <div style={{ ...typography.caption, color: tokens.colors.neutral[500], marginTop: tokens.spacing[0] }}>
            {formatDateRange(data.startDate, data.endDate)}
          </div>
        </div>

        <div style={createDividerStyle(tokens)} />

        {/* Goals Section */}
        {data.goals.length > 0 && (
          <div>
            <div style={{ ...createPersonalitySectionHeaderStyle(tokens), marginBottom: tokens.spacing[4] }}>
              Sprint Goals
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: tokens.spacing[4] }}>
              {data.goals.map((goal, idx) => (
                <GoalCard key={idx} goal={goal} tokens={tokens} index={idx} onViewDetails={onViewDetails} />
              ))}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {data.metrics.length > 0 && (
          <div>
            <div style={{ ...createPersonalitySectionHeaderStyle(tokens), marginBottom: tokens.spacing[4] }}>
              Key Metrics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: tokens.spacing[4] }}>
              {data.metrics.map((metric, idx) => (
                <MetricCard key={idx} metric={metric} tokens={tokens} index={idx} onViewDetails={onViewDetails} />
              ))}
            </div>
          </div>
        )}

        {/* Velocity Chart */}
        <VelocityChart current={data.teamVelocity} previous={data.prevVelocity} tokens={tokens} />

        {/* Highlights & Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: tokens.spacing[4] }}>
          <ListSection
            title="Highlights"
            items={data.highlights}
            tokens={tokens}
            accentColor={tokens.colors.successScale[500]}
            icon={Award}
          />
          <ListSection
            title="Improvements"
            items={data.improvements}
            tokens={tokens}
            accentColor={tokens.colors.warningScale[500]}
            icon={Lightbulb}
          />
        </div>
      </div>
    );
  }
);

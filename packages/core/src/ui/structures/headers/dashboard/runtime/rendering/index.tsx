'use client';

/**
 * @fileoverview DashboardHeader rendering — one engine-agnostic implementation.
 *
 * @description
 * Header for operational cockpit pages: dashboards, analytics views, real-time
 * monitors, event-day command centers. Unlike CollectionHeader (hero title +
 * action cluster) or DetailHeader (entity breadcrumbs + tabs), it carries a
 * metric readout and an operational state beside the page identity.
 *
 * The structure stamps anatomy (`data-part`) and state (`data-compact`,
 * `data-has-icon`, `data-has-metrics`, `data-has-actions`, `data-status`,
 * `data-direction`) and nothing else: `skin/dashboard-header.css` owns 100% of
 * layout and paint, anchored on the `.ds-structure.ds-dashboard-header` scope
 * class. No inline style survives here — one would outrank every tenant
 * channel. Engines resolve through the composed `Button`; the structure itself
 * does not fork.
 *
 * Sits ABOVE `structures/dashboard/stats-header` on the same page: that family
 * owns the pulse CARDS (composed Statistic, sparkline, progress, per-stat
 * accent). This one owns page identity and the at-a-glance READOUT — a
 * hairline-separated rail, never a card grid.
 *
 * @module Structures/Headers/DashboardHeader/Runtime/Rendering
 * @category Structure
 * @package @rottay/design-system
 */

import { useId } from 'react';

import { Button } from '../../../../../primitives/inputs/Button';
import { DataTrendIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-trend';
import { DataTrendDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-trend-down';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import {
  STATUS_LABEL_FLOOR,
  type DashboardAction,
  type DashboardHeaderProps,
  type DashboardMetric,
  type DashboardStatusState,
} from '../../contracts';

/* ------------------------------------------------------------------ */
/* Status marker                                                       */
/* ------------------------------------------------------------------ */

/**
 * Operational state beside the title. The label always renders, so the state
 * survives colour-blindness and forced-colors; the pulse is skin-owned so the
 * reduced-motion guard can reach it.
 */
function StatusMarker({ state, label }: { state: DashboardStatusState; label?: string }) {
  const i18n = useOptionalTranslation('common');
  const resolvedLabel =
    label ?? i18n?.tOr(`dashboard_status_${state}`, STATUS_LABEL_FLOOR[state]) ?? STATUS_LABEL_FLOOR[state];

  return (
    <span data-part="status-dot" data-state={state}>
      <span data-part="status-dot-glyph" data-state={state} aria-hidden="true" />
      <span data-part="status-dot-text" data-state={state}>
        <bdi>{resolvedLabel}</bdi>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Metric cell                                                         */
/* ------------------------------------------------------------------ */

/**
 * One KPI in the readout rail. Direction rides the governed trend icon AND the
 * sign in the text; the skin's tint is a third, redundant channel.
 */
function MetricCell({ metric }: { metric: DashboardMetric }) {
  const direction = metric.change?.direction;
  const TrendIcon = direction === 'up' ? DataTrendIcon : direction === 'down' ? DataTrendDownIcon : null;
  const sign = direction === 'up' ? '+' : direction === 'down' ? '-' : '';

  return (
    <div data-part="metric-chip" data-direction={direction ?? 'none'}>
      {metric.icon && (
        <span data-part="metric-chip-icon" aria-hidden="true">
          {metric.icon}
        </span>
      )}
      <span data-part="metric-chip-label">
        <bdi>{metric.label}</bdi>
      </span>
      <span data-part="metric-chip-readout">
        <span data-part="metric-chip-value">
          <bdi>{metric.value}</bdi>
        </span>
        {metric.change && (
          <span data-part="metric-chip-change" data-direction={metric.change.direction}>
            {TrendIcon && (
              <span data-part="metric-chip-trend">
                <TrendIcon decorative size={12} />
              </span>
            )}
            {sign}
            {metric.change.value}
          </span>
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Action                                                              */
/* ------------------------------------------------------------------ */

/**
 * `aria-label` is always the full label, so the accessible name survives the
 * narrow-container cut that hides the visible text on icon-bearing actions.
 * Both strings are identical, so label-in-name holds.
 */
function ActionButton({ action }: { action: DashboardAction }) {
  const variant =
    action.variant === 'primary' ? 'primary' : action.variant === 'secondary' ? 'default' : 'ghost';

  return (
    <Button
      htmlType="button"
      variant={variant}
      size="sm"
      onClick={action.onClick}
      icon={action.icon}
      aria-label={action.label}
      className="ds-dashboard-header__action"
    >
      <span data-part="action-label" data-has-icon={action.icon ? 'true' : 'false'}>
        {action.label}
      </span>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function DashboardHeaderImpl({
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
  const i18n = useOptionalTranslation('common');
  const keyMetricsLabel = i18n?.tOr('key_metrics', 'Key metrics') ?? 'Key metrics';
  const titleId = useId();

  const hasMetrics = !!metrics && metrics.length > 0;
  const hasActions = (!!actions && actions.length > 0) || !!searchSlot || !!timeRangeSlot;

  return (
    // No `role="banner"`: a page header nested under the shell's `<main>` is
    // not the site banner, and forcing the landmark duplicates the shell's own.
    // The `<h1>` names the region instead.
    <header
      className="ds-structure ds-dashboard-header"
      data-part="root"
      data-compact={compact ? 'true' : 'false'}
      data-has-icon={icon ? 'true' : 'false'}
      data-has-metrics={hasMetrics ? 'true' : 'false'}
      data-has-actions={hasActions ? 'true' : 'false'}
      data-status={status?.state ?? 'none'}
      aria-labelledby={titleId}
    >
      <div data-part="header-row">
        <div data-part="identity">
          {icon && (
            <span data-part="icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <div data-part="copy">
            <div data-part="title-row">
              <h1 data-part="title" id={titleId}>
                <bdi>{title}</bdi>
              </h1>
              {status && <StatusMarker state={status.state} label={status.label} />}
            </div>
            {subtitle && (
              <p data-part="subtitle">
                <bdi>{subtitle}</bdi>
              </p>
            )}
          </div>
        </div>

        {hasActions && (
          <div data-part="actions">
            {timeRangeSlot && <div data-part="time-range">{timeRangeSlot}</div>}
            {searchSlot && <div data-part="search">{searchSlot}</div>}
            {actions?.map((action) => (
              <ActionButton key={action.key} action={action} />
            ))}
          </div>
        )}
      </div>

      {/* The readout overflows by design on narrow containers, so it is its own
          tab stop: a keyboard-only user must be able to scroll it (WCAG 2.1.1).
          Its focus ring is skin-owned. */}
      {metrics && metrics.length > 0 && (
        <div
          data-part="metrics-row"
          data-compact={compact ? 'true' : 'false'}
          role="group"
          aria-label={keyMetricsLabel}
          tabIndex={0}
        >
          {metrics.map((metric) => (
            <MetricCell key={metric.key} metric={metric} />
          ))}
        </div>
      )}
    </header>
  );
}

export default DashboardHeaderImpl;

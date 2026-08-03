'use client';

/**
 * @fileoverview Modern (token-driven) engine for the ApprovalInbox pattern.
 * Renders grouped approval items organized by domain: each row composes real
 * DS primitives — Checkbox (batch selection), Badge (group count and risk,
 * tone + governed status icon + text label, never colour alone) and Button
 * (approve/reject with governed action icons and the canonical `pending`
 * busy channel) — never recreations.
 *
 * ASYNC LAW: action callbacks keep their `void` contract, but when a consumer
 * returns a thenable (assignable in TS) the row holds a governed busy state
 * (Button `pending` + `pendingLabel`, sibling action disabled) until it
 * settles — no optimistic removal, no double-submit.
 *
 * COPY: all strings resolve through the optional `components` i18n channel
 * with a documented English floor (parameters ride `tOr` params; the floor
 * is pre-interpolated so a missing catalog never echoes a raw key).
 *
 * ANATOMY: every node carries a stable `data-part`; geometry and paint live
 * in the modern `approval-inbox.css` skin (logical properties only, named
 * `ds-approval-inbox` container drives the narrow-row collapse).
 *
 * @example
 * <ModernApprovalInbox
 *   groups={[{ domain: 'Finance', items: [{ id: '1', title: 'Invoice #4521',
 *     amount: 12500, risk: 'low', submittedAt: '2026-03-17T09:00:00Z' }] }]}
 *   onApprove={(id) => approve(id)}
 *   onReject={(id) => reject(id)}
 *   onBatchApprove={(ids) => batchApprove(ids)}
 * />
 */

import React, { useCallback, useState } from 'react';
import type { ApprovalInboxProps, ApprovalItem, ApprovalGroup } from '../../contracts';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernCheckbox from '../../../../../primitives/inputs/Checkbox/engines/modern';
import ModernBadge from '../../../../../primitives/display/Badge/engines/modern';
import { ModernEmptyState } from '../../../../facade';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionConfirmIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-confirm';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { SecurityAlertIcon } from '@/graphics/icons/presentation/semantic/generated/roles/security-alert';
import { TimeDeadlineIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-deadline';
import { TimeTimestampIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-timestamp';

/** Risk level → Badge tone (colour) + governed icon (shape) + label (text). */
const RISK_TONE: Record<NonNullable<ApprovalItem['risk']>, 'neutral' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

/** Risk level → governed icon: high and critical share a tone, never a shape. */
const RISK_ICON: Record<NonNullable<ApprovalItem['risk']>, React.ReactNode> = {
  low: <StatusInfoIcon decorative size={12} />,
  medium: <StatusWarningIcon decorative size={12} />,
  high: <StatusWarningIcon decorative size={12} />,
  critical: <SecurityAlertIcon decorative size={12} />,
};

/** SLA urgency bucket computed from the deadline distance. */
type SlaUrgency = 'normal' | 'warning' | 'critical';

/** Computes SLA urgency from a deadline timestamp. */
function getSlaUrgency(deadline?: string): SlaUrgency | null {
  if (!deadline) return null;
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / 3_600_000;
  if (hoursLeft < 0) return 'critical';
  if (hoursLeft < 4) return 'warning';
  return 'normal';
}

/** Runtime thenable guard: `void` callbacks pass straight through. */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/** Formats a monetary amount as grouped tabular figures (currency-neutral:
    the contract carries no currency code; see the batch fragment). */
function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/**
 * A single approval row: selection checkbox, title + risk badge, audit
 * metadata (subtitle + relative submission time), tabular amount, SLA
 * indicator, and the approve/reject action pair.
 */
function InboxItemRow({
  item,
  selectable,
  selected,
  pendingAction,
  anyPending,
  onToggle,
  onApprove,
  onReject,
  t,
}: {
  item: ApprovalItem;
  selectable: boolean;
  selected: boolean;
  pendingAction: 'approve' | 'reject' | null;
  anyPending: boolean;
  onToggle: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  t: (key: string, floor: string, params?: Record<string, string | number>) => string;
}) {
  const slaUrgency = getSlaUrgency(item.slaDeadline);

  /** Relative submission copy, localized with an English floor. */
  const submitted = (() => {
    const diffMin = Math.floor((Date.now() - new Date(item.submittedAt).getTime()) / 60_000);
    if (diffMin < 1) return t('approvalInbox.submitted.justNow', 'just now');
    if (diffMin < 60) {
      return t('approvalInbox.submitted.minutesAgo', `${diffMin}m ago`, { count: diffMin });
    }
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return t('approvalInbox.submitted.hoursAgo', `${diffHr}h ago`, { count: diffHr });
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return t('approvalInbox.submitted.daysAgo', `${diffDay}d ago`, { count: diffDay });
    return new Date(item.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  })();

  /** SLA countdown copy (null when the item carries no deadline). */
  const slaText = (() => {
    if (!item.slaDeadline) return null;
    const hoursLeft = (new Date(item.slaDeadline).getTime() - Date.now()) / 3_600_000;
    if (hoursLeft < 0) return t('approvalInbox.sla.overdue', 'Overdue');
    if (hoursLeft < 1) {
      const mins = Math.round(hoursLeft * 60);
      return t('approvalInbox.sla.minutesLeft', `${mins}m left`, { count: mins });
    }
    if (hoursLeft < 24) {
      const hrs = Math.round(hoursLeft);
      return t('approvalInbox.sla.hoursLeft', `${hrs}h left`, { count: hrs });
    }
    const days = Math.round(hoursLeft / 24);
    return t('approvalInbox.sla.daysLeft', `${days}d left`, { count: days });
  })();

  return (
    <div data-part="item" data-selected={selected || undefined}>
      {selectable && (
        <div data-part="item-select">
          <ModernCheckbox
            checked={selected}
            onChange={() => onToggle(item.id)}
            aria-label={t('approvalInbox.selectItem', `Select ${item.title}`, { title: item.title })}
          />
        </div>
      )}

      <div data-part="item-main">
        <div data-part="item-title-row">
          <span data-part="item-title">{item.title}</span>
          {item.risk && (
            <ModernBadge
              kind="pill"
              size="sm"
              tone={RISK_TONE[item.risk]}
              icon={RISK_ICON[item.risk]}
              data-part="item-risk-badge"
              data-risk={item.risk}
              content={t(`approvalInbox.risk.${item.risk}`, item.risk.toUpperCase())}
            />
          )}
        </div>
        <div data-part="item-meta">
          {item.subtitle && <span data-part="item-subtitle">{item.subtitle}</span>}
          <span data-part="item-submitted">
            <TimeTimestampIcon decorative size={12} data-part="item-submitted-icon" />
            {submitted}
          </span>
        </div>
      </div>

      <div data-part="item-figures">
        {item.amount != null && (
          <span data-part="item-amount">{formatAmount(item.amount)}</span>
        )}
        {slaText && slaUrgency && (
          <span data-part="item-sla" data-urgency={slaUrgency}>
            <TimeDeadlineIcon decorative size={12} data-part="item-sla-icon" />
            {slaText}
          </span>
        )}
      </div>

      {(onApprove || onReject) && (
        <div data-part="item-actions">
          {onApprove && (
            <ModernButton
              variant="ghost"
              size="sm"
              data-part="item-action-button"
              data-action="approve"
              icon={<ActionConfirmIcon decorative size={14} />}
              pending={pendingAction === 'approve'}
              pendingLabel={t('approvalInbox.approving', 'Approving…')}
              disabled={anyPending && pendingAction !== 'approve'}
              aria-label={t('approvalInbox.approveItem', `Approve ${item.title}`, { title: item.title })}
              onClick={() => onApprove(item.id)}
            >
              {t('approvalInbox.approve', 'Approve')}
            </ModernButton>
          )}
          {onReject && (
            <ModernButton
              variant="ghost"
              size="sm"
              data-part="item-action-button"
              data-action="reject"
              icon={<ActionCloseIcon decorative size={14} />}
              pending={pendingAction === 'reject'}
              pendingLabel={t('approvalInbox.rejecting', 'Rejecting…')}
              disabled={anyPending && pendingAction !== 'reject'}
              aria-label={t('approvalInbox.rejectItem', `Reject ${item.title}`, { title: item.title })}
              onClick={() => onReject(item.id)}
            >
              {t('approvalInbox.reject', 'Reject')}
            </ModernButton>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Modern engine for the ApprovalInbox pattern (see the module docblock).
 *
 * @param props - {@link ApprovalInboxProps}
 * @returns Grouped approval cards with batch toolbar and item action rows.
 */
export default function ModernApprovalInbox(props: ApprovalInboxProps) {
  const translation = useOptionalTranslation('components');
  const t = (key: string, floor: string, params?: Record<string, string | number>): string =>
    translation?.tOr(key, floor, params) ?? floor;

  const {
    groups,
    onApprove,
    onReject,
    onBatchApprove,
    emptyMessage,
    loading,
    className,
    style,
  } = props;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Per-item async action in flight (held until a returned thenable settles). */
  const [pendingItem, setPendingItem] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [batchPending, setBatchPending] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Runs an item action, holding the governed busy state while it settles. */
  const runItemAction = useCallback(
    (id: string, action: 'approve' | 'reject', callback: ((id: string) => void) | undefined) => {
      if (!callback || pendingItem) return;
      const result: unknown = callback(id);
      if (isThenable(result)) {
        setPendingItem({ id, action });
        Promise.resolve(result).finally(() => setPendingItem(null));
      }
    },
    [pendingItem]
  );

  /** Runs the batch approve, clearing the selection once it settles. */
  const runBatchApprove = useCallback(() => {
    if (!onBatchApprove || batchPending || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const result: unknown = onBatchApprove(ids);
    if (isThenable(result)) {
      setBatchPending(true);
      Promise.resolve(result).finally(() => {
        setBatchPending(false);
        setSelectedIds(new Set());
      });
    } else {
      setSelectedIds(new Set());
    }
  }, [onBatchApprove, batchPending, selectedIds]);

  const rootClassName = ['ds-pattern-approval-inbox', 'ds-engine-modern', className]
    .filter(Boolean)
    .join(' ');

  const totalItems = groups.reduce((sum: number, g: ApprovalGroup) => sum + g.items.length, 0);

  /* Skeleton keeps the group-card footprint (header bar + item rows) so the
     inbox holds its approximate geometry while data loads. */
  if (loading) {
    return (
      <div className={rootClassName} data-part="root" data-loading="true" style={style}>
        <div data-part="skeleton">
          {[1, 2].map((group) => (
            <div key={group} data-part="skeleton-group">
              <div data-part="skeleton-header" />
              {[1, 2, 3].map((row) => (
                <div key={row} data-part="skeleton-row">
                  <div data-part="skeleton-row-lines">
                    <div data-part="skeleton-line" data-width="half" />
                    <div data-part="skeleton-line" data-width="third" />
                  </div>
                  <div data-part="skeleton-line" data-width="action" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className={rootClassName} data-part="root" data-loading="false" style={style}>
        <div data-part="empty">
          <ModernEmptyState
            title={emptyMessage ?? t('approvalInbox.empty', 'No pending approvals')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName} data-part="root" data-loading="false" style={style}>
      {/* Batch toolbar appears only while a selection exists. */}
      {onBatchApprove && selectedIds.size > 0 && (
        <div
          data-part="batch-toolbar"
          role="region"
          aria-label={t('approvalInbox.batchRegion', 'Batch actions')}
        >
          <span data-part="batch-count" aria-live="polite">
            {t('approvalInbox.selectedCount', `${selectedIds.size} selected`, { count: selectedIds.size })}
          </span>
          <ModernButton
            variant="primary"
            size="sm"
            data-part="batch-approve-button"
            icon={<ActionConfirmIcon decorative size={14} />}
            pending={batchPending}
            pendingLabel={t('approvalInbox.approving', 'Approving…')}
            onClick={runBatchApprove}
          >
            {t('approvalInbox.batchApprove', 'Batch approve')}
          </ModernButton>
          <ModernButton
            variant="ghost"
            size="sm"
            data-part="batch-clear-button"
            disabled={batchPending}
            onClick={() => setSelectedIds(new Set())}
          >
            {t('approvalInbox.clear', 'Clear')}
          </ModernButton>
        </div>
      )}

      <div data-part="groups">
        {groups.map((group) => (
          <div
            key={group.domain}
            data-part="group"
            role="group"
            aria-label={group.domain}
          >
            <div data-part="group-header">
              <span data-part="group-title">{group.domain}</span>
              <ModernBadge
                kind="pill"
                size="sm"
                tone="neutral"
                data-part="group-count"
                content={group.items.length}
              />
            </div>
            <div data-part="group-items">
              {group.items.map((item) => (
                <InboxItemRow
                  key={item.id}
                  item={item}
                  selectable={Boolean(onBatchApprove)}
                  selected={selectedIds.has(item.id)}
                  pendingAction={pendingItem?.id === item.id ? pendingItem.action : null}
                  anyPending={pendingItem !== null || batchPending}
                  onToggle={toggleSelection}
                  onApprove={onApprove ? (id) => runItemAction(id, 'approve', onApprove) : undefined}
                  onReject={onReject ? (id) => runItemAction(id, 'reject', onReject) : undefined}
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

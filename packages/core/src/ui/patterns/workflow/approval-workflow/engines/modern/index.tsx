'use client';

/**
 * @fileoverview Modern engine for the ApprovalWorkflow pattern.
 * Builds a custom vertical timeline with dot + connector-line indicators. Each step
 * renders an approver name, status badge, optional comments, and -- on the active
 * pending step -- action buttons for approve, reject, and escalate.
 *
 * COMPOSITION LAW (Lote 2): the three action buttons are the public Button
 * primitive and the status/entity badges are the public Badge primitive
 * (caller `data-part` wins the root anatomy hook per P-79, so
 * `approval-workflow.css` owns their paint keyed on `data-action` /
 * `data-status`). The raw `<button>` elements, the `pillBadgeSmStyle` pill
 * spans, the Tailwind layout utilities and the dot's `animate-pulse` are
 * gone; their geometry and pulse moved to the skin. Status and action copy
 * is localized through `useOptionalTranslation('components')` with the
 * documented English floor.
 *
 * @example
 * <ModernApprovalWorkflow
 *   title="Expense Report"
 *   entity="EXP-9981"
 *   steps={[{ key: 'fin', approver: 'Finance Team', status: 'pending' }]}
 *   currentStep={0}
 *   onApprove={(key) => approve(key)}
 *   onReject={(key) => reject(key)}
 * />
 */

import React, { useCallback, useState } from 'react';
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../../contracts';
import { Button } from '../../../../../primitives/inputs/Button';
import { Badge } from '../../../../../primitives/display/Badge';
import { ModernEmptyState } from '../../../../facade';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusPendingIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-pending';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusNeutralIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-neutral';

const STATUS_TONE: Record<ApprovalStatus, 'neutral' | 'success' | 'danger' | 'warning'> = {
  pending: 'neutral',
  approved: 'success',
  rejected: 'danger',
  escalated: 'warning',
  skipped: 'neutral',
};

/** Status recipe shared with the workflow family: governed icon + text label
    + tone — a status never reads through colour alone. */
const STATUS_ICON: Record<ApprovalStatus, React.ReactNode> = {
  pending: <StatusPendingIcon decorative size={12} />,
  approved: <StatusSuccessIcon decorative size={12} />,
  rejected: <StatusErrorIcon decorative size={12} />,
  escalated: <StatusWarningIcon decorative size={12} />,
  skipped: <StatusNeutralIcon decorative size={12} />,
};

/** Runtime thenable guard: `void` callbacks pass straight through. */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/** English floor for the status labels (catalog keys ride tOr on top). */
const STATUS_FALLBACK: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  skipped: 'Skipped',
};

/**
 * A single node in the approval timeline. Renders the dot indicator, connector
 * line, approver identity, status badge, and optional supplementary content.
 *
 * The dot pulses only when this is the current pending step (skin-owned
 * keyframes) to indicate it requires user action. Escalate stays the
 * outline (secondary) affordance next to the filled approve/reject pair.
 */
function StepNode({ step, isCurrent, isLast, onApprove, onReject, onEscalate, actionsDisabled, pendingAction, t }: {
  step: ApprovalStep;
  isCurrent: boolean;
  isLast: boolean;
  onApprove?: (key: string) => void;
  onReject?: (key: string) => void;
  onEscalate?: (key: string) => void;
  actionsDisabled?: boolean;
  pendingAction?: 'approve' | 'reject' | 'escalate' | null;
  t: (key: string, fallback: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <li data-part="step" data-status={step.status} data-current={isCurrent} aria-current={isCurrent ? 'step' : undefined}>
      {/* Timeline column: dot + vertical connector line (logical geometry in
          the skin; flexbox already follows the inline direction in RTL). */}
      <div data-part="step-track">
        <div
          data-part="step-dot"
          data-status={step.status}
          data-current={isCurrent}
        />
        {/* Hide the connector on the last step to avoid a dangling line */}
        {!isLast && <div data-part="step-connector" data-status={step.status} />}
      </div>

      {/* Content column: identity row, contextual details, and actions */}
      <div data-part="step-content">
        <div data-part="step-approver-row">
          {step.avatar && <span data-part="step-avatar">{step.avatar}</span>}
          <span data-part="step-approver">{step.approver}</span>
          <Badge
            engine="modern"
            kind="pill"
            size="sm"
            tone={STATUS_TONE[step.status]}
            icon={STATUS_ICON[step.status]}
            data-part="step-status-badge"
            data-status={step.status}
            content={t(`approvalWorkflow.status.${step.status}`, STATUS_FALLBACK[step.status])}
          />
        </div>

        {step.timestamp && (
          <p data-part="step-timestamp">
            {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
          </p>
        )}

        {step.comments && (
          <div data-part="step-comment">{step.comments}</div>
        )}

        {/* Arbitrary metadata entries rendered as key-value pairs */}
        {step.metadata && (
          <div data-part="step-metadata">
            {Object.entries(step.metadata).map(([k, v]) => (
              <div key={k}><span data-part="step-metadata-key">{k}:</span> {v}</div>
            ))}
          </div>
        )}

        {/* Action buttons only appear on the current step when it is still pending.
            Callbacks are optional -- omitting onEscalate hides the Escalate button.
            Each button names its approver (label-in-name) and rides the canonical
            Button busy channel while a returned thenable is in flight. */}
        {isCurrent && step.status === 'pending' && (
          <div data-part="step-actions">
            {onApprove && (
              <Button
                engine="modern"
                variant="ghost"
                size="sm"
                data-part="step-action-button"
                data-action="approve"
                disabled={actionsDisabled || (pendingAction != null && pendingAction !== 'approve')}
                pending={pendingAction === 'approve'}
                pendingLabel={t('approvalWorkflow.action.approving', 'Approving…')}
                aria-label={t('approvalWorkflow.action.approveFor', `Approve ${step.approver}`, { approver: step.approver })}
                onClick={() => onApprove(step.key)}
              >
                {t('approvalWorkflow.action.approve', 'Approve')}
              </Button>
            )}
            {onReject && (
              <Button
                engine="modern"
                variant="ghost"
                size="sm"
                data-part="step-action-button"
                data-action="reject"
                disabled={actionsDisabled || (pendingAction != null && pendingAction !== 'reject')}
                pending={pendingAction === 'reject'}
                pendingLabel={t('approvalWorkflow.action.rejecting', 'Rejecting…')}
                aria-label={t('approvalWorkflow.action.rejectFor', `Reject ${step.approver}`, { approver: step.approver })}
                onClick={() => onReject(step.key)}
              >
                {t('approvalWorkflow.action.reject', 'Reject')}
              </Button>
            )}
            {onEscalate && (
              <Button
                engine="modern"
                variant="ghost"
                size="sm"
                data-part="step-action-button"
                data-action="escalate"
                disabled={actionsDisabled || (pendingAction != null && pendingAction !== 'escalate')}
                pending={pendingAction === 'escalate'}
                pendingLabel={t('approvalWorkflow.action.escalating', 'Escalating…')}
                aria-label={t('approvalWorkflow.action.escalateFor', `Escalate ${step.approver}`, { approver: step.approver })}
                onClick={() => onEscalate(step.key)}
              >
                {t('approvalWorkflow.action.escalate', 'Escalate')}
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Modern engine for the ApprovalWorkflow pattern.
 *
 * Renders a card containing a vertical timeline of `StepNode` components
 * composed from DS primitives (see the module docblock).
 *
 * @param props - {@link ApprovalWorkflowProps}
 * @returns A styled card with a custom vertical approval timeline.
 */
export default function ModernApprovalWorkflow(props: ApprovalWorkflowProps) {
  const { title, entity, steps, currentStep = 0, onApprove, onReject, onEscalate, actionsDisabled, footer, loading, className, style } = props;

  /* ---- localized copy (components catalog, English floor) ---- */
  const translation = useOptionalTranslation('components');
  const t = (key: string, fallback: string, params?: Record<string, string | number>): string =>
    translation?.tOr(key, fallback, params) ?? fallback;

  /* ---- async action busy state ----------------------------------------------
     Callbacks keep their `void` contract; when a consumer returns a thenable
     (assignable in TS) the step holds a governed busy state (Button `pending`
     + `pendingLabel`, sibling actions disabled) until it settles. */
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'escalate' | null>(null);

  const runAction = useCallback(
    (key: string, action: 'approve' | 'reject' | 'escalate', callback: ((key: string) => void) | undefined) => {
      if (!callback || pendingAction != null) return;
      const result: unknown = callback(key);
      if (isThenable(result)) {
        setPendingAction(action);
        Promise.resolve(result).finally(() => setPendingAction(null));
      }
    },
    [pendingAction]
  );

  // Skeleton loading state mimics the timeline structure (3 placeholder rows)
  // so the card maintains its approximate height while data loads.
  if (loading) {
    return (
      <div
        className={['ds-pattern-approval-workflow', 'ds-engine-modern', className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="true"
        style={style}
      >
        <div data-part="skeleton">
          <div data-part="skeleton-line" data-width="third" />
          <div data-part="skeleton-steps">
            {[1, 2, 3].map((i) => (
              <div key={i} data-part="skeleton-row">
                <div data-part="skeleton-dot" />
                <div data-part="skeleton-row-lines">
                  <div data-part="skeleton-line" data-width="quarter" />
                  <div data-part="skeleton-line" data-width="half" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={['ds-pattern-approval-workflow', 'ds-engine-modern', className].filter(Boolean).join(' ')}
      data-part="root"
      data-loading="false"
      style={style}
    >
      <div data-part="body">
        {/* Header with workflow title and optional entity identifier badge */}
        <div data-part="header">
          <h3 data-part="title">{title}</h3>
          {entity && (
            <Badge
              engine="modern"
              kind="pill"
              size="sm"
              tone="neutral"
              data-part="entity-badge"
            >
              {entity}
            </Badge>
          )}
        </div>

        {/* Timeline: one StepNode per approval step, ordered sequentially — an
            ordered list so AT announces position ("2 of 3"); the current step
            carries aria-current. An empty chain reads as the canonical empty
            kit (all caught up). */}
        {steps.length === 0 ? (
          <div data-part="empty">
            <ModernEmptyState title={t('approvalWorkflow.empty', 'All caught up')} />
          </div>
        ) : (
          <ol data-part="timeline">
            {steps.map((step, i) => (
              <StepNode
                key={step.key}
                step={step}
                isCurrent={i === currentStep}
                isLast={i === steps.length - 1}
                onApprove={onApprove ? (key) => runAction(key, 'approve', onApprove) : undefined}
                onReject={onReject ? (key) => runAction(key, 'reject', onReject) : undefined}
                onEscalate={onEscalate ? (key) => runAction(key, 'escalate', onEscalate) : undefined}
                actionsDisabled={actionsDisabled}
                pendingAction={pendingAction}
                t={t}
              />
            ))}
          </ol>
        )}

        {footer && (
          <div data-part="footer">{footer}</div>
        )}
      </div>
    </div>
  );
}

'use client';

/**
 * @fileoverview Modern engine for the ApprovalWorkflow pattern.
 * Builds a custom vertical timeline with dot + connector-line indicators. Each step
 * renders an approver name, status badge, optional comments, and -- on the active
 * pending step -- action buttons for approve, reject, and escalate.
 *
 * Uses DS token CSS variables for colors/surfaces and Tailwind utilities for layout.
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

import React from 'react';
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../ApprovalWorkflow.types';
import { panelCardStyle, cardBodyStyle, pillBadgeSmStyle } from '../../../_internal/engines/modern/styles';

// "skipped" is de-emphasized with reduced opacity, distinguishing it from
// "pending" which is at full opacity. Opacity is not a skin channel, so it
// stays inline; the badge's colors resolve from `data-status` in
// `tokens/css/engines/modern/skin/approval-workflow.css`.
const statusBadgeStyle: Partial<Record<ApprovalStatus, React.CSSProperties>> = {
  skipped: { opacity: 0.5 },
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  skipped: 'Skipped',
};

// Box metrics shared by the three action buttons. Their per-action colors and
// border resolve from `data-action` in the skin.
const actionButtonStyle: React.CSSProperties = {
  height: 32,
  padding: '0 12px',
  fontSize: 13,
  cursor: 'pointer',
};

/**
 * A single node in the approval timeline. Renders the dot indicator, connector
 * line, approver identity, status badge, and optional supplementary content.
 *
 * The dot color is derived from the step's status, with one exception: the
 * current pending step uses `--ds-color-primary` with `animate-pulse` to draw the reviewer's
 * attention to the step that awaits their decision.
 *
 * Escalate uses an outline style instead of a filled variant to visually signal
 * that it is a secondary action compared to approve/reject.
 */
function StepNode({ step, isCurrent, isLast, onApprove, onReject, onEscalate, actionsDisabled }: {
  step: ApprovalStep;
  isCurrent: boolean;
  isLast: boolean;
  onApprove?: (key: string) => void;
  onReject?: (key: string) => void;
  onEscalate?: (key: string) => void;
  actionsDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3" data-part="step" data-status={step.status} data-current={isCurrent}>
      {/* Timeline column: dot + vertical connector line.
          The dot animates (pulse) only when this is the current pending step
          to indicate it requires user action. */}
      <div className="flex flex-col items-center">
        <div
          data-part="step-dot"
          data-status={step.status}
          data-current={isCurrent}
          className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5${isCurrent && step.status === 'pending' ? ' animate-pulse' : ''}`}
        />
        {/* Hide the connector on the last step to avoid a dangling line */}
        {!isLast && <div data-part="step-connector" data-status={step.status} className="w-0.5 flex-1 min-h-[2rem]" />}
      </div>

      {/* Content column: identity row, contextual details, and actions */}
      <div data-part="step-content" className={`pb-6 flex-1 ${isCurrent ? '' : ''}`}>
        <div data-part="step-approver-row" className="flex items-center gap-2 flex-wrap">
          {step.avatar && <span className="flex-shrink-0">{step.avatar}</span>}
          <span data-part="step-approver" className="font-medium text-sm">{step.approver}</span>
          <div data-part="step-status-badge" data-status={step.status} style={{ ...pillBadgeSmStyle, ...statusBadgeStyle[step.status] }}>{statusLabel[step.status]}</div>
        </div>

        {step.timestamp && (
          <p data-part="step-timestamp" className="text-xs mt-1">
            {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
          </p>
        )}

        {step.comments && (
          <div data-part="step-comment" className="mt-2 p-2 rounded-lg text-sm">{step.comments}</div>
        )}

        {/* Arbitrary metadata entries rendered as key-value pairs */}
        {step.metadata && (
          <div data-part="step-metadata" className="mt-1 text-xs">
            {Object.entries(step.metadata).map(([k, v]) => (
              <div key={k}><span className="font-medium">{k}:</span> {v}</div>
            ))}
          </div>
        )}

        {/* Action buttons only appear on the current step when it is still pending.
            Callbacks are optional -- omitting onEscalate hides the Escalate button. */}
        {isCurrent && step.status === 'pending' && (
          <div data-part="step-actions" className="flex gap-2 mt-3">
            {onApprove && (
              <button data-part="step-action-button" data-action="approve" style={actionButtonStyle} disabled={actionsDisabled} onClick={() => onApprove(step.key)}>
                Approve
              </button>
            )}
            {onReject && (
              <button data-part="step-action-button" data-action="reject" style={actionButtonStyle} disabled={actionsDisabled} onClick={() => onReject(step.key)}>
                Reject
              </button>
            )}
            {onEscalate && (
              <button data-part="step-action-button" data-action="escalate" style={actionButtonStyle} disabled={actionsDisabled} onClick={() => onEscalate(step.key)}>
                Escalate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Modern engine for the ApprovalWorkflow pattern.
 *
 * Renders a card containing a hand-rolled vertical timeline of
 * `StepNode` components. Unlike the Classic engine (which delegates layout to
 * Ant Steps), this engine builds its own dot-and-line timeline for full
 * control over styling via DS token CSS variables and Tailwind layout utilities.
 *
 * @param props - {@link ApprovalWorkflowProps}
 * @returns A styled card with a custom vertical approval timeline.
 */
export default function ModernApprovalWorkflow(props: ApprovalWorkflowProps) {
  const { title, entity, steps, currentStep = 0, onApprove, onReject, onEscalate, actionsDisabled, footer, loading, className, style } = props;

  // Skeleton loading state mimics the timeline structure (3 placeholder rows)
  // so the card maintains its approximate height while data loads.
  if (loading) {
    return (
      <div
        className={['ds-pattern-approval-workflow', 'ds-engine-modern', className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="true"
        style={{ ...panelCardStyle, ...style }}
      >
        <div className="animate-pulse" data-part="skeleton" style={cardBodyStyle}>
          <div data-part="skeleton-line" className="h-5 rounded w-1/3 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} data-part="skeleton-row" className="flex gap-3">
                <div data-part="skeleton-dot" className="w-3 h-3 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <div data-part="skeleton-line" className="h-4 rounded w-1/4" />
                  <div data-part="skeleton-line" className="h-3 rounded w-1/2" />
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
      style={{ ...panelCardStyle, ...style }}
    >
      <div style={cardBodyStyle}>
        {/* Header with workflow title and optional entity identifier badge */}
        <div data-part="header" className="flex items-center gap-2 mb-4">
          <h3 data-part="title" className="text-lg font-semibold">{title}</h3>
          {entity && <div data-part="entity-badge" style={pillBadgeSmStyle}>{entity}</div>}
        </div>

        {/* Timeline: one StepNode per approval step, ordered sequentially */}
        <div data-part="timeline">
          {steps.map((step, i) => (
            <StepNode
              key={step.key}
              step={step}
              isCurrent={i === currentStep}
              isLast={i === steps.length - 1}
              onApprove={onApprove}
              onReject={onReject}
              onEscalate={onEscalate}
              actionsDisabled={actionsDisabled}
            />
          ))}
        </div>

        {footer && (
          <div data-part="footer" className="mt-4 pt-4 border-t">{footer}</div>
        )}
      </div>
    </div>
  );
}

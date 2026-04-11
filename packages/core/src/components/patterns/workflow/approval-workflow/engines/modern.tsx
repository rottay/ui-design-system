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

// Inline styles mapped from domain statuses for badge variants.
// "skipped" uses reduced opacity to visually de-emphasize it,
// distinguishing it from "pending" which is at full opacity.
const statusBadgeStyle: Record<ApprovalStatus, React.CSSProperties> = {
  pending: { background: 'var(--ds-color-alpha-black-100)', color: 'var(--ds-color-text-primary)' },
  approved: { background: 'var(--ds-color-success)', color: 'var(--ds-color-text-on-primary)' },
  rejected: { background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)' },
  escalated: { background: 'var(--ds-color-warning)', color: 'var(--ds-color-text-on-primary)' },
  skipped: { background: 'var(--ds-color-alpha-black-100)', color: 'var(--ds-color-text-primary)', opacity: 0.5 },
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  skipped: 'Skipped',
};

// Timeline connector line colors mirror the step's resolved status so the
// visual trail shows at a glance which portions of the chain succeeded/failed.
const statusLineStyle: Record<ApprovalStatus, React.CSSProperties> = {
  pending: { background: 'var(--ds-surface-panel)' },
  approved: { background: 'var(--ds-color-success)' },
  rejected: { background: 'var(--ds-color-error)' },
  escalated: { background: 'var(--ds-color-warning)' },
  skipped: { background: 'var(--ds-surface-panel)' },
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
    <div className="flex gap-3">
      {/* Timeline column: dot + vertical connector line.
          The dot animates (pulse) only when this is the current pending step
          to indicate it requires user action. */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5${isCurrent && step.status === 'pending' ? ' animate-pulse' : ''}`}
          style={{
            background:
              step.status === 'approved' ? 'var(--ds-color-success)' :
              step.status === 'rejected' ? 'var(--ds-color-error)' :
              step.status === 'escalated' ? 'var(--ds-color-warning)' :
              isCurrent ? 'var(--ds-color-primary)' : 'var(--ds-surface-panel)',
          }}
        />
        {/* Hide the connector on the last step to avoid a dangling line */}
        {!isLast && <div className="w-0.5 flex-1 min-h-[2rem]" style={statusLineStyle[step.status]} />}
      </div>

      {/* Content column: identity row, contextual details, and actions */}
      <div className={`pb-6 flex-1 ${isCurrent ? '' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {step.avatar && <span className="flex-shrink-0">{step.avatar}</span>}
          <span className="font-medium text-sm">{step.approver}</span>
          <div style={{ ...pillBadgeSmStyle, ...statusBadgeStyle[step.status] }}>{statusLabel[step.status]}</div>
        </div>

        {step.timestamp && (
          <p className="text-xs mt-1" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
          </p>
        )}

        {step.comments && (
          <div className="mt-2 p-2 rounded-lg text-sm" style={{ background: 'var(--ds-surface-inset)' }}>{step.comments}</div>
        )}

        {/* Arbitrary metadata entries rendered as key-value pairs */}
        {step.metadata && (
          <div className="mt-1 text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {Object.entries(step.metadata).map(([k, v]) => (
              <div key={k}><span className="font-medium">{k}:</span> {v}</div>
            ))}
          </div>
        )}

        {/* Action buttons only appear on the current step when it is still pending.
            Callbacks are optional -- omitting onEscalate hides the Escalate button. */}
        {isCurrent && step.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            {onApprove && (
              <button style={{ background: 'var(--ds-color-success)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} disabled={actionsDisabled} onClick={() => onApprove(step.key)}>
                Approve
              </button>
            )}
            {onReject && (
              <button style={{ background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} disabled={actionsDisabled} onClick={() => onReject(step.key)}>
                Reject
              </button>
            )}
            {onEscalate && (
              <button style={{ background: 'transparent', color: 'var(--ds-color-warning)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-warning)', cursor: 'pointer' }} disabled={actionsDisabled} onClick={() => onEscalate(step.key)}>
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
      <div className={className ?? ''} style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}>
        <div className="animate-pulse" style={cardBodyStyle}>
          <div className="h-5 rounded w-1/3 mb-4" style={{ background: 'var(--ds-surface-panel)' }} />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-3 h-3 rounded-full mt-1" style={{ background: 'var(--ds-surface-panel)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded w-1/4" style={{ background: 'var(--ds-surface-panel)' }} />
                  <div className="h-3 rounded w-1/2" style={{ background: 'var(--ds-surface-panel)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className ?? ''} style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}>
      <div style={cardBodyStyle}>
        {/* Header with workflow title and optional entity identifier badge */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {entity && <div style={{ ...pillBadgeSmStyle, border: '1px solid var(--ds-color-border)', color: 'var(--ds-color-text-secondary)' }}>{entity}</div>}
        </div>

        {/* Timeline: one StepNode per approval step, ordered sequentially */}
        <div>
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
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--ds-color-border)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

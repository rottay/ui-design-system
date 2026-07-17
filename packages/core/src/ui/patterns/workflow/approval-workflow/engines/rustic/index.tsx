'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the ApprovalWorkflow pattern.
 * Framework-agnostic -- no Ant Design or Tailwind dependency. Colour, border and
 * radius resolve from `foundation/tokens/css/runtime/engines/rustic/skin/approval-workflow.css`,
 * keyed on the `data-status` / `data-current` / `data-action` contract this file
 * stamps; hardcoded hex fallbacks inside those token references keep the
 * component legible when design-system tokens are not loaded.
 *
 * @example
 * <RusticApprovalWorkflow
 *   title="Contract Approval"
 *   entity="CTR-0088"
 *   steps={[{ key: 'legal', approver: 'Legal Dept', status: 'pending' }]}
 *   currentStep={0}
 *   onApprove={(key) => approve(key)}
 * />
 */

import React from 'react';
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../../contracts';

const statusLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  skipped: 'Skipped',
};

// Centralized style objects (the `s` namespace) keep the remaining non-paint
// visual constants in one place. Every colour, border and radius this engine
// draws now resolves from `data-status` / `data-action` /
// `data-current` in `foundation/tokens/css/runtime/engines/rustic/skin/approval-workflow.css`.
const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    padding: '1.5rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  } as React.CSSProperties,
  title: {
    fontSize: 'var(--ds-font-size-lg)',
    fontWeight: 600,
    margin: 0,
  } as React.CSSProperties,
  entityTag: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    fontSize: 'var(--ds-font-size-xs)',
  } as React.CSSProperties,
  stepRow: {
    display: 'flex',
    gap: '0.75rem',
  } as React.CSSProperties,
  timeline: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  } as React.CSSProperties,
  dot: (pulse: boolean) => ({
    width: 12,
    height: 12,
    flexShrink: 0,
    marginTop: 5,
    animation: pulse ? 'ds-approval-workflow-rustic-pulse 1.5s ease-in-out infinite' : undefined,
  } as React.CSSProperties),
  line: {
    width: 2,
    flex: 1,
    minHeight: '1.5rem',
  } as React.CSSProperties,
  stepContent: {
    flex: 1,
    paddingBottom: '1.25rem',
  } as React.CSSProperties,
  approverRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  approverName: {
    fontWeight: 500,
    fontSize: 'var(--ds-font-size-sm)',
  } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    padding: '0.0625rem 0.375rem',
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: 500,
  } as React.CSSProperties,
  timestamp: {
    fontSize: 'var(--ds-font-size-xs)',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  comment: {
    marginTop: '0.375rem',
    padding: '0.375rem 0.625rem',
    fontSize: 'var(--ds-font-size-sm)',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  // "approve" and "reject" are filled (high emphasis), while "escalate" uses a
  // transparent background with a colored border to signal it as a secondary
  // action that should not be the default click target.
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.625rem',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  footer: {
    marginTop: '1rem',
    paddingTop: '1rem',
  } as React.CSSProperties,
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    animation: 'ds-approval-workflow-rustic-pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

/**
 * Rustic (Vanilla CSS) engine for the ApprovalWorkflow pattern.
 *
 * Renders the approval chain from DS tokens only. No external CSS framework is
 * required, making this engine ideal for environments where Ant Design or
 * Tailwind are not available.
 *
 * The active-step dot animates on `ds-approval-workflow-rustic-pulse`, defined
 * once in this engine's skin. The name is namespaced because a local
 * `@keyframes` shadows a global of the same name and wins: an unnamespaced
 * `pulse` here would silently retime every other `pulse` consumer on the page.
 *
 * @param props - {@link ApprovalWorkflowProps}
 * @returns A framework-agnostic card with a vertical approval timeline.
 */
export default function RusticApprovalWorkflow(props: ApprovalWorkflowProps) {
  const { title, entity, steps, currentStep = 0, onApprove, onReject, onEscalate, actionsDisabled, footer, loading, className, style } = props;

  // Skeleton state renders 3 placeholder rows matching the timeline structure.
  // Uses the injected pulse keyframe for the shimmer effect.
  if (loading) {
    return (
      <div
        className={['ds-pattern-approval-workflow', 'ds-engine-rustic', className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="true"
        style={{ ...s.container, ...style }}
      >
        <div data-part="skeleton-line" style={s.skeleton('40%', '1.25rem')} />
        <div data-part="skeleton" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} data-part="skeleton-row" style={{ display: 'flex', gap: '0.75rem' }}>
              <div data-part="skeleton-dot" style={s.skeleton('12px', '12px')} />
              <div style={{ flex: 1 }}>
                <div data-part="skeleton-line" style={s.skeleton('30%', '1rem')} />
                <div data-part="skeleton-line" style={{ ...s.skeleton('50%', '0.75rem'), marginTop: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={['ds-pattern-approval-workflow', 'ds-engine-rustic', className].filter(Boolean).join(' ')}
      data-part="root"
      data-loading="false"
      style={{ ...s.container, ...style }}
    >
      <div data-part="header" style={s.header}>
        <h3 data-part="title" style={s.title}>{title}</h3>
        {entity && <span data-part="entity-badge" style={s.entityTag}>{entity}</span>}
      </div>

      <div data-part="timeline">
        {steps.map((step, i) => {
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <div key={step.key} data-part="step" data-status={step.status} data-current={isCurrent} style={s.stepRow}>
              {/* Timeline column: dot uses primary color + pulse when this is
                  the active pending step; otherwise falls back to status color */}
              <div style={s.timeline}>
                <div
                  data-part="step-dot"
                  data-status={step.status}
                  data-current={isCurrent}
                  style={s.dot(isCurrent && step.status === 'pending')}
                />
                {!isLast && <div data-part="step-connector" data-status={step.status} style={s.line} />}
              </div>
              <div data-part="step-content" style={s.stepContent}>
                <div data-part="step-approver-row" style={s.approverRow}>
                  {step.avatar}
                  <span data-part="step-approver" style={s.approverName}>{step.approver}</span>
                  <span data-part="step-status-badge" data-status={step.status} style={s.badge}>{statusLabel[step.status]}</span>
                </div>
                {step.timestamp && (
                  <div data-part="step-timestamp" style={s.timestamp}>
                    {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
                  </div>
                )}
                {step.comments && <div data-part="step-comment" style={s.comment}>{step.comments}</div>}
                {/* Metadata key-value pairs for domain-specific context */}
                {step.metadata && (
                  <div data-part="step-metadata" style={{ marginTop: '0.25rem', fontSize: 'var(--ds-font-size-xs)' }}>
                    {Object.entries(step.metadata).map(([k, v]) => (
                      <div key={k}><span style={{ fontWeight: 500 }}>{k}:</span> {v}</div>
                    ))}
                  </div>
                )}
                {/* Disabled buttons use reduced opacity because native :disabled
                    styling is not reliably consistent across browsers without CSS */}
                {isCurrent && step.status === 'pending' && (
                  <div data-part="step-actions" style={s.actions}>
                    {onApprove && (
                      <button data-part="step-action-button" data-action="approve" style={{ ...s.btn, opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onApprove(step.key)}>
                        Approve
                      </button>
                    )}
                    {onReject && (
                      <button data-part="step-action-button" data-action="reject" style={{ ...s.btn, opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onReject(step.key)}>
                        Reject
                      </button>
                    )}
                    {onEscalate && (
                      <button data-part="step-action-button" data-action="escalate" style={{ ...s.btn, opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onEscalate(step.key)}>
                        Escalate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {footer && <div data-part="footer" style={s.footer}>{footer}</div>}
    </div>
  );
}

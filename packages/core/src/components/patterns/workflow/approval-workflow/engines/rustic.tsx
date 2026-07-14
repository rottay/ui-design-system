'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the ApprovalWorkflow pattern.
 * Uses only inline styles backed by `--ds-*` CSS custom properties, making it
 * framework-agnostic -- no Ant Design or Tailwind dependency. Hardcoded hex
 * fallbacks ensure the component renders acceptably even when design-system
 * tokens are not loaded (e.g. in isolated tests or Storybook).
 *
 * Injects a minimal `@keyframes pulse` via an inline `<style>` tag for the
 * active-step dot animation, avoiding an external stylesheet requirement.
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
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../ApprovalWorkflow.types';

// Per-status color triplets for badge backgrounds, text, and timeline dots.
// Each value uses a CSS variable with a hardcoded hex fallback so the component
// degrades gracefully when tokens are missing.
const statusColors: Record<ApprovalStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'var(--ds-color-neutral-100)', text: 'var(--ds-color-neutral-600)', dot: 'var(--ds-color-neutral-400)' },
  approved: { bg: 'var(--ds-color-success-50, #ecfdf5)', text: 'var(--ds-color-success-700, #15803d)', dot: 'var(--ds-color-success-500, #22c55e)' },
  rejected: { bg: 'var(--ds-color-error-50, #fef2f2)', text: 'var(--ds-color-error-700, #b91c1c)', dot: 'var(--ds-color-error-500, #ef4444)' },
  escalated: { bg: 'var(--ds-color-warning-50, #fffbeb)', text: 'var(--ds-color-warning-700, #a16207)', dot: 'var(--ds-color-warning-500, #f59e0b)' },
  skipped: { bg: 'var(--ds-color-neutral-100)', text: 'var(--ds-color-neutral-500)', dot: 'var(--ds-color-neutral-300)' },
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  skipped: 'Skipped',
};

// Centralized style objects (the `s` namespace) keep all visual constants in
// one place. Using factory functions (e.g. `dot()`, `btn()`) for styles that
// vary by state avoids scattering ternary logic inside JSX.
const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
    background: 'var(--ds-color-neutral-0, #fff)',
    border: '1px solid var(--ds-color-neutral-200)',
    borderRadius: 'var(--ds-radius-lg)',
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
    borderRadius: 'var(--ds-radius-full, 9999px)',
    fontSize: 'var(--ds-font-size-xs)',
    background: 'var(--ds-color-neutral-100)',
    color: 'var(--ds-color-neutral-600)',
    border: '1px solid var(--ds-color-neutral-200)',
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
  dot: (color: string, pulse: boolean) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
    marginTop: 5,
    animation: pulse ? 'pulse 1.5s ease-in-out infinite' : undefined,
  } as React.CSSProperties),
  line: (color: string) => ({
    width: 2,
    flex: 1,
    minHeight: '1.5rem',
    background: color,
  } as React.CSSProperties),
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
  badge: (status: ApprovalStatus) => ({
    display: 'inline-block',
    padding: '0.0625rem 0.375rem',
    borderRadius: 'var(--ds-radius-full, 9999px)',
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: 500,
    background: statusColors[status].bg,
    color: statusColors[status].text,
  } as React.CSSProperties),
  timestamp: {
    fontSize: 'var(--ds-font-size-xs)',
    color: 'var(--ds-color-neutral-500)',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  comment: {
    marginTop: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'var(--ds-color-neutral-50)',
    borderRadius: 'var(--ds-radius-md)',
    fontSize: 'var(--ds-font-size-sm)',
    border: '1px solid var(--ds-color-neutral-200)',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  // Button factory: "approve" and "reject" are filled (high emphasis), while
  // "escalate" uses a transparent background with a colored border to signal
  // it as a secondary action that should not be the default click target.
  btn: (variant: 'approve' | 'reject' | 'escalate') => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.625rem',
      borderRadius: 'var(--ds-radius-md)',
      fontSize: 'var(--ds-font-size-sm)',
      fontWeight: 500,
      cursor: 'pointer',
      border: '1px solid',
    };
    if (variant === 'approve') {
      base.background = 'var(--ds-color-success-600, #16a34a)';
      base.color = 'var(--ds-color-text-on-primary)';
      base.borderColor = 'var(--ds-color-success-600, #16a34a)';
    } else if (variant === 'reject') {
      base.background = 'var(--ds-color-error-600, #dc2626)';
      base.color = 'var(--ds-color-text-on-primary)';
      base.borderColor = 'var(--ds-color-error-600, #dc2626)';
    } else {
      base.background = 'transparent';
      base.color = 'var(--ds-color-warning-700, #a16207)';
      base.borderColor = 'var(--ds-color-warning-400, #fbbf24)';
    }
    return base;
  },
  footer: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--ds-color-neutral-200)',
  } as React.CSSProperties,
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-200)',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

/**
 * Rustic (Vanilla CSS) engine for the ApprovalWorkflow pattern.
 *
 * Renders the approval chain using only inline styles backed by `--ds-*`
 * CSS custom properties. No external CSS framework is required, making this
 * engine ideal for environments where Ant Design or Tailwind are not available.
 *
 * The `<style>` tag injected at the top of the render tree defines the
 * `@keyframes pulse` animation used by the active-step dot. It is safe to
 * render multiple instances -- the browser de-duplicates identical keyframe
 * declarations.
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
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
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
      {/* Inline keyframe needed for the pulsing dot on the active step */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div data-part="header" style={s.header}>
        <h3 data-part="title" style={s.title}>{title}</h3>
        {entity && <span data-part="entity-badge" style={s.entityTag}>{entity}</span>}
      </div>

      <div data-part="timeline">
        {steps.map((step, i) => {
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;
          const colors = statusColors[step.status];

          return (
            <div key={step.key} data-part="step" data-status={step.status} data-current={isCurrent} style={s.stepRow}>
              {/* Timeline column: dot uses primary color + pulse when this is
                  the active pending step; otherwise falls back to status color */}
              <div style={s.timeline}>
                <div
                  data-part="step-dot"
                  data-status={step.status}
                  data-current={isCurrent}
                  style={s.dot(isCurrent && step.status === 'pending' ? 'var(--ds-color-primary-500)' : colors.dot, isCurrent && step.status === 'pending')}
                />
                {!isLast && <div data-part="step-connector" data-status={step.status} style={s.line(colors.dot)} />}
              </div>
              <div data-part="step-content" style={s.stepContent}>
                <div data-part="step-approver-row" style={s.approverRow}>
                  {step.avatar}
                  <span data-part="step-approver" style={s.approverName}>{step.approver}</span>
                  <span data-part="step-status-badge" data-status={step.status} style={s.badge(step.status)}>{statusLabel[step.status]}</span>
                </div>
                {step.timestamp && (
                  <div data-part="step-timestamp" style={s.timestamp}>
                    {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
                  </div>
                )}
                {step.comments && <div data-part="step-comment" style={s.comment}>{step.comments}</div>}
                {/* Metadata key-value pairs for domain-specific context */}
                {step.metadata && (
                  <div data-part="step-metadata" style={{ marginTop: '0.25rem', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-500)' }}>
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
                      <button data-part="step-action-button" data-action="approve" style={{ ...s.btn('approve'), opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onApprove(step.key)}>
                        Approve
                      </button>
                    )}
                    {onReject && (
                      <button data-part="step-action-button" data-action="reject" style={{ ...s.btn('reject'), opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onReject(step.key)}>
                        Reject
                      </button>
                    )}
                    {onEscalate && (
                      <button data-part="step-action-button" data-action="escalate" style={{ ...s.btn('escalate'), opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onEscalate(step.key)}>
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

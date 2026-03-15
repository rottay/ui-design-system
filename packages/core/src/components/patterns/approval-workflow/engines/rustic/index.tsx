'use client';

/**
 * ApprovalWorkflow - Rustic Engine (Vanilla HTML/CSS with --ds-* vars)
 */

import React from 'react';
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../../types';

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

export default function RusticApprovalWorkflow(props: ApprovalWorkflowProps) {
  const { title, entity, steps, currentStep = 0, onApprove, onReject, onEscalate, actionsDisabled, footer, loading, className, style } = props;

  if (loading) {
    return (
      <div className={className} style={{ ...s.container, ...style }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        <div style={s.skeleton('40%', '1.25rem')} />
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={s.skeleton('12px', '12px')} />
              <div style={{ flex: 1 }}>
                <div style={s.skeleton('30%', '1rem')} />
                <div style={{ ...s.skeleton('50%', '0.75rem'), marginTop: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...s.container, ...style }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={s.header}>
        <h3 style={s.title}>{title}</h3>
        {entity && <span style={s.entityTag}>{entity}</span>}
      </div>

      <div>
        {steps.map((step, i) => {
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;
          const colors = statusColors[step.status];

          return (
            <div key={step.key} style={s.stepRow}>
              <div style={s.timeline}>
                <div style={s.dot(isCurrent && step.status === 'pending' ? 'var(--ds-color-primary-500)' : colors.dot, isCurrent && step.status === 'pending')} />
                {!isLast && <div style={s.line(colors.dot)} />}
              </div>
              <div style={s.stepContent}>
                <div style={s.approverRow}>
                  {step.avatar}
                  <span style={s.approverName}>{step.approver}</span>
                  <span style={s.badge(step.status)}>{statusLabel[step.status]}</span>
                </div>
                {step.timestamp && (
                  <div style={s.timestamp}>
                    {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
                  </div>
                )}
                {step.comments && <div style={s.comment}>{step.comments}</div>}
                {step.metadata && (
                  <div style={{ marginTop: '0.25rem', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-500)' }}>
                    {Object.entries(step.metadata).map(([k, v]) => (
                      <div key={k}><span style={{ fontWeight: 500 }}>{k}:</span> {v}</div>
                    ))}
                  </div>
                )}
                {isCurrent && step.status === 'pending' && (
                  <div style={s.actions}>
                    {onApprove && (
                      <button style={{ ...s.btn('approve'), opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onApprove(step.key)}>
                        Approve
                      </button>
                    )}
                    {onReject && (
                      <button style={{ ...s.btn('reject'), opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onReject(step.key)}>
                        Reject
                      </button>
                    )}
                    {onEscalate && (
                      <button style={{ ...s.btn('escalate'), opacity: actionsDisabled ? 0.5 : 1 }} disabled={actionsDisabled} onClick={() => onEscalate(step.key)}>
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

      {footer && <div style={s.footer}>{footer}</div>}
    </div>
  );
}

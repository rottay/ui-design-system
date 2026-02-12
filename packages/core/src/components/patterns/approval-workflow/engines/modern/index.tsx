'use client';

/**
 * ApprovalWorkflow - Modern Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../../types';

const statusBadge: Record<ApprovalStatus, string> = {
  pending: 'badge-ghost',
  approved: 'badge-success',
  rejected: 'badge-error',
  escalated: 'badge-warning',
  skipped: 'badge-ghost opacity-50',
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  skipped: 'Skipped',
};

const statusLineColor: Record<ApprovalStatus, string> = {
  pending: 'bg-base-300',
  approved: 'bg-success',
  rejected: 'bg-error',
  escalated: 'bg-warning',
  skipped: 'bg-base-300',
};

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
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
          step.status === 'approved' ? 'bg-success' :
          step.status === 'rejected' ? 'bg-error' :
          step.status === 'escalated' ? 'bg-warning' :
          isCurrent ? 'bg-primary animate-pulse' : 'bg-base-300'
        }`} />
        {!isLast && <div className={`w-0.5 flex-1 min-h-[2rem] ${statusLineColor[step.status]}`} />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isCurrent ? '' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {step.avatar && <span className="flex-shrink-0">{step.avatar}</span>}
          <span className="font-medium text-sm">{step.approver}</span>
          <div className={`badge badge-sm ${statusBadge[step.status]}`}>{statusLabel[step.status]}</div>
        </div>

        {step.timestamp && (
          <p className="text-xs text-base-content/50 mt-1">
            {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
          </p>
        )}

        {step.comments && (
          <div className="mt-2 p-2 bg-base-200/50 rounded-lg text-sm">{step.comments}</div>
        )}

        {step.metadata && (
          <div className="mt-1 text-xs text-base-content/60">
            {Object.entries(step.metadata).map(([k, v]) => (
              <div key={k}><span className="font-medium">{k}:</span> {v}</div>
            ))}
          </div>
        )}

        {isCurrent && step.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            {onApprove && (
              <button className="btn btn-success btn-sm" disabled={actionsDisabled} onClick={() => onApprove(step.key)}>
                Approve
              </button>
            )}
            {onReject && (
              <button className="btn btn-error btn-sm" disabled={actionsDisabled} onClick={() => onReject(step.key)}>
                Reject
              </button>
            )}
            {onEscalate && (
              <button className="btn btn-warning btn-sm btn-outline" disabled={actionsDisabled} onClick={() => onEscalate(step.key)}>
                Escalate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModernApprovalWorkflow(props: ApprovalWorkflowProps) {
  const { title, entity, steps, currentStep = 0, onApprove, onReject, onEscalate, actionsDisabled, footer, loading, className, style } = props;

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
        <div className="card-body animate-pulse">
          <div className="h-5 bg-base-300 rounded w-1/3 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-base-300 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300 rounded w-1/4" />
                  <div className="h-3 bg-base-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {entity && <div className="badge badge-outline badge-sm">{entity}</div>}
        </div>

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
          <div className="mt-4 pt-4 border-t border-base-300">{footer}</div>
        )}
      </div>
    </div>
  );
}

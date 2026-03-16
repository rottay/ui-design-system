'use client';

/**
 * @fileoverview Classic engine for the ApprovalWorkflow pattern, powered by Ant Design.
 * Renders a vertical Steps component where each step represents one approver in a
 * sequential approval chain. Action buttons (Approve / Reject / Escalate) appear only
 * on the current pending step, enforcing a single-active-step progression model.
 *
 * @example
 * <ClassicApprovalWorkflow
 *   title="Purchase Order Approval"
 *   entity="PO-2026-0042"
 *   steps={[{ key: 'mgr', approver: 'Jane Doe', status: 'approved' }]}
 *   currentStep={1}
 *   onApprove={(key) => handleApprove(key)}
 * />
 */

import React from 'react';
import { Card, Steps, Button, Tag, Space, Skeleton, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../ApprovalWorkflow.types';

const { Text, Title } = Typography;

// Map domain-level approval statuses to Ant Steps visual states. "escalated"
// maps to "process" because it is an active state requiring attention, while
// "skipped" maps to "wait" since it is inactive but not failed.
// Ant Steps only supports four visual states (wait/process/finish/error), so
// the five-value ApprovalStatus union must be collapsed into those four.
const statusMap: Record<ApprovalStatus, { color: string; label: string; antStatus: 'wait' | 'process' | 'finish' | 'error' }> = {
  pending: { color: 'default', label: 'Pending', antStatus: 'wait' },
  approved: { color: 'success', label: 'Approved', antStatus: 'finish' },
  rejected: { color: 'error', label: 'Rejected', antStatus: 'error' },
  escalated: { color: 'warning', label: 'Escalated', antStatus: 'process' },
  skipped: { color: 'default', label: 'Skipped', antStatus: 'wait' },
};

/**
 * Renders the description area below each step in the Ant Steps component.
 * Shows timestamp, reviewer comments, arbitrary metadata key-value pairs, and
 * -- only for the currently active pending step -- action buttons.
 *
 * Action buttons are conditionally rendered based on which callbacks the parent
 * provides. This lets consumers selectively disable escalation (for example) by
 * simply omitting the `onEscalate` prop.
 */
function StepDescription({ step, isCurrent, onApprove, onReject, onEscalate, actionsDisabled }: {
  step: ApprovalStep;
  isCurrent: boolean;
  onApprove?: (key: string) => void;
  onReject?: (key: string) => void;
  onEscalate?: (key: string) => void;
  actionsDisabled?: boolean;
}) {
  return (
    <div style={{ paddingTop: 4 }}>
      {/* Timestamp supports both pre-formatted strings and Date objects.
          Date objects are locale-formatted so the display adapts to the user's browser. */}
      {step.timestamp && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {typeof step.timestamp === 'string' ? step.timestamp : step.timestamp.toLocaleString()}
        </Text>
      )}
      {step.comments && (
        <div style={{ marginTop: 4, padding: '6px 10px', background: 'rgba(0,0,0,0.02)', borderRadius: 4, fontSize: 13 }}>
          {step.comments}
        </div>
      )}
      {/* Metadata is an open-ended Record<string, ReactNode> that consumers use
          for domain-specific data like department, cost center, or risk score. */}
      {step.metadata && (
        <div style={{ marginTop: 4 }}>
          {Object.entries(step.metadata).map(([k, v]) => (
            <div key={k} style={{ fontSize: 12 }}>
              <Text type="secondary">{k}:</Text> {v}
            </div>
          ))}
        </div>
      )}
      {/* Actions only render when this step is both active AND pending. A step
          that is current but already approved/rejected should not show buttons. */}
      {isCurrent && step.status === 'pending' && (
        <Space style={{ marginTop: 8 }}>
          {onApprove && (
            <Button size="small" type="primary" icon={<CheckOutlined />} disabled={actionsDisabled} onClick={() => onApprove(step.key)}>
              Approve
            </Button>
          )}
          {onReject && (
            <Button size="small" danger icon={<CloseOutlined />} disabled={actionsDisabled} onClick={() => onReject(step.key)}>
              Reject
            </Button>
          )}
          {onEscalate && (
            <Button size="small" icon={<ExclamationCircleOutlined />} disabled={actionsDisabled} onClick={() => onEscalate(step.key)}>
              Escalate
            </Button>
          )}
        </Space>
      )}
    </div>
  );
}

/**
 * Classic (Ant Design) engine for the ApprovalWorkflow pattern.
 *
 * Wraps the entire workflow in an Ant Card with a vertical Steps component.
 * Each step's `status` is mapped through `statusMap` so domain states translate
 * into Ant's four-value visual model. The `currentStep` index determines which
 * step renders action buttons via the `StepDescription` sub-component.
 *
 * @param props - {@link ApprovalWorkflowProps}
 * @returns A card containing a vertical approval chain with inline actions.
 */
export default function ClassicApprovalWorkflow(props: ApprovalWorkflowProps) {
  const { title, entity, steps, currentStep = 0, onApprove, onReject, onEscalate, actionsDisabled, footer, loading, className, style } = props;

  // Loading state uses Ant Skeleton with 6 rows to approximate the visual
  // height of a typical 3-step workflow, preventing layout shift on load.
  if (loading) {
    return (
      <Card className={className} style={style}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card className={className} style={style}>
      {/* Header: workflow title + optional entity tag (e.g. "PO-2026-0042") */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
        {entity && <Tag>{entity}</Tag>}
      </div>

      {/* Vertical Steps -- each item maps an ApprovalStep into Ant's Step shape.
          The `status` override per-item lets completed/rejected steps show the
          correct icon/color regardless of the global `current` index. */}
      <Steps
        direction="vertical"
        current={currentStep}
        items={steps.map((step, i) => ({
          title: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {step.avatar}
              <span>{step.approver}</span>
              <Tag color={statusMap[step.status].color}>{statusMap[step.status].label}</Tag>
            </span>
          ),
          status: statusMap[step.status].antStatus,
          description: (
            <StepDescription
              step={step}
              isCurrent={i === currentStep}
              onApprove={onApprove}
              onReject={onReject}
              onEscalate={onEscalate}
              actionsDisabled={actionsDisabled}
            />
          ),
        }))}
      />

      {footer && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--ds-color-border-subtle)', paddingTop: 16 }}>
          {footer}
        </div>
      )}
    </Card>
  );
}

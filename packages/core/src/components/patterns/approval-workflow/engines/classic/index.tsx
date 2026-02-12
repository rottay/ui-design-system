'use client';

/**
 * ApprovalWorkflow - Classic Engine (Ant Design)
 */

import React from 'react';
import { Card, Steps, Button, Tag, Space, Skeleton, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from '../../types';

const { Text, Title } = Typography;

const statusMap: Record<ApprovalStatus, { color: string; label: string; antStatus: 'wait' | 'process' | 'finish' | 'error' }> = {
  pending: { color: 'default', label: 'Pending', antStatus: 'wait' },
  approved: { color: 'success', label: 'Approved', antStatus: 'finish' },
  rejected: { color: 'error', label: 'Rejected', antStatus: 'error' },
  escalated: { color: 'warning', label: 'Escalated', antStatus: 'process' },
  skipped: { color: 'default', label: 'Skipped', antStatus: 'wait' },
};

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
      {step.metadata && (
        <div style={{ marginTop: 4 }}>
          {Object.entries(step.metadata).map(([k, v]) => (
            <div key={k} style={{ fontSize: 12 }}>
              <Text type="secondary">{k}:</Text> {v}
            </div>
          ))}
        </div>
      )}
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

export default function ClassicApprovalWorkflow(props: ApprovalWorkflowProps) {
  const { title, entity, steps, currentStep = 0, onApprove, onReject, onEscalate, actionsDisabled, footer, loading, className, style } = props;

  if (loading) {
    return (
      <Card className={className} style={style}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card className={className} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
        {entity && <Tag>{entity}</Tag>}
      </div>

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
        <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          {footer}
        </div>
      )}
    </Card>
  );
}

import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { DecisionInboxSurface } from '../index';
import { useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import type { CollectionWorkspaceConfig } from '../../../../../foundation/contracts/adaptive/collection';

describe('DecisionInboxSurface', () => {
  const decisions = [
    { key: 'approve', label: 'Approve', variant: 'primary' as const },
    { key: 'reject', label: 'Reject', variant: 'danger' as const },
  ];

  it('renders queue name and data', async () => {
    renderSurface(
      <DecisionInboxSurface
        queueName="Approval Queue"
        workspace={{ data: [{ id: '1', name: 'Request A' }] }}
        columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]}
        rowKey="id"
        decisions={decisions}
        onDecision={vi.fn()}
      />,
    );
    expect(await screen.findByText('Approval Queue')).toBeInTheDocument();
    expect(await screen.findByText('Request A')).toBeInTheDocument();
  });

  it('shows batch bar when multiple items selected and batchDecisions is true', async () => {
    const onBatchDecision = vi.fn();
    renderSurface(
      <DecisionInboxSurface
        queueName="Queue"
        workspace={{
          data: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }],
          behavior: { selection: { enabled: true, selectedKeys: ['1', '2'] } },
        }}
        columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]}
        rowKey="id"
        decisions={decisions}
        onDecision={vi.fn()}
        onBatchDecision={onBatchDecision}
        batchDecisions
      />,
    );
    expect(await screen.findByText(/2 items selected/i)).toBeInTheDocument();
  });

  it('renders decision buttons in review rail when item is selected and reviewRail is provided', async () => {
    const onDecision = vi.fn();
    renderSurface(
      <DecisionInboxSurface
        queueName="Queue"
        workspace={{ data: [{ id: '1', name: 'A' }] }}
        columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]}
        rowKey="id"
        decisions={decisions}
        onDecision={onDecision}
        reviewRail={{ render: (item: any) => <div>Reviewing {item.name}</div> }}
      />,
    );
    // Click a row to select it and open the review rail
    const row = await screen.findByText('A');
    fireEvent.click(row);
    // Review rail and decision buttons should appear
    expect(await screen.findByText('Reviewing A')).toBeInTheDocument();
    expect(await screen.findByText('Approve')).toBeInTheDocument();
    expect(await screen.findByText('Reject')).toBeInTheDocument();
  });
});

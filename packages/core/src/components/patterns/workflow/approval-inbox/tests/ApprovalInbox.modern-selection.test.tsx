import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ApprovalGroup } from '../contracts';
import ModernApprovalInbox from '../engines/modern';

const SUBMITTED_AT = '2026-03-17T09:00:00.000Z';

function groups(ids: string[]): ApprovalGroup[] {
  return [
    {
      domain: 'Finance',
      items: ids.map((id) => ({
        id,
        title: `Invoice ${id.toUpperCase()}`,
        submittedAt: SUBMITTED_AT,
      })),
    },
  ];
}

describe('Modern ApprovalInbox — selection against live data', () => {
  it('drops a selected row from the count once the consumer removes it', () => {
    const { container, rerender } = render(
      <ModernApprovalInbox groups={groups(['a', 'b'])} onBatchApprove={vi.fn()} />,
    );
    // Scoped to the VISIBLE count: the always-mounted polite announcer carries
    // the same string, so an unscoped text query now matches both.
    const visibleCount = () => container.querySelector('[data-part="batch-count"]');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Invoice A' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Invoice B' }));
    expect(visibleCount()).toHaveTextContent('2 selected');

    // The approved row leaves the data; the toolbar must stop counting it.
    rerender(<ModernApprovalInbox groups={groups(['b'])} onBatchApprove={vi.fn()} />);

    expect(visibleCount()).toHaveTextContent('1 selected');
  });

  it('never batch-submits an id that left the data', () => {
    const onBatchApprove = vi.fn();
    const { rerender } = render(
      <ModernApprovalInbox groups={groups(['a', 'b'])} onBatchApprove={onBatchApprove} />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Invoice A' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Invoice B' }));

    rerender(<ModernApprovalInbox groups={groups(['b'])} onBatchApprove={onBatchApprove} />);
    fireEvent.click(screen.getByRole('button', { name: /Batch approve/i }));

    expect(onBatchApprove).toHaveBeenCalledWith(['b']);
  });

  it('hides the batch toolbar when every selected row has left the data', () => {
    const { rerender } = render(
      <ModernApprovalInbox groups={groups(['a', 'b'])} onBatchApprove={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Invoice A' }));
    rerender(<ModernApprovalInbox groups={groups(['b'])} onBatchApprove={vi.fn()} />);

    expect(screen.queryByRole('region', { name: 'Batch actions' })).toBeNull();
  });
});

describe('Modern ApprovalInbox — loading lifecycle', () => {
  it('announces the skeleton branch as busy', () => {
    const { container } = render(<ModernApprovalInbox groups={[]} loading />);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('aria-busy', 'true');
  });
});

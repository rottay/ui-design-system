import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { ApprovalGroup } from '../contracts';
import ModernApprovalInbox from '../engines/modern';

function buildGroups(ids: string[]): ApprovalGroup[] {
  return [
    {
      domain: 'Finance',
      items: ids.map((id) => ({
        id,
        title: `Invoice ${id}`,
        submittedAt: new Date().toISOString(),
      })),
    },
  ];
}

/** Consumer that removes every batched row, exactly as a real inbox does. */
function Harness({ initial }: { initial: string[] }) {
  const [ids, setIds] = useState(initial);
  return (
    <ModernApprovalInbox
      groups={buildGroups(ids)}
      onApprove={(id) => setIds((prev) => prev.filter((entry) => entry !== id))}
      onBatchApprove={(batched) =>
        setIds((prev) => prev.filter((entry) => !batched.includes(entry)))
      }
    />
  );
}

describe('Modern ApprovalInbox — focus policy on batch actions', () => {
  it('hands focus to a surviving row after the batch toolbar unmounts', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['a', 'b', 'c']} />);

    await user.click(screen.getByRole('checkbox', { name: 'Select Invoice a' }));
    await user.click(screen.getByRole('button', { name: 'Batch approve' }));

    // Before: clearing the selection ALWAYS unmounted the toolbar, so the
    // button the user had just pressed vanished and focus fell to <body> —
    // the per-row policy repaired this drop but the batch path never did.
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Approve Invoice b' }),
      );
    });
    expect(document.activeElement).not.toBe(document.body);
  });

  it('falls back to the inbox root when the batch empties the queue', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initial={['a']} />);

    await user.click(screen.getByRole('checkbox', { name: 'Select Invoice a' }));
    await user.click(screen.getByRole('button', { name: 'Batch approve' }));

    await waitFor(() => {
      expect(document.activeElement).toBe(container.querySelector('[data-part="root"]'));
    });
  });
});

describe('Modern ApprovalInbox — queue rank', () => {
  it('exposes each approval position to assistive technology', () => {
    const { container } = render(
      <ModernApprovalInbox groups={buildGroups(['a', 'b', 'c'])} />,
    );

    // Before: the items were bare divs — AT could say nothing about which of
    // how many approvals the user had landed on.
    const items = Array.from(container.querySelectorAll('[data-part="item"]'));
    expect(items.map((node) => node.getAttribute('role'))).toEqual([
      'listitem',
      'listitem',
      'listitem',
    ]);
    expect(items.map((node) => node.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
    expect(items.map((node) => node.getAttribute('aria-setsize'))).toEqual(['3', '3', '3']);
    expect(container.querySelector('[data-part="group-items"]')?.getAttribute('role')).toBe(
      'list',
    );
  });
});

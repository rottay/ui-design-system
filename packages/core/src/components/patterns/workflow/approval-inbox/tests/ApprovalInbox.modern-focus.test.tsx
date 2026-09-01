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

/** Consumer that removes the acted row, exactly as a real inbox does. */
function Harness({ initial }: { initial: string[] }) {
  const [ids, setIds] = useState(initial);
  return (
    <ModernApprovalInbox
      groups={buildGroups(ids)}
      onApprove={(id) => setIds((prev) => prev.filter((entry) => entry !== id))}
      onBatchApprove={() => undefined}
    />
  );
}

describe('Modern ApprovalInbox — focus policy on row removal', () => {
  it('hands focus to the next surviving row when the acted row unmounts', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['a', 'b', 'c']} />);

    await user.click(screen.getByRole('button', { name: 'Approve Invoice a' }));

    // Before: the row unmounted and focus fell to <body>, restarting a
    // keyboard user at the top of the document.
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Approve Invoice b' }),
      );
    });
  });

  it('falls back to the previous survivor when the last row is acted on', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['a', 'b']} />);

    await user.click(screen.getByRole('button', { name: 'Approve Invoice b' }));

    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Approve Invoice a' }),
      );
    });
  });

  it('hands focus to the list root when the inbox empties', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initial={['a']} />);

    await user.click(screen.getByRole('button', { name: 'Approve Invoice a' }));

    await waitFor(() => {
      const root = container.querySelector('[data-part="root"]');
      expect(root).toHaveAttribute('tabindex', '-1');
      expect(document.activeElement).toBe(root);
    });
  });
});

describe('Modern ApprovalInbox — selection announcer', () => {
  it('mounts the polite region empty so the first selection is announced', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ModernApprovalInbox
        groups={buildGroups(['a', 'b'])}
        onBatchApprove={() => undefined}
      />,
    );

    // Before: the only aria-live node was the batch count, which MOUNTED with
    // "1 selected" already in it — a live region that arrives with its content
    // does not announce it.
    const announcer = container.querySelector('[data-part="selection-announcer"]');
    expect(announcer).not.toBeNull();
    expect(announcer).toHaveAttribute('aria-live', 'polite');
    expect(announcer?.textContent).toBe('');

    await user.click(screen.getByRole('checkbox', { name: 'Select Invoice a' }));

    await waitFor(() => {
      expect(
        container.querySelector('[data-part="selection-announcer"]')?.textContent,
      ).toBe('1 selected');
    });

    // The visible count must not double-announce the same change.
    expect(
      container.querySelector('[data-part="batch-count"]'),
    ).not.toHaveAttribute('aria-live');
  });
});

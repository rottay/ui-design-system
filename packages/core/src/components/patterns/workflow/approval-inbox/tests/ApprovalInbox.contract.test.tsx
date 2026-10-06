/**
 * @fileoverview ApprovalInbox cross-engine contract tests.
 * Pins the public contract through the `PatternApprovalInbox` facade: domain
 * groups and item titles, single approve/reject, batch approve over the
 * selection, the empty message, and the declared Rustic absence.
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { PatternApprovalInbox } from '..';
import * as packageRoot from '@/index';
import type { ApprovalGroup, ApprovalInboxProps } from '@/index';
import { STABLE_ENGINES, renderWithEngine } from '@tests/support/engine';

/** Rustic ships no inbox; the contract is measured over the engines that do. */
const IMPLEMENTING_ENGINES = STABLE_ENGINES.filter((engine) => engine !== 'rustic');

const GROUPS: ApprovalGroup[] = [
  {
    domain: 'Finance',
    items: [
      { id: 'inv-1', title: 'Invoice 4521', amount: 12500, risk: 'low', submittedAt: '2026-03-17T09:00:00Z' },
      { id: 'inv-2', title: 'Invoice 4522', submittedAt: '2026-03-17T10:00:00Z' },
    ],
  },
  {
    domain: 'Compliance',
    items: [{ id: 'cmp-1', title: 'Policy exception', risk: 'high', submittedAt: '2026-03-17T11:00:00Z' }],
  },
];

function baseProps(overrides: Partial<ApprovalInboxProps> = {}): ApprovalInboxProps {
  return {
    groups: GROUPS,
    onApprove: vi.fn(),
    onReject: vi.fn(),
    onBatchApprove: vi.fn(),
    ...overrides,
  };
}

/** The facade mounts the root before its engine-aware primitives resolve, so
 *  readiness is the root plus a content text inside it. */
async function findInboxRoot(ready: string = 'Policy exception'): Promise<HTMLElement> {
  await waitFor(() => {
    const root = document.querySelector('.ds-pattern-approval-inbox') as HTMLElement | null;
    expect(root).not.toBeNull();
    expect(within(root as HTMLElement).getByText(ready)).toBeInTheDocument();
  });
  return document.querySelector('.ds-pattern-approval-inbox') as HTMLElement;
}

/** Item order follows `GROUPS`: inv-1, inv-2, cmp-1. */
function itemButtons(name: 'Approve' | 'Reject'): HTMLElement[] {
  return screen.getAllByRole('button', { name: new RegExp(`^${name}\\b`) });
}

describe('PatternApprovalInbox contract', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is exported from the package root as the same component', () => {
    expect(packageRoot.PatternApprovalInbox).toBe(PatternApprovalInbox);
  });

  it.each(IMPLEMENTING_ENGINES)(
    'renders every domain header and item title through the %s engine',
    async (engine) => {
      renderWithEngine(<PatternApprovalInbox engine={engine} {...baseProps()} />, engine);

      const root = await findInboxRoot();
      expect(root.className).toContain(`ds-engine-${engine}`);
      for (const group of GROUPS) {
        expect(within(root).getByText(group.domain)).toBeInTheDocument();
        for (const item of group.items) {
          expect(within(root).getByText(item.title)).toBeInTheDocument();
        }
      }
    },
    45000,
  );

  it.each(IMPLEMENTING_ENGINES)(
    'calls onApprove and onReject with the item id through the %s engine',
    async (engine) => {
      const props = baseProps();
      renderWithEngine(<PatternApprovalInbox engine={engine} {...props} />, engine);
      await findInboxRoot();
      await waitFor(() => {
        expect(itemButtons('Approve')).toHaveLength(3);
        expect(itemButtons('Reject')).toHaveLength(3);
      });

      fireEvent.click(itemButtons('Approve')[1]);
      expect(props.onApprove).toHaveBeenCalledTimes(1);
      expect(props.onApprove).toHaveBeenCalledWith('inv-2');

      fireEvent.click(itemButtons('Reject')[2]);
      expect(props.onReject).toHaveBeenCalledTimes(1);
      expect(props.onReject).toHaveBeenCalledWith('cmp-1');
    },
    45000,
  );

  it.each(IMPLEMENTING_ENGINES)(
    'batch-approves exactly the selected ids through the %s engine',
    async (engine) => {
      const props = baseProps();
      renderWithEngine(<PatternApprovalInbox engine={engine} {...props} />, engine);
      await findInboxRoot();
      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(3);
      });
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[2]);

      const batch = await screen.findByRole('button', { name: /^batch approve$/i });
      fireEvent.click(batch);

      await waitFor(() => {
        expect(props.onBatchApprove).toHaveBeenCalledTimes(1);
      });
      const [ids] = vi.mocked(props.onBatchApprove!).mock.calls[0];
      expect([...ids].sort()).toEqual(['cmp-1', 'inv-1']);
      expect(props.onApprove).not.toHaveBeenCalled();
    },
    45000,
  );

  it.each(IMPLEMENTING_ENGINES)(
    'renders the empty message when no group holds an item through the %s engine',
    async (engine) => {
      renderWithEngine(
        <PatternApprovalInbox engine={engine} {...baseProps({ groups: [], emptyMessage: 'Queue is clear' })} />,
        engine,
      );

      const root = await findInboxRoot('Queue is clear');
      expect(within(root).queryAllByRole('button')).toHaveLength(0);
    },
    45000,
  );

  it('refuses the rustic engine by name instead of painting classic chrome', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderWithEngine(<PatternApprovalInbox engine="rustic" {...baseProps()} />, 'rustic');

    await waitFor(() => {
      const logged = consoleError.mock.calls.flat().map(String).join('\n');
      expect(logged).toContain('PatternApprovalInbox has no rustic implementation');
    });
    expect(document.querySelector('.ds-pattern-approval-inbox')).toBeNull();
    expect(screen.queryByText('Invoice 4521')).toBeNull();
  });
});

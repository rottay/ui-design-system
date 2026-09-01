/** Error-contract tests: a caught value must never reach React as a child, and
 *  presence is nullish-only so a falsey-but-real error is not read as absence. */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { CollectionWorkspaceSurface } from '../index';
import { DecisionInboxSurface } from '../../decision-inbox';
import { CompareSurface } from '../../../data/compare';
import { CommandCenterSurface } from '../../command-center';
import { hasSurfaceError } from '../../../../../runtime/helpers';
import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderSurface } from '../../../../../foundation/common/test-utils';

interface Row {
  id: string;
  name: string;
}

const DATA: Row[] = [{ id: '1', name: 'Alice' }];
const COLUMNS: ColumnDef<Row>[] = [{ key: 'name', header: 'Name', accessorKey: 'name' }];

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Records',
    data: DATA,
    columns: COLUMNS,
    rowKey: 'id' as const,
    ...overrides,
  };
}

describe('CollectionWorkspaceSurface error contract', () => {
  it('renders a caught Error through the normalized error state rather than as a React child', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface<Row>
        {...baseProps({ error: new Error('Prisma read failed') })}
      />,
    );

    // The message survives; what changed is that it arrives as text the shared
    // kit formatted, not as an object handed to the reconciler.
    await screen.findAllByText(/Prisma read failed/);
    const errorRegion = container.querySelector('[data-part="error-state"]');
    expect(errorRegion).not.toBeNull();
    expect(errorRegion?.querySelector('.ds-error-state')).not.toBeNull();
    expect(errorRegion).toHaveTextContent('Prisma read failed');
  });

  it('renders a non-Error caught value without crashing', async () => {
    renderSurface(
      <CollectionWorkspaceSurface<Row>
        {...baseProps({ error: { code: 503, detail: 'upstream unavailable' } })}
      />,
    );

    expect(await screen.findByText('Records')).toBeInTheDocument();
  });

  it('still renders a caller-supplied node verbatim as custom error chrome', async () => {
    renderSurface(
      <CollectionWorkspaceSurface<Row>
        {...baseProps({
          error: <div data-testid="custom-error">Escalate to the data team</div>,
        })}
      />,
    );

    const node = await screen.findByTestId('custom-error');
    expect(node).toBeInTheDocument();
    expect(node).toHaveTextContent('Escalate to the data team');
  });

  it('offers the retry affordance the rest of the layer exposes', async () => {
    const onRetry = vi.fn();
    renderSurface(
      <CollectionWorkspaceSurface<Row>
        {...baseProps({ error: new Error('Timed out'), onRetry })}
      />,
    );

    const retry = await screen.findByRole('button', { name: /try again/i });
    expect(retry).toHaveClass('ds-error-state__retry');
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps a numeric code visible instead of swallowing it into the generic fallback', async () => {
    // A number was a renderable ReactNode before the widening; normalizing it
    // must not silently replace the caller's code with boilerplate.
    const { container } = renderSurface(
      <CollectionWorkspaceSurface<Row> {...baseProps({ error: 404 })} />,
    );

    await screen.findAllByText('404');
    expect(container.querySelector('[data-part="error-state"]')).toHaveTextContent('404');
  });

  it('announces once: the wrapper defers to the kit, and covers caller chrome', async () => {
    const normalized = renderSurface(
      <CollectionWorkspaceSurface<Row> {...baseProps({ error: new Error('Down') })} />,
    );
    await normalized.findAllByText(/Down/);
    const normalizedRegion = normalized.container.querySelector('[data-part="error-state"]');
    // The kit's Alert already carries role="alert"; a polite wrapper around it
    // would nest live regions and double-announce.
    expect(normalizedRegion?.getAttribute('aria-live')).toBeNull();
    expect(normalizedRegion?.querySelector('[role="alert"]')).not.toBeNull();

    normalized.unmount();

    const custom = renderSurface(
      <CollectionWorkspaceSurface<Row>
        {...baseProps({ error: <div data-testid="own-chrome">Escalate</div> })}
      />,
    );
    await custom.findByTestId('own-chrome');
    const customRegion = custom.container.querySelector('[data-part="error-state"]');
    // Caller chrome announces nothing on its own, so the wrapper still does.
    expect(customRegion?.getAttribute('aria-live')).toBe('polite');
  });

  it('does not synthesize a retry control when the caller supplies no handler', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface<Row> {...baseProps({ error: new Error('Timed out') })} />,
    );

    expect(container.querySelector('[data-part="error-state"]')).toHaveTextContent('Timed out');
    expect(container.querySelector('.ds-error-state__retry')).toBeNull();
  });
});

describe('DecisionInboxSurface error contract', () => {
  // The same contract field reaches a second family through the shared
  // collection config, which rendered it as a child too.
  const decisions = [{ key: 'approve', label: 'Approve', variant: 'primary' as const }];

  it('normalizes a caught Error instead of rendering it as a React child', async () => {
    const { container } = renderSurface(
      <DecisionInboxSurface<Row>
        queueName="Approval Queue"
        workspace={{ data: DATA, error: new Error('Queue fetch failed') }}
        columns={COLUMNS}
        rowKey="id"
        decisions={decisions}
        onDecision={vi.fn()}
      />,
    );

    await screen.findByText('Approval Queue');
    const errorRegion = container.querySelector('[data-part="error"]');
    expect(errorRegion?.querySelector('.ds-error-state')).not.toBeNull();
    expect(errorRegion).toHaveTextContent('Queue fetch failed');
  });

  it('keeps a caller-supplied error node verbatim', async () => {
    renderSurface(
      <DecisionInboxSurface<Row>
        queueName="Approval Queue"
        workspace={{
          data: DATA,
          error: <div data-testid="inbox-custom-error">Contact the reviewer</div>,
        }}
        columns={COLUMNS}
        rowKey="id"
        decisions={decisions}
        onDecision={vi.fn()}
      />,
    );

    expect(await screen.findByTestId('inbox-custom-error')).toBeInTheDocument();
  });
});

describe('falsey-but-present caught values', () => {
  // normalizeSurfaceError renders a finite number, so a truthiness guard would
  // drop error=0 and paint normal content over a real failure.
  it('routes a numeric 0 to the error state with retry, not to the data view', async () => {
    const onRetry = vi.fn();
    const { container } = renderSurface(
      <CollectionWorkspaceSurface<Row> {...baseProps({ error: 0, onRetry })} />,
    );

    const retry = await screen.findByRole('button', { name: /try again/i });
    expect(container.querySelector('[data-part="error-state"]')).toHaveTextContent('0');
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('treats an empty string as present and renders the generic failure', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface<Row> {...baseProps({ error: '' })} />,
    );
    await screen.findByText('Records');
    expect(container.querySelector('.ds-error-state')).not.toBeNull();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('treats false as present rather than as absence', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface<Row> {...baseProps({ error: false })} />,
    );
    await screen.findByText('Records');
    expect(container.querySelector('.ds-error-state')).not.toBeNull();
  });

  it('still renders data when the error is genuinely absent', async () => {
    renderSurface(<CollectionWorkspaceSurface<Row> {...baseProps()} />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
  });

  it('routes a numeric 0 through DecisionInbox rather than its empty state', async () => {
    const { container } = renderSurface(
      <DecisionInboxSurface<Row>
        queueName="Approval Queue"
        workspace={{ data: DATA, error: 0 }}
        columns={COLUMNS}
        rowKey="id"
        decisions={[{ key: 'approve', label: 'Approve', variant: 'primary' as const }]}
        onDecision={vi.fn()}
      />,
    );
    await screen.findByText('Approval Queue');
    expect(container.querySelector('[data-part="error"] .ds-error-state')).not.toBeNull();
    expect(screen.queryByText(/No pending decisions/i)).not.toBeInTheDocument();
  });

  it('routes a numeric 0 through CompareSurface', async () => {
    const { container } = renderSurface(
      <CompareSurface
        config={{
          visual: {},
          presentation: { chrome: { title: 'Compare' } },
          behavior: {
            subjects: [{ key: 'a', label: 'A' }],
            sections: [{ key: 'main', title: 'Main', rows: [{ key: 'f', label: 'F', values: { a: 'Yes' } }] }],
          },
        }}
        error={0}
      />,
    );
    await screen.findByText('Compare');
    expect(container.querySelector('.ds-error-state')).not.toBeNull();
  });

  it('routes a numeric 0 through CommandCenterSurface', async () => {
    const { container } = renderSurface(
      <CommandCenterSurface title="Hub" stats={[{ key: 's', label: 'Open', value: 3 }]} error={0} />,
    );
    await screen.findByText('Hub');
    expect(container.querySelector('.ds-error-state')).not.toBeNull();
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  });

  it('is the invariant a truthiness guard could not express', () => {
    for (const present of [0, '', false, NaN, 'boom', new Error('x'), {}]) {
      expect(hasSurfaceError(present)).toBe(true);
    }
    for (const absent of [undefined, null]) {
      expect(hasSurfaceError(absent)).toBe(false);
    }
    expect(Boolean(0)).toBe(false);
  });
});

describe('the hazard these tests guard', () => {
  // Without this, the tests above could pass for the wrong reason: if React
  // tolerated an Error as a child, normalizing would be decoration, not a fix.
  it('confirms React rejects an Error passed as a child', () => {
    const Boom = () => <div>{new Error('unrenderable') as unknown as React.ReactNode}</div>;
    expect(() => renderSurface(<Boom />)).toThrow();
  });
});

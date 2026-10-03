import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DecisionInboxSurface } from '..';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

describe('DecisionInbox posture landmarks', () => {
  it.each(['hide', 'collapse'] as const)('applies %s to the initial-loading filter and queue placeholders', async (disposition) => {
    const { container } = renderSurface(<DecisionInboxSurface queueName="Review" workspace={{ data: [], loading: true }} columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]} rowKey="id" decisions={[{ key: 'approve', label: 'Approve' }]} onDecision={vi.fn()} postures={{ phone: { regions: { filters: disposition, queue: disposition } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await waitFor(() => expect(container.querySelector('.ds-decision-inbox__skeleton-subtitle')).not.toBeNull());
    expect(container.querySelector('[data-divider-kind="skeleton-row"]')).toBeNull();
    expect(container.querySelector('.ds-decision-inbox__skeleton')?.querySelector('.rottay-skeleton')).toBeNull();
    await waitFor(() => {
      for (const name of ['filters', 'queue']) {
        const region = container.querySelector(`[data-surface-region="${name}"]`);
        if (disposition === 'hide') expect(region).toBeNull();
        else {
          expect(region, `${name} collapse retains its host`).not.toBeNull();
          expect(region).toHaveAttribute('data-region-disposition', 'collapse');
          expect(region?.childElementCount).toBe(0);
        }
      }
    });
  });

  it('preserves the initial-loading filters and queue when postures are omitted', async () => {
    const { container } = renderSurface(<DecisionInboxSurface queueName="Review" workspace={{ data: [], loading: true }} columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]} rowKey="id" decisions={[{ key: 'approve', label: 'Approve' }]} onDecision={vi.fn()} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await waitFor(() => expect(container.querySelector('[data-divider-kind="skeleton-row"]')).not.toBeNull());
    expect(container.querySelector('.ds-decision-inbox__skeleton')?.querySelector('.rottay-skeleton')).not.toBeNull();
    expect(container.querySelector('[data-surface-region]')).toBeNull();
  });
  it('keeps a collapsed review rail named after its heading is removed', async () => {
    const onDecision = vi.fn();
    renderSurface(<DecisionInboxSurface queueName="Review" workspace={{ data: [{ id: 'one', name: 'Request A' }] }} columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]} rowKey="id" decisions={[{ key: 'approve', label: 'Approve' }]} onDecision={onDecision} reviewRail={{ render: () => <div>Review content</div> }} postures={{ phone: { regions: { 'review-rail': 'collapse' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    fireEvent.click(await screen.findByText('Request A'));
    const rail = await screen.findByRole('complementary', { name: 'Review Details' });
    expect(rail).not.toHaveAttribute('aria-labelledby');
    expect(rail.childElementCount).toBe(0);
    expect(screen.queryByText('Review content')).not.toBeInTheDocument();
    expect(onDecision).not.toHaveBeenCalled();
  });

  it('retains the original review heading relationship and decision callback when omitted', async () => {
    const onDecision = vi.fn();
    const { container } = renderSurface(<DecisionInboxSurface queueName="Review" workspace={{ data: [{ id: 'one', name: 'Request A' }] }} columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]} rowKey="id" decisions={[{ key: 'approve', label: 'Approve' }]} onDecision={onDecision} reviewRail={{ render: () => <div>Review content</div> }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    fireEvent.click(await screen.findByText('Request A'));
    const rail = await screen.findByRole('complementary', { name: 'Review Details' });
    expect(document.getElementById(rail.getAttribute('aria-labelledby')!)).toHaveTextContent('Review Details');
    expect(container.querySelector('[data-surface-region]')).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    expect(onDecision).toHaveBeenCalledOnce();
    expect(onDecision).toHaveBeenCalledWith('one', 'approve', undefined);
  });
});

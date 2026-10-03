import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollectionWorkspaceSurface } from '..';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

const data = [{ id: 'one', name: 'One row' }];
const columns = [{ key: 'name', header: 'Name', accessorKey: 'name' as const }];

describe('CollectionWorkspace postures', () => {
  it.each(['hide', 'collapse'] as const)('applies toolbar %s to the legacy toolbar and its controls', async (disposition) => {
    const create = vi.fn();
    const { container } = renderSurface(<CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" controls={{ viewMode: { enabled: true } }} primaryAction={{ label: 'Add record', onClick: create }} postures={{ phone: { regions: { toolbar: disposition } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('One row');
    await waitFor(() => expect(container.querySelector('.ds-collection-workspace__collection')).not.toBeNull());
    expect(container.querySelector('.ds-pattern-list-toolbar')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add record' })).not.toBeInTheDocument();
    const region = container.querySelector('[data-surface-region="toolbar"]');
    if (disposition === 'hide') expect(region).toBeNull();
    else expect(region?.childElementCount).toBe(0);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['hide', 'collapse'] as const)('applies primary-action %s to a premium adaptive sticky dock without an explicit placement', async (disposition) => {
    const create = vi.fn();
    const { container } = renderSurface(<CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" header={{ eyebrow: 'Records', title: 'Records', subtitle: 'Manage records', quickActions: [{ key: 'create', label: 'Add record', onClick: create }] }} primaryAction={{ key: 'create', label: 'Add record', onClick: create }} adaptive={{ phone: { actionBar: 'sticky-bottom' } }} postures={{ phone: { regions: { 'primary-action': disposition } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Manage records');
    await waitFor(() => expect(container.querySelector('.ds-collection-workspace__collection')).not.toBeNull());
    expect(screen.queryByRole('button', { name: 'Add record' })).not.toBeInTheDocument();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it('retains independent overflow actions when the adaptive dock primary is hidden', async () => {
    const create = vi.fn();
    const exportRecords = vi.fn();
    const { container } = renderSurface(<CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" header={{ eyebrow: 'Records', title: 'Records', subtitle: 'Manage records', quickActions: [{ key: 'create', label: 'Add record', onClick: create }, { key: 'export', label: 'Export', onClick: exportRecords }] }} primaryAction={{ key: 'create', label: 'Add record', onClick: create }} adaptive={{ phone: { actionBar: 'sticky-bottom' } }} postures={{ phone: { regions: { 'primary-action': 'hide' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const more = await screen.findByRole('button', { name: 'More actions' });
    expect(more.closest('.ds-action-dock')).toHaveAttribute('data-mode', 'sticky');
    expect(screen.queryByRole('button', { name: 'Add record' })).not.toBeInTheDocument();
    expect(container.querySelector('.ds-action-dock')?.childElementCount).toBeGreaterThan(0);
    fireEvent.click(more);
    fireEvent.click(await screen.findByText('Export'));
    expect(exportRecords).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
  });
  it.each(['legacy', 'premium'] as const)('keeps an explicit app-bar primary action in the %s toolbar', async (mode) => {
    const create = vi.fn();
    const { container } = renderSurface(
      <CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" controls={{ viewMode: { enabled: true } }} {...(mode === 'premium' ? { header: { eyebrow: 'Records', title: 'Records', subtitle: 'Manage records', quickActions: [{ key: 'create', label: 'Add record', onClick: create }] } } : {})} primaryAction={{ key: 'create', label: 'Add record', onClick: create }} postures={{ phone: { primaryAction: 'app-bar' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const button = await screen.findByRole('button', { name: 'Add record' });
    expect(screen.getAllByRole('button', { name: 'Add record' })).toHaveLength(1);
    expect(button.closest(mode === 'legacy' ? '.ds-pattern-list-toolbar' : '[data-part="toolbar-row"]')).not.toBeNull();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
    fireEvent.click(button);
    expect(create).toHaveBeenCalledOnce();
  });

  it('lets explicit phone render declarations show context and stats despite legacy chrome flags', async () => {
    renderSurface(<CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" header={{ eyebrow: 'Records', title: 'Records', subtitle: 'Manage records' }} chrome={{ context: false, stats: false }} contextSlot={<div>Context summary</div>} statsSlot={<div>Record metrics</div>} postures={{ phone: { regions: { context: 'render', stats: 'render' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    expect(await screen.findByText('Context summary')).toBeInTheDocument();
    expect(screen.getByText('Record metrics')).toBeInTheDocument();
  });

  it('preserves disabled and pending flags for the premium app-bar primary action', async () => {
    const create = vi.fn();
    renderSurface(<CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" header={{ eyebrow: 'Records', title: 'Records', subtitle: 'Manage records' }} primaryAction={{ label: 'Add record', ariaLabel: 'Add record', onClick: create, disabled: true, pending: true, pendingLabel: 'Saving' }} postures={{ phone: { primaryAction: 'app-bar' } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const button = await screen.findByRole('button', { name: 'Add record' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.closest('[data-part="toolbar-row"]')).not.toBeNull();
    fireEvent.click(button);
    expect(create).not.toHaveBeenCalled();
  });

  it.each([['sheet', 'hide'], ['sheet', 'collapse'], ['accordion', 'hide'], ['accordion', 'collapse']] as const)('applies preview-rail %s / %s to the adaptive pane', async (pane, disposition) => {
    const { container } = renderSurface(<CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" adaptive={{ phone: { collection: 'cards', pane } }} behavior={{ selection: { enabled: true, selectedKeys: ['one'] }, previewRail: { enabled: true, render: () => <div>Private preview</div> } }} postures={{ phone: { regions: { 'preview-rail': disposition } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Records');
    await waitFor(() => {
      expect(screen.queryByText('Private preview')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: 'Records details' })).not.toBeInTheDocument();
      const region = container.querySelector('[data-surface-region="preview-rail"]');
      if (disposition === 'hide') expect(region).toBeNull();
      else {
        expect(region).toHaveAttribute('data-region-disposition', 'collapse');
        expect(region?.childElementCount).toBe(0);
      }
    });
  });
  it('moves the legacy toolbar primary action exactly once and uses scoped density', async () => {
    const create = vi.fn();
    const { container } = renderSurface(
      <CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" controls={{ viewMode: { enabled: true }, density: { enabled: true, value: 'comfortable' } }} primaryAction={{ label: 'Add record', onClick: create }} postures={{ phone: { primaryAction: 'bottom-bar', density: 'compact' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const button = await screen.findByRole('button', { name: 'Add record' });
    expect(screen.getAllByRole('button', { name: 'Add record' })).toHaveLength(1);
    expect(button.closest('.ds-action-dock')).toHaveAttribute('data-mode', 'sticky');
    expect(container.querySelector('.ds-collection-workspace__collection')!.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector('.ds-collection-workspace[data-density]')).toHaveAttribute('data-density', 'compact');
    fireEvent.click(button);
    expect(create).toHaveBeenCalledOnce();
  });

  it('deduplicates the primary action from premium header actions when floating', async () => {
    const create = vi.fn();
    const { container } = renderSurface(
      <CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" header={{ eyebrow: 'Records', title: 'Records', subtitle: 'Manage records', quickActions: [{ key: 'create', label: 'Add record', onClick: create }] }} primaryAction={{ key: 'create', label: 'Add record', onClick: create }} postures={{ phone: { primaryAction: 'floating', regions: { stats: 'hide' } } }} statsSlot={<div>Private metrics</div>} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const button = await screen.findByRole('button', { name: 'Add record' });
    expect(screen.getAllByRole('button', { name: 'Add record' })).toHaveLength(1);
    expect(button.closest('.ds-action-dock')).toHaveAttribute('data-mode', 'fixed');
    expect(container.querySelector('.ds-collection-workspace__collection')!.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText('Private metrics')).not.toBeInTheDocument();
    fireEvent.click(button);
    expect(create).toHaveBeenCalledOnce();
  });

  it('retains the legacy toolbar action without a posture dock when omitted', async () => {
    const { container } = renderSurface(<CollectionWorkspaceSurface title="Records" data={data} columns={columns} rowKey="id" controls={{ viewMode: { enabled: true } }} primaryAction={{ label: 'Add record', onClick: vi.fn() }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const button = await screen.findByRole('button', { name: 'Add record' });
    expect(button.closest('.ds-pattern-list-toolbar')).not.toBeNull();
    expect(container.querySelector('[data-surface-region]')).toBeNull();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
  });
});

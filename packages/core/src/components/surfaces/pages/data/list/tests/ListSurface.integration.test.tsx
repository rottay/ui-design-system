/** @fileoverview ListSurface integration tests -- filters, table/card views, and row actions. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ListSurface } from '..';
import type { EntityAdapter, ListSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../common/test-utils';

interface RawCandidate {
  id: string;
  name: string;
  stage: string;
  salary: number;
}

const adapter: EntityAdapter<RawCandidate, RawCandidate> = {
  entity: 'candidate',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [
    { key: 'name', fieldId: 'candidate.name' },
    { key: 'stage', fieldId: 'candidate.stage' },
    { key: 'salary', fieldId: 'candidate.salary' },
  ],
};

function buildConfig(overrides: Partial<ListSurfaceConfig<RawCandidate>> = {}): ListSurfaceConfig<RawCandidate> {
  const onPrimaryAction = vi.fn();
  const onRowAction = vi.fn();
  const onRowClick = vi.fn();

  return {
    visual: {
      defaultView: 'table',
      allowViewSwitch: true,
      cardMinWidth: 260,
    },
    presentation: {
      chrome: {
        title: 'Candidates',
      },
      toolbarStart: <div>Toolbar start</div>,
      toolbarEnd: <div>Toolbar end</div>,
      emptyState: <div>Custom empty state</div>,
      renderCell: {
        'candidate.name': (value) => <strong>{`Candidate: ${String(value)}`}</strong>,
      },
      renderCard: (item) => <div>{`Candidate card: ${item.name}`}</div>,
    },
    behavior: {
      columns: [
        { key: 'name', fieldId: 'candidate.name', header: 'Name', accessorKey: 'name' },
        { key: 'stage', fieldId: 'candidate.stage', header: 'Stage', accessorKey: 'stage' },
        { key: 'salary', fieldId: 'candidate.salary', header: 'Salary', accessorKey: 'salary' },
      ],
      filters: [
        {
          key: 'stage',
          label: 'Stage',
          type: 'select',
          options: [
            { label: 'Interview', value: 'interview' },
            { label: 'Offer', value: 'offer' },
          ],
        },
      ],
      filterValues: {
        stage: 'interview',
      },
      onFilterChange: vi.fn(),
      onFilterReset: vi.fn(),
      onFilterApply: vi.fn(),
      pagination: false,
      primaryAction: {
        id: 'create',
        label: 'Create candidate',
        variant: 'primary',
        onClick: onPrimaryAction,
      },
      rowActions: [
        {
          id: 'view',
          label: 'View',
          onClick: onRowAction,
        },
        {
          id: 'restricted',
          label: 'Restricted',
          onClick: onRowAction,
        },
      ],
      onRowClick,
    },
    permissions: {
      granted: ['candidate:view', 'candidate:create'],
      fields: {
        'candidate.salary': { permission: 'candidate:salary' },
      },
      actions: {
        view: { permission: 'candidate:view' },
        restricted: { permission: 'candidate:restricted' },
        create: { permission: 'candidate:create' },
      },
    },
    ...overrides,
  };
}

const rows: RawCandidate[] = [
  { id: '1', name: 'Ana Gomez', stage: 'interview', salary: 120000 },
];

describe('ListSurface integration', () => {
  it('renders table mode, filters, permission filtering, and primary actions', async () => {
    const config = buildConfig();
    const primaryAction = config.behavior.primaryAction;

    renderSurface(<ListSurface data={rows} adapter={adapter} config={config} />);

    expect(await screen.findByText('Candidates')).toBeInTheDocument();
    expect(screen.getByText('Toolbar start')).toBeInTheDocument();
    expect(screen.getByText('Toolbar end')).toBeInTheDocument();
    expect(await screen.findByText((content) => content.startsWith('Filters'))).toBeInTheDocument();
    expect(await screen.findByText('Candidate: Ana Gomez')).toBeInTheDocument();
    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create candidate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restricted/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /create candidate/i }));
    expect(primaryAction?.onClick).toHaveBeenCalled();
  });

  it('switches to cards and keeps row actions and row clicks wired', async () => {
    const config = buildConfig({
      presentation: {
        ...buildConfig().presentation,
        renderCard: undefined,
      },
    });

    renderSurface(<ListSurface data={rows} adapter={adapter} config={config} />);

    fireEvent.click(await screen.findByRole('button', { name: /cards/i }));

    expect(await screen.findByText('Candidate: Ana Gomez')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Candidate: Ana Gomez'));
    expect(config.behavior.onRowClick).toHaveBeenCalledWith(rows[0], 0);

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[viewButtons.length - 1]);
    expect(config.behavior.rowActions?.[0].onClick).toHaveBeenCalledWith(rows[0]);
  });

  it('renders custom empty states and error states', async () => {
    const config = buildConfig();
    const onRetry = vi.fn();

    renderSurface(
      <ListSurface data={[]} adapter={adapter} config={config} />
    );

    expect(await screen.findByText('Custom empty state')).toBeInTheDocument();

    renderSurface(
      <ListSurface
        data={rows}
        adapter={adapter}
        config={config}
        error={new Error('List exploded')}
        onRetry={onRetry}
      />
    );

    expect(await screen.findByText('List exploded')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(onRetry).toHaveBeenCalled();
    });
  });
});

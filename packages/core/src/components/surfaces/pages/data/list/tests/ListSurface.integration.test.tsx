/** @fileoverview ListSurface integration tests -- filters, table/card views, and row actions. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ListSurface } from '..';
import type { EntityAdapter, ListSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

function getButtonsByText(container: HTMLElement, label: RegExp): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button')).filter((button) =>
    label.test(button.textContent ?? '')
  );
}

function getButtonByText(container: HTMLElement, label: RegExp): HTMLButtonElement {
  const button = getButtonsByText(container, label)[0];
  expect(button).toBeDefined();
  return button;
}

function queryButtonByText(container: HTMLElement, label: RegExp): HTMLButtonElement | undefined {
  return getButtonsByText(container, label)[0];
}

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
      mobileDefaultView: 'table',
      allowViewSwitch: true,
      hideViewSwitchOnMobile: false,
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

    const { container } = renderSurface(<ListSurface data={rows} adapter={adapter} config={config} />);

    expect(await screen.findByText('Candidates')).toBeInTheDocument();
    expect(container.textContent).toContain('Toolbar start');
    expect(container.textContent).toContain('Toolbar end');
    expect(container.textContent).toContain('Stage');
    expect(container.textContent).toContain('Ana Gomez');
    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    expect(getButtonByText(container, /create candidate/i)).toBeInTheDocument();
    expect(getButtonByText(container, /view/i)).toBeInTheDocument();
    expect(queryButtonByText(container, /restricted/i)).toBeUndefined();

    fireEvent.click(getButtonByText(container, /create candidate/i));
    expect(primaryAction?.onClick).toHaveBeenCalled();
  });

  it('switches to cards and keeps row actions and row clicks wired', async () => {
    const config = buildConfig({
      presentation: {
        ...buildConfig().presentation,
        renderCard: undefined,
      },
    });

    const { container } = renderSurface(<ListSurface data={rows} adapter={adapter} config={config} />);

    await screen.findByText('Candidates');
    fireEvent.click(getButtonByText(container, /cards/i));

    await waitFor(() => {
      expect(container.textContent).toContain('Ana Gomez');
    });

    fireEvent.click(screen.getByText(/Ana Gomez/));
    expect(config.behavior.onRowClick).toHaveBeenCalledWith(rows[0], 0);

    const viewButtons = getButtonsByText(container, /view/i);
    fireEvent.click(viewButtons[viewButtons.length - 1]);
    expect(config.behavior.rowActions?.[0].onClick).toHaveBeenCalledWith(rows[0]);
  });

  it('renders custom empty states and error states', async () => {
    const config = buildConfig();
    const onRetry = vi.fn();

    const emptyRender = renderSurface(
      <ListSurface data={[]} adapter={adapter} config={config} />
    );

    expect(await screen.findByText('Custom empty state')).toBeInTheDocument();
    emptyRender.unmount();

    const errorRender = renderSurface(
      <ListSurface
        data={rows}
        adapter={adapter}
        config={config}
        error={new Error('List exploded')}
        onRetry={onRetry}
      />
    );

    expect(await screen.findByText('List exploded')).toBeInTheDocument();

    fireEvent.click(getButtonByText(errorRender.container, /try again/i));

    await waitFor(() => {
      expect(onRetry).toHaveBeenCalled();
    });
  });
});

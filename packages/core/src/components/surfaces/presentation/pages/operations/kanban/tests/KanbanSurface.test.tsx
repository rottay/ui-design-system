/** @fileoverview KanbanSurface tests -- column rendering, card display, and filters. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { KanbanSurface } from '..';
import type { KanbanSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<KanbanSurfaceConfig>): KanbanSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Project Board',
        subtitle: 'Manage tasks across stages',
      },
    },
    behavior: {
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          items: [
            { id: 'c1', title: 'Design mockups' },
            { id: 'c2', title: 'Write specs' },
          ],
        },
        {
          id: 'in-progress',
          title: 'In Progress',
          items: [
            { id: 'c3', title: 'Build API' },
          ],
        },
        {
          id: 'done',
          title: 'Done',
          items: [],
        },
      ],
      onCardMove: vi.fn(),
    },
    ...overrides,
  };
}

describe('KanbanSurface', () => {
  it('places board actions after the body for a sticky posture', async () => {
    const value = buildConfig();
    const create = vi.fn();
    value.behavior.actions = [{ id: 'create', label: 'Create card', onClick: create }];
    renderSurface(<KanbanSurface config={value} postures={{ phone: { primaryAction: 'bottom-bar' } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const action = await screen.findByRole('button', { name: 'Create card' });
    expect(action.closest('[data-part="header"]')).toBeNull();
    expect(action.closest('.ds-action-dock')?.parentElement).toHaveClass('ds-page-shell-surface');
    fireEvent.click(action);
    expect(create).toHaveBeenCalledOnce();
  });

  it.each(['loading', 'empty', 'error'] as const)('hides the board in its %s state', async (state) => {
    const value = buildConfig({ behavior: { columns: [{ id: 'todo', title: 'To Do', items: [] }] } });
    const { container } = renderSurface(<KanbanSurface config={value} loading={state === 'loading'} error={state === 'error' ? new Error('Board failed') : undefined} postures={{ phone: { regions: { board: 'hide' }, primaryAction: 'floating' } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Project Board');
    expect(container.querySelector('[data-surface-region="board"]')).toBeNull();
    expect(container.querySelector('[data-part="kanban-skeleton-block"]')).toBeNull();
    expect(screen.queryByText('No items')).toBeNull();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
  });

  it('collapses the initial board skeleton to an empty landmark', async () => {
    const value = buildConfig({ behavior: { columns: [{ id: 'todo', title: 'To Do', items: [] }] } });
    const { container } = renderSurface(<KanbanSurface config={value} loading postures={{ phone: { regions: { board: 'collapse' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Project Board');
    expect(container.querySelector('[data-surface-region="board"]')).toHaveAttribute('data-region-disposition', 'collapse');
    expect(container.querySelector('[data-surface-region="board"]')?.childElementCount).toBe(0);
  });

  it('renders page chrome and board', async () => {
    renderSurface(<KanbanSurface config={buildConfig()} />);

    expect(await screen.findByText('Project Board')).toBeInTheDocument();
  });

  it('renders empty state when all columns are empty', async () => {
    const config = buildConfig({
      behavior: {
        columns: [
          { id: 'todo', title: 'To Do', items: [] },
          { id: 'done', title: 'Done', items: [] },
        ],
        onCardMove: vi.fn(),
      },
    });

    renderSurface(<KanbanSurface config={config} />);

    expect(await screen.findByText('No items')).toBeInTheDocument();
  });

  it('pages bounded lane groups and stacks each group on phone', async () => {
    renderSurface(
      <KanbanSurface
        config={buildConfig({
          visual: {
            mobileColumnsLimit: 1,
            stackColumnsOnMobile: true,
          },
        })}
      />,
      { responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );

    expect(await screen.findByRole('status')).toHaveTextContent('Lanes 1–1 of 3');
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next kanban lanes' }));
    expect(await screen.findByText('In Progress')).toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelector('[data-part="responsive-board"]')).toHaveAttribute(
        'data-mobile-stack',
        'true'
      );
      expect(screen.getByRole('status')).toHaveTextContent('Lanes 2–2 of 3');
    });
  });
});

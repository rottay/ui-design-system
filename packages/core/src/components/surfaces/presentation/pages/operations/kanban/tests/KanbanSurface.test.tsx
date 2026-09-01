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

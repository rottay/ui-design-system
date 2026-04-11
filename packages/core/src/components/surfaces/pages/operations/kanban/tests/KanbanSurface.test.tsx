/** @fileoverview KanbanSurface tests -- column rendering, card display, and filters. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { KanbanSurface } from '..';
import type { KanbanSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../common/test-utils';

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
});

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../testing/helpers/engine-test-utils';

describe('Grid integration', () => {
  it.each(STABLE_ENGINES)('renders the live grid with the %s engine', async (engine) => {
    const { Grid } = await import('..');

    renderWithEngine(
      <Grid engine={engine} columns={{ xs: 1, md: 3 }} gap="md" data-testid="grid">
        <Grid.Item>One</Grid.Item>
        <Grid.Item span={2}>Two</Grid.Item>
      </Grid>,
      engine
    );

    const grid = await screen.findByTestId('grid', undefined, { timeout: 10000 });
    expect(grid).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  }, 15000);

  it('injects responsive CSS hooks for the modern engine', async () => {
    const { Grid } = await import('..');

    renderWithEngine(
      <Grid engine="modern" columns={{ xs: 1, md: 2 }} gap="sm" data-testid="grid-modern">
        <Grid.Item>Responsive</Grid.Item>
      </Grid>,
      'modern'
    );

    const grid = await screen.findByTestId('grid-modern', undefined, { timeout: 10000 });
    expect(grid).toHaveAttribute('data-grid-id');
    expect(document.head.innerHTML + document.body.innerHTML).toContain('@media (min-width: 768px)');
  });
});

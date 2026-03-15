import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../testing/helpers/engine-test-utils';

describe('Typography integration', () => {
  it.each(STABLE_ENGINES)('renders live text primitives with the %s engine', async (engine) => {
    const { Heading, Paragraph, Text } = await import('..');
    renderWithEngine(
      <div>
        <Heading engine={engine}>Surface heading</Heading>
        <Text engine={engine}>Inline copy</Text>
        <Paragraph engine={engine}>Long-form description</Paragraph>
      </div>,
      engine
    );

    expect(await screen.findByRole('heading', { name: /surface heading/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/inline copy/i)).toBeInTheDocument();
    expect(screen.getByText(/long-form description/i)).toBeInTheDocument();
  });
});

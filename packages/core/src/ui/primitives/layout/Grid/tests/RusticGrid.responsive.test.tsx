import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RusticGrid } from '../engines/rustic';

describe('RusticGrid responsive templates', () => {
  it('injects responsive CSS when columns or rows are provided as breakpoint objects', () => {
    const { container } = render(
      <RusticGrid
        data-testid="grid"
        columns={{ xs: 1, md: 3 }}
        rows={{ xs: 1, lg: 2 }}
      >
        Content
      </RusticGrid>
    );

    const grid = container.querySelector('[data-component="grid"]');
    const styleTag = container.querySelector('style');

    expect(grid).toHaveAttribute('data-grid-id');
    expect(styleTag?.textContent).toContain('grid-template-columns: repeat(1, 1fr);');
    expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
    expect(styleTag?.textContent).toContain('grid-template-columns: repeat(3, 1fr);');
    expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    expect(styleTag?.textContent).toContain('grid-template-rows: repeat(2, 1fr);');
  });
});

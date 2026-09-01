/**
 * Tour dialog naming (modern engine).
 *
 * `TourStepProps.title` is a ReactNode, so a data-driven step legitimately
 * arrives without one. The modern surface used to publish an EMPTY `h3` for
 * that step and left `aria-labelledby` pointing at nothing, producing a
 * `dialog` with no accessible name.
 *
 * @module Tour/tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernTour from '../engines/modern';

describe('Tour modern dialog name', () => {
  it('names a title-less step dialog and publishes no empty heading', () => {
    render(
      <ModernTour
        open
        steps={[{ title: null, description: 'Filters narrow the list.' }]}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Guided tour');
    // The description now carries the step copy AND the position: the counter
    // used to live only on the indicator graphic, which is not a tab stop, so
    // "where am I in this tour" was never announced.
    expect(dialog).toHaveAccessibleDescription('Filters narrow the list. Step 1 of 1');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('still names the dialog from the step title when one exists', () => {
    render(
      <ModernTour
        open
        steps={[{ title: 'Saved views', description: 'Pin a filter set.' }]}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Saved views');
    expect(dialog).not.toHaveAttribute('aria-label');
    expect(screen.getByRole('heading', { name: 'Saved views' })).toBeInTheDocument();
  });
});

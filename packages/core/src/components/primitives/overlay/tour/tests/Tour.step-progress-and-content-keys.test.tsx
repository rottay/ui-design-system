/**
 * Step position and content-key ownership for the modern Tour.
 *
 * The step counter existed only as the indicator graphic's `aria-label`, and
 * the indicators are not a tab stop, so a non-sighted user was never told
 * where in the tour they were. The surface also swallowed the horizontal
 * arrows unconditionally, so a text field inside a step lost caret movement to
 * tour navigation. Finally, `tour.label` was read through a channel that has
 * the key in no catalog, and three action labels used `t` (which echoes a
 * missing key) instead of the `tOr` floor the rest of the file uses.
 *
 * @module Tour/tests
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTour from '../engines/modern';

const STEPS = [
  { title: 'One', description: 'First stop.' },
  { title: 'Two', description: 'Second stop.' },
  { title: 'Three', description: 'Third stop.' },
];

describe('Tour modern step progress + content keys', () => {
  it('announces the position as part of the dialog description', () => {
    render(<ModernTour open steps={STEPS} current={1} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleDescription('Second stop. Step 2 of 3');
  });

  it('keeps the position announced for a step with no description', () => {
    render(<ModernTour open steps={[{ title: 'Solo' }]} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Step 1 of 1');
  });

  it('still walks steps with the arrows from the surface itself', () => {
    const onChange = vi.fn();
    render(<ModernTour open steps={STEPS} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('leaves the arrows to an editable control inside the step', () => {
    const onChange = vi.fn();
    render(
      <ModernTour
        open
        onChange={onChange}
        steps={[
          {
            title: 'Name it',
            cover: <input aria-label="Workspace name" defaultValue="abc" />,
          },
          ...STEPS,
        ]}
      />
    );

    const field = screen.getByLabelText('Workspace name');
    fireEvent.keyDown(field, { key: 'ArrowLeft' });
    fireEvent.keyDown(field, { key: 'ArrowRight' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('labels the close action from the floor rather than echoing a key', () => {
    render(<ModernTour open steps={STEPS} />);

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'close' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'next' })).toBeNull();
  });
});

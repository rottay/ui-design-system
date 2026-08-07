import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ShiftMatrixProps } from '../contracts';
import ModernShiftMatrix from '../engines/modern';

function props(overrides: Partial<ShiftMatrixProps> = {}): ShiftMatrixProps {
  return {
    roles: ['Bartender'],
    timeSlots: [{ label: '18:00-21:00', start: '18:00', end: '21:00' }],
    assignments: [
      {
        role: 'Bartender',
        timeSlot: '18:00-21:00',
        assigned: 2,
        required: 3,
        staff: ['Ana', 'Bob'],
      },
    ],
    ...overrides,
  };
}

describe('Modern ShiftMatrix — scroll region reachability', () => {
  it('gives the scrolling matrix region a keyboard tab stop and a name', () => {
    // Read-only matrix: no quick-assign button exists, so the region itself is
    // the only possible tab stop for reaching the slots that overflow.
    render(<ModernShiftMatrix {...props()} />);

    const region = screen.getByRole('region', { name: 'Shift coverage matrix' });
    expect(region).toHaveAttribute('data-part', 'table-region');
    expect(region).toHaveAttribute('tabindex', '0');
  });
});

describe('Modern ShiftMatrix — assignable cell name', () => {
  it('names the assigned staff inside the quick-assign accessible name', () => {
    render(<ModernShiftMatrix {...props({ onQuickAssign: vi.fn() })} />);

    // The button's aria-label replaces its content, so the roster rendered in
    // the cell is otherwise never announced.
    const cell = screen.getByRole('button', { name: /Ana, Bob/ });
    expect(cell).toHaveAttribute('data-part', 'cell-button');
  });

  it('keeps the roster-free name when the intersection lists no staff', () => {
    render(
      <ModernShiftMatrix
        {...props({
          onQuickAssign: vi.fn(),
          assignments: [
            { role: 'Bartender', timeSlot: '18:00-21:00', assigned: 0, required: 3 },
          ],
        })}
      />,
    );

    const cell = screen.getByRole('button', { name: /Bartender, 18:00-21:00/ });
    expect(cell.getAttribute('aria-label')).not.toContain('(');
  });
});

describe('Modern ShiftMatrix — loading lifecycle', () => {
  it('announces the skeleton branch as busy', () => {
    const { container } = render(<ModernShiftMatrix {...props()} loading />);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('aria-busy', 'true');
  });
});

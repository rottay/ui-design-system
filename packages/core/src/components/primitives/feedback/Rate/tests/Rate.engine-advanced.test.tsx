import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Rate as ModernRate } from '../engines/modern';
import { Rate as RusticRate } from '../engines/rustic';

describe('Rate runtime engine coverage', () => {
  it('covers modern engine half selection, clearing, keyboard navigation, and custom character branches', () => {
    const handleChange = vi.fn();
    const handleHoverChange = vi.fn();

    render(
      <ModernRate
        defaultValue={2}
        count={5}
        allowHalf
        allowClear
        tooltips={['Awful', 'Poor', 'Okay', 'Good', 'Great']}
        activeColor="#ff4d4f"
        inactiveColor="#d9d9d9"
        onChange={handleChange}
        onHoverChange={handleHoverChange}
        character={({ index }) => <span data-testid={`modern-char-${index}`}>*</span>}
      />
    );

    const rate = screen.getByTestId('rate');
    const firstStar = screen.getAllByRole('radio', { name: 'Awful' }).find((node) => node.tagName === 'LABEL');
    const secondStar = screen.getAllByRole('radio', { name: 'Poor' }).find((node) => node.tagName === 'LABEL');
    if (!(firstStar instanceof HTMLElement) || !(secondStar instanceof HTMLElement)) {
      throw new Error('Expected visible modern rate stars');
    }

    fireEvent.focus(rate);
    fireEvent.keyDown(rate, { key: 'ArrowRight' });
    fireEvent.keyDown(rate, { key: 'End' });
    fireEvent.keyDown(rate, { key: 'Home' });

    const halfHitArea = firstStar.querySelector('span');
    if (!(halfHitArea instanceof HTMLElement)) {
      throw new Error('Expected modern half-star hit area');
    }

    fireEvent.mouseEnter(halfHitArea);
    fireEvent.click(halfHitArea);
    fireEvent.mouseLeave(firstStar);

    fireEvent.click(secondStar);
    fireEvent.click(secondStar);

    expect(handleHoverChange).toHaveBeenCalledWith(0.5);
    expect(handleHoverChange).toHaveBeenCalledWith(0);
    expect(handleChange).toHaveBeenCalledWith(2.5);
    expect(handleChange).toHaveBeenCalledWith(0);
    expect(screen.getByTestId('modern-char-0')).toBeInTheDocument();
    expect(rate).toHaveAttribute('aria-valuemax', '5');
  });

  it('covers rustic engine disabled/readOnly guards, half clicks, keyboard commit, and hover state branches', () => {
    const handleChange = vi.fn();
    const handleHoverChange = vi.fn();

    const { rerender } = render(
      <RusticRate
        defaultValue={1}
        allowHalf
        allowClear
        tooltips={['One', 'Two', 'Three', 'Four', 'Five']}
        activeColor="#22c55e"
        inactiveColor="#cbd5e1"
        onChange={handleChange}
        onHoverChange={handleHoverChange}
      />
    );

    const rate = screen.getByTestId('rate');
    const secondStar = screen.getByRole('radio', { name: 'Two' });
    const secondHalfArea = secondStar.querySelector('span');
    if (!(secondHalfArea instanceof HTMLElement)) {
      throw new Error('Expected rustic half-star hit area');
    }

    fireEvent.mouseEnter(secondStar);
    fireEvent.mouseEnter(secondHalfArea);
    fireEvent.click(secondHalfArea);
    fireEvent.mouseLeave(rate);

    fireEvent.focus(rate);
    fireEvent.keyDown(rate, { key: 'ArrowRight' });
    fireEvent.keyDown(rate, { key: 'Enter' });
    fireEvent.keyDown(rate, { key: ' ' });

    expect(handleHoverChange).toHaveBeenCalledWith(2);
    expect(handleHoverChange).toHaveBeenCalledWith(1.5);
    expect(handleHoverChange).toHaveBeenCalledWith(0);
    expect(handleChange).toHaveBeenCalledWith(1.5);

    rerender(
      <RusticRate
        value={4}
        readOnly
        onChange={handleChange}
        onHoverChange={handleHoverChange}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    fireEvent.keyDown(screen.getByTestId('rate'), { key: 'ArrowLeft' });

    rerender(
      <RusticRate
        defaultValue={3}
        disabled
        onChange={handleChange}
        onHoverChange={handleHoverChange}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: '3 stars' }));
    fireEvent.mouseEnter(screen.getByRole('radio', { name: '5 stars' }));

    expect(screen.getByTestId('rate')).toHaveAttribute('aria-disabled', 'true');
  });
});

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Slider as RusticSlider } from '../engines/rustic';

describe('Slider rustic advanced coverage', () => {
  it('covers range defaults, marks, vertical layout, focus state, and style-array branches', () => {
    const handleChange = vi.fn();
    const handleChangeComplete = vi.fn();

    const { container } = render(
      <RusticSlider
        range
        min={10}
        max={30}
        vertical
        marks={{
          10: 'Low',
          20: { label: 'Middle', style: { color: 'red' } },
          30: 'High',
        }}
        trackStyle={[{ backgroundColor: 'rgb(255, 0, 0)' }]}
        handleStyle={[
          { backgroundColor: 'rgb(0, 0, 255)' },
          { backgroundColor: 'rgb(0, 128, 0)' },
        ]}
        onChange={handleChange}
        onChangeComplete={handleChangeComplete}
      />
    );

    const inputs = container.querySelectorAll('input[type="range"]');
    expect(inputs).toHaveLength(2);
    expect((inputs[0] as HTMLInputElement).value).toBe('10');
    expect((inputs[1] as HTMLInputElement).value).toBe('30');
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Middle')).toHaveStyle({ color: 'red' });
    expect(screen.getByText('High')).toBeInTheDocument();

    fireEvent.focus(inputs[0]);
    expect(container.firstElementChild).toHaveClass('rottay-slider--focused');

    fireEvent.change(inputs[1], { target: { value: '25' } });
    expect(handleChange).toHaveBeenCalledWith([10, 25]);

    fireEvent.mouseUp(inputs[1]);
    expect(handleChangeComplete).toHaveBeenCalledWith([10, 25]);

    fireEvent.blur(inputs[0]);
    expect(container.firstElementChild).not.toHaveClass('rottay-slider--focused');

    const handles = container.querySelectorAll('.rottay-slider__handle');
    expect(handles[0]).toHaveStyle({ backgroundColor: 'rgb(0, 0, 255)' });
    expect(handles[1]).toHaveStyle({ backgroundColor: 'rgb(0, 128, 0)' });
  });

  it('covers single-value controlled, disabled, and touch-end branches', () => {
    const handleChange = vi.fn();
    const handleChangeComplete = vi.fn();

    const { container } = render(
      <RusticSlider
        value={40}
        disabled
        trackStyle={{ backgroundColor: 'rgb(255, 165, 0)' }}
        handleStyle={{ borderColor: 'rgb(128, 0, 128)' }}
        onChange={handleChange}
        onChangeComplete={handleChangeComplete}
      />
    );

    const input = container.querySelector('input[type="range"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Expected rustic slider input');
    }

    expect(input.value).toBe('40');
    expect(input).toBeDisabled();
    expect(container.firstElementChild).toHaveClass('rottay-slider--disabled');

    fireEvent.change(input, { target: { value: '70' } });
    expect(handleChange).toHaveBeenCalledWith(70);

    fireEvent.touchEnd(input);
    expect(handleChangeComplete).toHaveBeenCalledWith(40);

    const track = container.querySelector('.rottay-slider__track');
    const handle = container.querySelector('.rottay-slider__handle');
    expect(track).toHaveStyle({ backgroundColor: 'rgb(255, 165, 0)' });
    expect(handle).toHaveStyle({ borderColor: 'rgb(128, 0, 128)' });
  });
});

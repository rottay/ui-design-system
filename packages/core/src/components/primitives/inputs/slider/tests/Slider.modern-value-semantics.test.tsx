import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernSlider from '../engines/modern';

/**
 * Announced-value integrity for the modern Slider.
 *
 * A `tooltip.formatter` rewrites the readout the user SEES ("$40", "Large"),
 * but the native range input keeps announcing the raw number, so AT and the
 * visible bubble disagreed. A two-thumb slider additionally dropped the
 * caller's `aria-label` entirely, leaving both thumbs named only
 * "Minimum value"/"Maximum value" with no trace of what was being ranged.
 */
describe('Slider modern value semantics', () => {
  it('mirrors a string formatter into aria-valuetext (single)', () => {
    render(
      <ModernSlider
        min={0}
        max={100}
        defaultValue={40}
        tooltip={{ formatter: (value) => `$${value}` }}
      />
    );

    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuetext', '$40');
  });

  it('mirrors the formatter per thumb in range mode', () => {
    render(
      <ModernSlider
        range
        min={0}
        max={100}
        defaultValue={[20, 80]}
        tooltip={{ formatter: (value) => `${value} kg` }}
      />
    );

    const thumbs = screen.getAllByRole('slider');
    expect(thumbs[0]).toHaveAttribute('aria-valuetext', '20 kg');
    expect(thumbs[1]).toHaveAttribute('aria-valuetext', '80 kg');
  });

  it('leaves aria-valuetext off when there is no textual readout to mirror', () => {
    const { rerender } = render(<ModernSlider min={0} max={100} defaultValue={40} />);
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-valuetext');

    // A ReactNode readout is never stringified into something never displayed.
    rerender(
      <ModernSlider
        min={0}
        max={100}
        defaultValue={40}
        tooltip={{ formatter: (value) => <strong>{value}</strong> }}
      />
    );
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-valuetext');

    // `tooltip.open === false` suppresses the readout entirely, so there is
    // nothing for AT to mirror either.
    rerender(
      <ModernSlider
        min={0}
        max={100}
        defaultValue={40}
        tooltip={{ open: false, formatter: (value) => `$${value}` }}
      />
    );
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-valuetext');
  });

  it('names the two-thumb group with the caller aria-label, keeping per-thumb names', () => {
    const { container } = render(
      <ModernSlider range min={0} max={100} defaultValue={[20, 80]} aria-label="Price range" />
    );

    const group = screen.getByRole('group', { name: 'Price range' });
    expect(group).toBe(container.querySelector('[data-part="root"]'));

    const thumbs = screen.getAllByRole('slider');
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Minimum value');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Maximum value');
  });

  it('does not invent a group when the caller supplies no name', () => {
    const { container } = render(<ModernSlider range min={0} max={100} defaultValue={[20, 80]} />);
    expect(container.querySelector('[data-part="root"]')).not.toHaveAttribute('role');
    expect(screen.queryByRole('group')).toBeNull();
  });
});


describe('Slider modern public binding props', () => {
  it('forwards the single input id and caller ARIA without changing its value', () => {
    render(
      <>
        <span id="volume-label">Volume</span><span id="volume-help">Choose a level.</span>
        <ModernSlider id="volume" aria-label="Fallback" aria-labelledby="volume-label"
          aria-describedby="volume-help" aria-invalid="spelling" defaultValue={40} />
      </>
    );
    const input = screen.getByRole('slider', { name: 'Volume' });
    expect(input).toHaveAttribute('id', 'volume');
    expect(input).toHaveAttribute('aria-label', 'Fallback');
    expect(input).toHaveAccessibleDescription('Choose a level.');
    expect(input).toHaveAttribute('aria-invalid', 'spelling');
    expect(input).toHaveValue('40');
  });

  it('forwards range descriptions and invalid state while keeping thumb names and formatter values', () => {
    render(
      <>
        <span id="weight-label">Weight</span><span id="weight-help">Allowed interval.</span>
        <ModernSlider range id="weight" aria-labelledby="weight-label" aria-describedby="weight-help"
          aria-invalid defaultValue={[20, 80]} tooltip={{ formatter: (value) => `${value} kg` }} />
      </>
    );
    const group = screen.getByRole('group', { name: 'Weight' });
    expect(group).toHaveAttribute('id', 'weight');
    expect(group).toHaveAccessibleDescription('Allowed interval.');
    const minimum = screen.getByRole('slider', { name: 'Minimum value' });
    const maximum = screen.getByRole('slider', { name: 'Maximum value' });
    expect(minimum).toHaveAttribute('id', 'weight-start');
    expect(maximum).toHaveAttribute('id', 'weight-end');
    expect(minimum).toHaveAttribute('aria-valuetext', '20 kg');
    expect(maximum).toHaveAttribute('aria-valuetext', '80 kg');
    const thumbs = [minimum, maximum];
    for (const thumb of thumbs) {
      expect(thumb).toHaveAccessibleDescription('Allowed interval.');
      expect(thumb).toHaveAttribute('aria-invalid', 'true');
    }
  });
});

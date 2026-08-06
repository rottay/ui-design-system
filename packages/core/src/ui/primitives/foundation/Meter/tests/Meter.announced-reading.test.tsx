import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Meter } from '..';

describe('Meter announced reading parity', () => {
  it('announces the custom string reading the bar actually shows', () => {
    render(<Meter value={40} label="Storage" formatValue={() => '~40'} />);

    const meter = screen.getByRole('meter', { name: 'Storage' });
    expect(meter.getAttribute('aria-valuetext')).toBe('~40');
    expect(meter.getAttribute('aria-valuenow')).toBe('40');
  });

  it('keeps the threshold suffix on the custom reading', () => {
    render(
      <Meter
        value={95}
        label="Storage"
        low={60}
        high={85}
        optimum={100}
        formatValue={() => '~95'}
      />
    );

    const meter = screen.getByRole('meter', { name: 'Storage' });
    expect(meter.getAttribute('aria-valuetext')).toMatch(/^~95, .+/);
  });

  it('falls back to the formatted number when formatValue returns a node', () => {
    render(<Meter value={40} label="Storage" formatValue={() => <em>40</em>} />);

    const meter = screen.getByRole('meter', { name: 'Storage' });
    expect(meter.getAttribute('aria-valuetext')).toBe('40');
    expect(meter.getAttribute('aria-valuenow')).toBe('40');
  });

  it('falls back to the formatted number when formatValue returns an empty string', () => {
    render(<Meter value={40} label="Storage" formatValue={() => ''} />);

    const meter = screen.getByRole('meter', { name: 'Storage' });
    expect(meter.getAttribute('aria-valuetext')).toBe('40');
  });

  it('announces a numeric formatValue return', () => {
    render(<Meter value={40} label="Storage" formatValue={() => 41} />);

    const meter = screen.getByRole('meter', { name: 'Storage' });
    expect(meter.getAttribute('aria-valuetext')).toBe('41');
    expect(meter.getAttribute('aria-valuenow')).toBe('40');
  });
});

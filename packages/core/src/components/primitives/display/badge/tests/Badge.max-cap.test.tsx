import React from 'react';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import type { BadgeProps } from '../contracts';
import ClassicBadge from '../engines/classic';
import ModernBadge from '../engines/modern';
import RusticBadge from '../engines/rustic';

const ENGINES = [
  ['modern', ModernBadge],
  ['classic', ClassicBadge],
  ['rustic', RusticBadge],
] as const;

afterEach(cleanup);

describe('Badge count cap', () => {
  it('declares `max` as the only cap prop', () => {
    expectTypeOf<BadgeProps>().toHaveProperty('max');
    expectTypeOf<BadgeProps>().not.toHaveProperty('overflowCount');
  });

  it.each(ENGINES)('%s caps the count at a stated `max`', (_name, Engine) => {
    const { container } = render(<Engine count={25} max={10} />);
    expect(container.textContent).toContain('10');
    expect(container.textContent).not.toContain('25');
  });

  it.each(ENGINES)('%s caps the count at 99 when `max` is not stated', (_name, Engine) => {
    const { container } = render(<Engine count={250} />);
    expect(container.textContent).toContain('99');
    expect(container.textContent).not.toContain('250');
  });

  it.each([ENGINES[0], ENGINES[2]])('%s marks a capped count with a plus sign', (_name, Engine) => {
    const { container } = render(<Engine count={25} max={10} />);
    expect(container.textContent).toContain('10+');
  });

  it.each(ENGINES)('%s shows a count at or under the cap as written', (_name, Engine) => {
    const { container } = render(<Engine count={10} max={10} />);
    expect(container.textContent).toContain('10');
    expect(container.textContent).not.toContain('10+');
  });
});

import React from 'react';
import { cleanup } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithEngine } from '@tests/support/engine';

import ClassicBadge from '../engines/classic';
import ModernBadge from '../engines/modern';
import RusticBadge from '../engines/rustic';

/**
 * The component half of the codemod fixture `prop-renamed/badge-variant-secondary`: the fixture states
 * what the kit does with a value map, this states that the map is the truth on the three real engines.
 * If a tone ever reproduces `variant="secondary"`, the `parity-failed` verdict that fixture backs is over.
 */
const ENGINES = { modern: ModernBadge, classic: ClassicBadge, rustic: RusticBadge } as const;
const VALUE_MAP = { default: 'neutral', primary: 'primary', success: 'success', warning: 'warning', error: 'danger', info: 'info' } as const;
const TONES = Object.values(VALUE_MAP);
const SHAPES: ReadonlyArray<Record<string, unknown>> = [
  { children: 'Label' },
  { children: 'Label', badgeStyle: 'solid' },
  { children: 'Label', badgeStyle: 'outline' },
  { count: 5 },
];

function markup(engine: keyof typeof ENGINES, props: Record<string, unknown>): string {
  const Engine = ENGINES[engine] as React.ComponentType<Record<string, unknown>>;
  const view = renderWithEngine(<Engine {...props} />, engine);
  const html = view.container.innerHTML;
  view.unmount();
  cleanup();
  return html;
}

describe.each(Object.keys(ENGINES) as Array<keyof typeof ENGINES>)('Badge variant and tone on %s', (engine) => {
  it.each(Object.entries(VALUE_MAP))('variant="%s" renders what tone="%s" renders', (variant, tone) => {
    for (const shape of SHAPES) {
      expect(markup(engine, { ...shape, variant })).toBe(markup(engine, { ...shape, tone }));
    }
  });

  it('no tone renders what variant="secondary" renders', () => {
    for (const shape of SHAPES) {
      const secondary = markup(engine, { ...shape, variant: 'secondary' });
      expect(TONES.filter((tone) => markup(engine, { ...shape, tone }) === secondary)).toEqual([]);
    }
  });
});

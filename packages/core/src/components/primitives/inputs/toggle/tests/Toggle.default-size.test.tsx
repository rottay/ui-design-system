import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Toggle } from '..';
import * as inputs from '../..';

type Engine = 'modern' | 'classic' | 'rustic';

async function renderToggle(engine: Engine, size?: 'sm' | 'md') {
  const view = renderWithEngine(<Toggle aria-label="Sync" size={size} />, engine);
  await screen.findByRole('switch');
  return view;
}

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_');
}

describe('Toggle default size', () => {
  it('stamps the same modern data-size with no size as with the md step', async () => {
    const byDefault = await renderToggle('modern');
    expect(byDefault.container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'md');
    const defaultMarkup = stable(byDefault.container.innerHTML);
    byDefault.unmount();

    const explicit = await renderToggle('modern', 'md');
    expect(stable(explicit.container.innerHTML)).toBe(defaultMarkup);
  });

  it.each(['classic', 'rustic'] as const)(
    'renders the md step on %s with no size: same markup as size="md", different from size="sm"',
    async (engine) => {
      const byDefault = await renderToggle(engine);
      const defaultMarkup = stable(byDefault.container.innerHTML);
      expect(byDefault.container.querySelector('.rottay-toggle--md')).not.toBeNull();
      byDefault.unmount();

      const explicit = await renderToggle(engine, 'md');
      expect(stable(explicit.container.innerHTML)).toBe(defaultMarkup);
      explicit.unmount();

      const small = await renderToggle(engine, 'sm');
      expect(stable(small.container.innerHTML)).not.toBe(defaultMarkup);
    },
  );
});

describe('the binary switch family publishes one name', () => {
  it('exports Toggle and no Switch from the inputs barrel', () => {
    expect(Object.keys(inputs)).toContain('Toggle');
    expect(Object.keys(inputs)).not.toContain('Switch');
  });
});

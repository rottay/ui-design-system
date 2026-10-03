import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Switch } from '..';

type Engine = 'modern' | 'classic' | 'rustic';

async function renderSwitch(engine: Engine, size?: 'sm' | 'md') {
  const view = renderWithEngine(<Switch aria-label="Sync" size={size} />, engine);
  await screen.findByRole('switch');
  return view;
}

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_');
}

describe('Switch default size', () => {
  it('stamps the same modern data-size with no size as with the md step', async () => {
    const byDefault = await renderSwitch('modern');
    expect(byDefault.container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'md');
    const defaultMarkup = stable(byDefault.container.innerHTML);
    byDefault.unmount();

    const explicit = await renderSwitch('modern', 'md');
    expect(stable(explicit.container.innerHTML)).toBe(defaultMarkup);
  });

  it.each(['classic', 'rustic'] as const)(
    'renders the md step on %s with no size: same markup as size="md", different from size="sm"',
    async (engine) => {
      const byDefault = await renderSwitch(engine);
      const defaultMarkup = stable(byDefault.container.innerHTML);
      expect(byDefault.container.querySelector('.rottay-toggle--md')).not.toBeNull();
      byDefault.unmount();

      const explicit = await renderSwitch(engine, 'md');
      expect(stable(explicit.container.innerHTML)).toBe(defaultMarkup);
      explicit.unmount();

      const small = await renderSwitch(engine, 'sm');
      expect(stable(small.container.innerHTML)).not.toBe(defaultMarkup);
    },
  );
});

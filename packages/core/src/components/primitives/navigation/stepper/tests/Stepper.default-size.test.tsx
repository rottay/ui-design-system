import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Stepper } from '..';

const ITEMS = [
  { title: 'Account', description: 'Create it' },
  { title: 'Profile' },
  { title: 'Done' },
];

type Engine = 'classic' | 'modern' | 'rustic';

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_').replace(/:r\w+:/g, ':r:');
}

async function stepper(engine: Engine, size?: 'sm' | 'md') {
  const view = renderWithEngine(<Stepper items={ITEMS} current={1} size={size} />, engine);
  await screen.findByText('Profile');
  const markup = stable(view.container.innerHTML);
  view.unmount();
  return markup;
}

describe('Stepper renders the md step with no size', () => {
  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders no size on %s exactly as md, and sm differs from it',
    async (engine) => {
      const small = await stepper(engine, 'sm');
      const medium = await stepper(engine, 'md');
      expect(await stepper(engine)).toBe(medium);
      expect(small).not.toBe(medium);
    },
  );

  it('stamps the Modern data-size of the step', async () => {
    const view = renderWithEngine(<Stepper items={ITEMS} current={1} />, 'modern');
    await screen.findByText('Profile');
    expect(view.container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'md');
    view.unmount();
  });
});

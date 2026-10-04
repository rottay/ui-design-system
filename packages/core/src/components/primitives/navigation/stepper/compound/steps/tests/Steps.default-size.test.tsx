import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Stepper } from '../../..';
import { Steps } from '..';

const ITEMS = [
  { title: 'Account', description: 'Create it' },
  { title: 'Profile' },
  { title: 'Done' },
];

type Engine = 'classic' | 'modern' | 'rustic';

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_').replace(/:r\w+:/g, ':r:');
}

async function settle(view: ReturnType<typeof renderWithEngine>) {
  await screen.findByText('Profile');
  const markup = stable(view.container.innerHTML);
  view.unmount();
  return markup;
}

function steps(engine: Engine, size?: 'sm' | 'md') {
  return settle(renderWithEngine(<Steps items={ITEMS} current={1} size={size} />, engine));
}

function stepper(engine: Engine, size: 'sm' | 'md') {
  return settle(renderWithEngine(<Stepper items={ITEMS} current={1} size={size} clickable={false} />, engine));
}

describe('Steps passes its size step to Stepper unchanged', () => {
  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders sm and md on %s exactly as Stepper renders them, and they differ',
    async (engine) => {
      const small = await steps(engine, 'sm');
      const medium = await steps(engine, 'md');
      expect(small).toBe(await stepper(engine, 'sm'));
      expect(medium).toBe(await stepper(engine, 'md'));
      expect(small).not.toBe(medium);
    },
  );

  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders the md step on %s with no size',
    async (engine) => {
      expect(await steps(engine)).toBe(await stepper(engine, 'md'));
    },
  );

  it('stamps the Modern data-size of the step', async () => {
    const view = renderWithEngine(<Steps items={ITEMS} current={1} />, 'modern');
    await screen.findByText('Profile');
    expect(view.container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'md');
    view.unmount();
  });
});

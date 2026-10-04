import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { List } from '..';
import { LIST_DEFAULTS } from '../contracts';
import type { ListEngineSize, ListSize } from '../contracts';
import { List as ClassicList } from '../engines/classic';
import { List as ModernList } from '../engines/modern';
import { List as RusticList } from '../engines/rustic';

const ENGINES = {
  classic: ClassicList,
  modern: ModernList,
  rustic: RusticList,
} as const;

type Engine = keyof typeof ENGINES;

const STEPS: ReadonlyArray<readonly [ListSize, ListEngineSize]> = [
  ['sm', 'small'],
  ['md', 'default'],
  ['lg', 'large'],
];

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_').replace(/:r\w+:/g, ':r:');
}

async function settle(view: ReturnType<typeof renderWithEngine>) {
  await screen.findByText('Second entry');
  const markup = stable(view.container.innerHTML);
  view.unmount();
  return markup;
}

function throughFacade(engine: Engine, size?: ListSize) {
  return settle(
    renderWithEngine(
      <List bordered header="Entries" size={size}>
        <List.Item>First entry</List.Item>
        <List.Item>Second entry</List.Item>
      </List>,
      engine,
    ),
  );
}

function throughEngine(engine: Engine, size?: ListEngineSize) {
  const EngineList = ENGINES[engine];
  return settle(
    renderWithEngine(
      <EngineList bordered header="Entries" size={size}>
        <List.Item>First entry</List.Item>
        <List.Item>Second entry</List.Item>
      </EngineList>,
      engine,
    ),
  );
}

describe('List size steps reach every engine in the spelling it reads', () => {
  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders each step on %s exactly as the engine renders the spelling it replaces, three distinct steps',
    async (engine) => {
      const rendered = new Set<string>();
      for (const [step, spelling] of STEPS) {
        const facade = await throughFacade(engine, step);
        expect(facade, `${engine} ${step}`).toBe(await throughEngine(engine, spelling));
        rendered.add(facade);
      }
      expect(rendered.size).toBe(3);
    },
  );

  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders the md step on %s with no size: same markup as the engine default and as size="md"',
    async (engine) => {
      const byDefault = await throughFacade(engine);
      expect(LIST_DEFAULTS.size).toBe('default');
      expect(byDefault).toBe(await throughEngine(engine));
      expect(byDefault).toBe(await throughEngine(engine, 'default'));
      expect(byDefault).toBe(await throughFacade(engine, 'md'));
      expect(byDefault).not.toBe(await throughFacade(engine, 'sm'));
    },
  );

  it('stamps the three spellings the Modern skin selects on', async () => {
    for (const [step, spelling] of STEPS) {
      const view = renderWithEngine(
        <List size={step}>
          <List.Item>Second entry</List.Item>
        </List>,
        'modern',
      );
      await screen.findByText('Second entry');
      expect(view.container.querySelector('[data-part="root"]'), step).toHaveAttribute('data-size', spelling);
      view.unmount();
    }
  });
});

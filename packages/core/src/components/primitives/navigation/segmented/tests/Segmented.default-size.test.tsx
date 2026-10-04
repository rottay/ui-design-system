import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Segmented } from '..';
import { SEGMENTED_DEFAULTS } from '../contracts';
import type { SegmentedEngineSize, SegmentedSize } from '../contracts';
import ClassicSegmented from '../engines/classic';
import ModernSegmented from '../engines/modern';
import RusticSegmented from '../engines/rustic';

const ENGINES = {
  classic: ClassicSegmented,
  modern: ModernSegmented,
  rustic: RusticSegmented,
} as const;

type Engine = keyof typeof ENGINES;

const STEPS: ReadonlyArray<readonly [SegmentedSize, SegmentedEngineSize]> = [
  ['sm', 'small'],
  ['md', 'middle'],
  ['lg', 'large'],
];

const OPTIONS = ['Daily', 'Weekly', 'Monthly'];

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_').replace(/:r\w+:/g, ':r:');
}

async function settle(view: ReturnType<typeof renderWithEngine>) {
  await screen.findByText('Monthly');
  const markup = stable(view.container.innerHTML);
  view.unmount();
  return markup;
}

function throughFacade(engine: Engine, size?: SegmentedSize) {
  return settle(
    renderWithEngine(<Segmented options={OPTIONS} defaultValue="Weekly" ariaLabel="Period" size={size} />, engine),
  );
}

function throughEngine(engine: Engine, size?: SegmentedEngineSize) {
  const EngineSegmented = ENGINES[engine];
  return settle(
    renderWithEngine(<EngineSegmented options={OPTIONS} defaultValue="Weekly" ariaLabel="Period" size={size} />, engine),
  );
}

describe('Segmented size steps reach every engine in the spelling it reads', () => {
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
      expect(SEGMENTED_DEFAULTS.size).toBe('middle');
      expect(byDefault).toBe(await throughEngine(engine));
      expect(byDefault).toBe(await throughEngine(engine, 'middle'));
      expect(byDefault).toBe(await throughFacade(engine, 'md'));
      expect(byDefault).not.toBe(await throughFacade(engine, 'sm'));
    },
  );

  it('stamps the three spellings the Modern skin selects on', async () => {
    for (const [step, spelling] of STEPS) {
      const view = renderWithEngine(<Segmented options={OPTIONS} ariaLabel="Period" size={step} />, 'modern');
      await screen.findByText('Monthly');
      expect(view.container.querySelector('[role="radiogroup"]'), step).toHaveAttribute('data-size', spelling);
      view.unmount();
    }
  });
});

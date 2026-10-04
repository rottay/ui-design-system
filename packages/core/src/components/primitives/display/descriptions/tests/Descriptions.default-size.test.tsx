import React, { Suspense } from 'react';
import { prerender } from 'react-dom/static';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { Descriptions } from '..';
import { DESCRIPTIONS_DEFAULTS } from '../contracts';
import type { DescriptionsEngineSize, DescriptionsSize } from '../contracts';
import { Descriptions as ClassicDescriptions } from '../engines/classic';
import { Descriptions as ModernDescriptions } from '../engines/modern';
import { Descriptions as RusticDescriptions } from '../engines/rustic';

const ENGINES = {
  classic: ClassicDescriptions,
  modern: ModernDescriptions,
  rustic: RusticDescriptions,
} as const;

type Engine = keyof typeof ENGINES;

const STEPS: ReadonlyArray<readonly [DescriptionsSize, DescriptionsEngineSize]> = [
  ['sm', 'small'],
  ['md', 'middle'],
  ['lg', 'default'],
];

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_').replace(/:r\w+:/g, ':r:');
}

async function settle(view: ReturnType<typeof renderWithEngine>) {
  await screen.findByText('Ada Lovelace');
  const markup = stable(view.container.innerHTML);
  view.unmount();
  return markup;
}

function throughFacade(engine: Engine, size?: DescriptionsSize) {
  return settle(
    renderWithEngine(
      <Descriptions title="Account" bordered size={size}>
        <Descriptions.Item label="Name">Ada Lovelace</Descriptions.Item>
        <Descriptions.Item label="Plan">Team</Descriptions.Item>
      </Descriptions>,
      engine,
    ),
  );
}

function throughEngine(engine: Engine, size?: DescriptionsEngineSize) {
  const EngineDescriptions = ENGINES[engine];
  return settle(
    renderWithEngine(
      <EngineDescriptions title="Account" bordered size={size}>
        <Descriptions.Item label="Name">Ada Lovelace</Descriptions.Item>
        <Descriptions.Item label="Plan">Team</Descriptions.Item>
      </EngineDescriptions>,
      engine,
    ),
  );
}

/**
 * The Rustic engine paints its size as an inline `font-size: var(...)`, which the
 * test DOM drops. The static renderer keeps it, so Rustic is compared there.
 */
async function rusticStatic(node: React.ReactElement) {
  const { prelude } = await prerender(
    <EngineProvider defaultEngine="rustic">
      <Suspense fallback={null}>{node}</Suspense>
    </EngineProvider>,
  );
  const reader = prelude.getReader();
  const decoder = new TextDecoder();
  let markup = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    markup += decoder.decode(value, { stream: true });
  }
  return stable(markup.replace(/<!--.*?-->/g, ''));
}

/** The size the root paints at rest: the fallback of the first inline `font-size` read, which is the root's. */
function rootRestingFontSize(markup: string | undefined) {
  return markup?.match(/^<[^>]*\bfont-size:var\(--[\w-]+,\s*([^)]+)\)/)?.[1];
}

const ROWS = (
  <>
    <Descriptions.Item label="Name">Ada Lovelace</Descriptions.Item>
    <Descriptions.Item label="Plan">Team</Descriptions.Item>
  </>
);

describe('Descriptions size steps reach every engine in the spelling it reads', () => {
  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders each step on %s exactly as the engine renders the spelling it replaces',
    async (engine) => {
      for (const [step, spelling] of STEPS) {
        expect(await throughFacade(engine, step), `${engine} ${step}`).toBe(await throughEngine(engine, spelling));
      }
    },
  );

  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders the lg step on %s with no size: same markup as the engine default and as size="lg"',
    async (engine) => {
      const byDefault = await throughFacade(engine);
      expect(DESCRIPTIONS_DEFAULTS.size).toBe('default');
      expect(byDefault).toBe(await throughEngine(engine));
      expect(byDefault).toBe(await throughEngine(engine, 'default'));
      expect(byDefault).toBe(await throughFacade(engine, 'lg'));
    },
  );

  it('stamps the three spellings the Modern skin selects on', async () => {
    for (const [step, spelling] of STEPS) {
      const view = renderWithEngine(
        <Descriptions size={step}>
          <Descriptions.Item label="Name">Ada Lovelace</Descriptions.Item>
        </Descriptions>,
        'modern',
      );
      await screen.findByText('Ada Lovelace');
      expect(view.container.querySelector('[data-part="root"]'), step).toHaveAttribute('data-size', spelling);
      view.unmount();
    }
  });

  it('keeps three distinct steps on Classic and Modern', async () => {
    for (const engine of ['classic', 'modern'] as const) {
      const rendered = new Set([
        await throughFacade(engine, 'sm'),
        await throughFacade(engine, 'md'),
        await throughFacade(engine, 'lg'),
      ]);
      expect(rendered.size, engine).toBe(3);
    }
  });

  it('renders each step on the static Rustic markup exactly as the engine renders the spelling it replaces', async () => {
    const painted = new Map<DescriptionsSize, string>();
    for (const [step, spelling] of STEPS) {
      const facade = await rusticStatic(<Descriptions title="Account" size={step}>{ROWS}</Descriptions>);
      expect(facade, step).toBe(await rusticStatic(<RusticDescriptions title="Account" size={spelling}>{ROWS}</RusticDescriptions>));
      painted.set(step, facade);
    }
    const byDefault = await rusticStatic(<Descriptions title="Account">{ROWS}</Descriptions>);
    expect(byDefault).toBe(await rusticStatic(<RusticDescriptions title="Account">{ROWS}</RusticDescriptions>));
    expect(byDefault).toBe(painted.get('lg'));
    expect(rootRestingFontSize(painted.get('sm'))).toBe('12px');
    expect(rootRestingFontSize(painted.get('lg'))).toBe('14px');
    expect(painted.get('md')).toBe(painted.get('lg'));
    expect(painted.get('sm')).not.toBe(painted.get('lg'));
  });
});

import React, { Suspense } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { prerender } from 'react-dom/static';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { Space } from '..';
import { SPACE_DEFAULTS, SPACE_SIZE_MAP } from '../contracts';
import type { SpaceSize } from '../contracts';
import ClassicSpace from '../engines/classic';
import ModernSpace from '../engines/modern';
import RusticSpace from '../engines/rustic';

// @ts-expect-error the package root publishes no `LegacySpaceSize`
import type { LegacySpaceSize as RetiredSpaceSize } from '@/index';

type AntSpelling = keyof typeof SPACE_SIZE_MAP;

const STEPS: ReadonlyArray<readonly [SpaceSize, AntSpelling]> = [
  ['sm', 'small'],
  ['md', 'middle'],
  ['lg', 'large'],
];

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/space/index.css'),
  'utf8',
);

function stable(markup: string) {
  return markup.replace(/_r_\w+_/g, '_r_').replace(/:r\w+:/g, ':r:');
}

async function settle(view: ReturnType<typeof renderWithEngine>) {
  await screen.findByText('Second');
  const markup = stable(view.container.innerHTML);
  view.unmount();
  return markup;
}

const ITEMS = (
  <>
    <span>First</span>
    <span>Second</span>
  </>
);

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

describe('Space takes the canonical steps and renders them as the spellings they replace', () => {
  it('renders each step on Classic exactly as the engine rendered the Ant Design spelling, three distinct steps', async () => {
    const rendered = new Set<string>();
    for (const [step, spelling] of STEPS) {
      const facade = await settle(renderWithEngine(<Space size={step}>{ITEMS}</Space>, 'classic'));
      const engine = await settle(renderWithEngine(<ClassicSpace size={spelling}>{ITEMS}</ClassicSpace>, 'classic'));
      expect(facade, step).toBe(engine);
      rendered.add(facade);
    }
    expect(rendered.size).toBe(3);
  });

  it('renders the sm step on Classic with no size', async () => {
    const byDefault = await settle(renderWithEngine(<Space>{ITEMS}</Space>, 'classic'));
    expect(SPACE_DEFAULTS.size).toBe('small');
    expect(byDefault).toBe(await settle(renderWithEngine(<Space size="sm">{ITEMS}</Space>, 'classic')));
    expect(byDefault).not.toBe(await settle(renderWithEngine(<Space size="md">{ITEMS}</Space>, 'classic')));
  });

  it('stamps the step on Modern, where the skin gives both spellings of a step one rule', async () => {
    for (const [step, spelling] of STEPS) {
      const facade = await settle(renderWithEngine(<Space size={step}>{ITEMS}</Space>, 'modern'));
      const engine = await settle(renderWithEngine(<ModernSpace size={spelling}>{ITEMS}</ModernSpace>, 'modern'));
      expect(facade).toContain(`data-size="${step}"`);
      expect(engine).toContain(`data-size="${spelling}"`);
      expect(facade.replace(`data-size="${step}"`, `data-size="${spelling}"`), step).toBe(engine);
      expect(SKIN).toContain(
        `.ds-space.ds-space--modern[data-part='root'][data-size='${spelling}'],\n` +
          `.ds-space.ds-space--modern[data-part='root'][data-size='${step}'] {`,
      );
    }
  });

  it('keeps the Modern default stamp: no size still stamps the rung the sm step shares its rule with', async () => {
    const byDefault = await settle(renderWithEngine(<Space>{ITEMS}</Space>, 'modern'));
    expect(byDefault).toBe(await settle(renderWithEngine(<ModernSpace size="small">{ITEMS}</ModernSpace>, 'modern')));
    expect(byDefault).toContain('data-size="small"');
  });

  it('renders each step on the static Rustic markup exactly as the engine rendered the Ant Design spelling', async () => {
    const painted = new Map<SpaceSize, string>();
    for (const [step, spelling] of STEPS) {
      const facade = await rusticStatic(<Space size={step}>{ITEMS}</Space>);
      expect(facade, step).toBe(await rusticStatic(<RusticSpace size={spelling}>{ITEMS}</RusticSpace>));
      expect(facade, step).toContain(SPACE_SIZE_MAP[spelling]);
      painted.set(step, facade);
    }
    expect(new Set(painted.values()).size).toBe(3);
    expect(await rusticStatic(<Space>{ITEMS}</Space>)).toBe(painted.get('sm'));
  });
});

describe('the engine spelling is not a public size', () => {
  it('refuses the Ant Design spelling on the public component and keeps it as the key of the engine table', () => {
    // @ts-expect-error `size` takes `sm | md | lg`, a number or a tuple
    const refused = <Space size="middle">{ITEMS}</Space>;
    expect(refused.props.size).toBe('middle');
    expect(Object.keys(SPACE_SIZE_MAP)).toEqual(['small', 'middle', 'large']);
  });
});

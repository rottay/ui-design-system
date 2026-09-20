/**
 * The disabled stamp behind the slider's muting rules.
 *
 * The skin mutes rail/track/handle/dot with
 * `opacity: var(--ds-state-disabled-opacity, 0.5)`, but every one of those
 * rules was headed by `[data-disabled='true']` alone — the component's own prop
 * echo, not the anatomy kernel's token. The head now pairs the two, and the
 * root stamps `data-state~='disabled'` beside the prop echo it already wrote,
 * so the governed disabled decision reaches the parts it always painted.
 * Neither attribute is removed, so the paint is unchanged in both arms.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';
import { renderWithEngine } from '@tests/support/engine';

import { Slider } from '..';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/slider/index.css'),
  'utf8',
);

const HEAD = ".ds-slider.ds-slider--modern[data-part='root']:is([data-state~='disabled'], [data-disabled='true'])";

afterEach(cleanup);

describe('Slider disabled stamp', () => {
  it.each(['rail', 'track', 'handle', 'dot', 'tooltip'])(
    'heads the %s disabled rule with the kernel token beside the prop echo',
    (part) => {
      expect(skin).toContain(`${HEAD} [data-part='${part}']`);
    },
  );

  it('leaves no disabled rule headed by the prop echo alone', () => {
    expect(skin).not.toMatch(/ds-slider--modern\[data-disabled='true'\]/u);
  });

  it('keeps the muting value on the governed channel with the literal floor', () => {
    expect(skin).toContain('opacity: var(--ds-state-disabled-opacity, 0.5);');
  });

  it.each([false, true])('stamps both attributes together (range=%s)', async (range) => {
    const { container } = renderWithEngine(
      range ? <Slider range value={[20, 60]} disabled /> : <Slider value={40} disabled />,
      'modern',
    );
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('data-disabled')).toBe('true');
    expect(root.getAttribute('data-state')?.split(' ')).toContain('disabled');
  });

  it.each([false, true])('carries no data-state when enabled (range=%s)', async (range) => {
    const { container } = renderWithEngine(
      range ? <Slider range value={[20, 60]} /> : <Slider value={40} />,
      'modern',
    );
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('data-disabled')).toBe('false');
    expect(root.hasAttribute('data-state')).toBe(false);
  });
});

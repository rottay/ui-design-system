import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { ROOT_ALIASES } from '@/infrastructure/compilers/runtime/theme/runtime/emission/css/root-aliases';

import ModernCard from '../engines/modern';

const CSS_ROOT = join(__dirname, '../../../../../foundation/tokens/css');
const read = (path: string) => readFileSync(join(CSS_ROOT, path), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

const channels = read('presentation/components/card/index.css');
const skin = read('runtime/engines/modern/skin/card/index.css');

const CHANNEL = '--ds-card-disabled-opacity';
const DIAL = '--ds-state-disabled-opacity';
const DIMMED = ".ds-card.ds-card--modern[data-part='root'][data-state~='disabled']";

function rules(css: string): Array<{ selector: string; body: string }> {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] as string).trim(),
    body: (match[2] as string).trim(),
  }));
}

const root = (container: HTMLElement) => container.querySelector("[data-part='root']") as HTMLElement;

describe('Card: disabled dimming follows the states dial', () => {
  it('the channel is declared once, at the root, as the dial itself', () => {
    const declaring = rules(channels).filter(({ body }) => new RegExp(`(^|[;\\s])${CHANNEL}\\s*:`).test(body));
    expect(declaring.map(({ selector }) => selector)).toEqual([':root']);
    const values = [...channels.matchAll(new RegExp(`${CHANNEL}\\s*:\\s*([^;]+);`, 'g'))].map((match) =>
      (match[1] as string).trim(),
    );
    expect(values).toEqual([`var(${DIAL})`]);
  });

  it('is tabled as a root alias of the dial, so every scope that states the dial restates it', () => {
    expect(new Map(ROOT_ALIASES).get('--ds-card-disabled-opacity')).toBe('var(--ds-state-disabled-opacity)');
  });

  it('the skin never restates the channel, so a tenant-authored value reaches the paint', () => {
    expect(rules(skin).filter(({ body }) => new RegExp(`(^|[;\\s])${CHANNEL}\\s*:`).test(body))).toEqual([]);
  });

  it('the skin dims the unavailable card through that channel and nowhere else', () => {
    const readers = rules(skin).filter(({ body }) => body.includes(`var(${CHANNEL}`));
    expect(readers.map(({ selector }) => selector)).toEqual([DIMMED]);
    expect(readers[0]?.body).toContain(`opacity: var(${CHANNEL}, var(${DIAL}));`);
  });

  it('a disabled Card stamps the anatomy the dimming rule selects, actionable or not', () => {
    const { container, rerender } = render(<ModernCard disabled>Body</ModernCard>);
    expect(root(container).matches(DIMMED)).toBe(true);
    rerender(
      <ModernCard disabled onClick={vi.fn()}>
        Body
      </ModernCard>,
    );
    expect(root(container).matches(DIMMED)).toBe(true);
  });

  it('a loading Card is unavailable and dims through the same rule', () => {
    const { container } = render(<ModernCard loading>Body</ModernCard>);
    expect(root(container).matches(DIMMED)).toBe(true);
  });

  it('an available Card is not selected by the dimming rule', () => {
    const { container } = render(<ModernCard onClick={vi.fn()}>Body</ModernCard>);
    expect(root(container).matches(DIMMED)).toBe(false);
  });
});

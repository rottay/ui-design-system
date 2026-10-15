import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { screen } from '@testing-library/react';

import { DataTerminalCard, DataTerminalStat } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/data-terminal-card/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface Rule {
  selector: string;
  declarations: string[];
}

function rulesOf(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    declarations: match[2]
      .split(';')
      .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
  }));
}

function forcedColorsBlock(css: string): string {
  const start = css.indexOf('@media (forced-colors: active)');
  if (start === -1) return '';
  let depth = 0;
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  return css.slice(start);
}

const paintsSolidOutline = (rule: Rule) =>
  rule.declarations.some(
    (declaration) => /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const FORCED = forcedColorsBlock(SKIN);
const AUTHORED = rulesOf(SKIN.replace(FORCED, ''));
const focusRules = (rules: Rule[]) => rules.filter((rule) => rule.selector.includes('focus-visible'));

const FOCUS = '.ds-data-terminal-card__link:focus-visible';

const StubIcon = (props: Record<string, unknown>) => <svg {...props} />;

describe('DataTerminalCard — the full-body link wears the tenant focus signature', () => {
  it('carries the signature on an overlay above the card, never a solid outline', () => {
    expect(focusRules(AUTHORED).filter(paintsSolidOutline)).toEqual([]);
    expect(SKIN).not.toContain('--ds-focus-ring-color');
    expect(focusRules(AUTHORED)).toEqual([
      {
        selector: FOCUS,
        declarations: [
          'position: relative',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      },
      {
        selector: `${FOCUS}::after`,
        declarations: [
          'position: absolute',
          'inset: 0',
          'z-index: var(--ds-z-index-relative-above, 1)',
          "content: ''",
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      },
    ]);
  });

  it('keeps a system-colour outline in forced colors', () => {
    expect(focusRules(rulesOf(FORCED))).toEqual([
      {
        selector: FOCUS,
        declarations: [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      },
      { selector: `${FOCUS}::after`, declarations: ['box-shadow: none'] },
    ]);
  });

  it.each([1, 2, 3, 4] as const)('wraps variant %i in the one link the overlay is hosted on', async (variant) => {
    const { container } = renderSurface(
      <DataTerminalCard
        variant={variant}
        label="Active pipelines"
        value={128450}
        icon={StubIcon}
        path="/dashboard"
      />,
      { engine: 'modern' },
    );
    await screen.findByText('128,450');

    const links = container.querySelectorAll<HTMLAnchorElement>('a.ds-data-terminal-card__link');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/dashboard');
    expect(links[0].querySelector('.ds-data-terminal-card[data-part="root"]')).not.toBeNull();
  });
});

// F-1 RTL (owner ruling 2026-10-14): the engine default stays the physical `left`, so every label and figure
// that follows the reading start passes align="start". jsdom loads no skin and getComputedStyle is patched in
// this lane, so the pair reads the stamped logical value and its utility class under each direction; that
// `text-align: start` lands on the right edge under dir=rtl is CSS's own rule, not ours to re-prove.
const START_HOOKS = [
  'ds-data-terminal-card__stat-item-label',
  'ds-data-terminal-card__value',
  'ds-data-terminal-card__change-value',
  'ds-data-terminal-card__target-value',
  'ds-data-terminal-card__tracking-label',
  'ds-data-terminal-card__header-label',
  'ds-data-terminal-card__completion-value',
  'ds-data-terminal-card__metric-label',
  'ds-data-terminal-card__stat-label',
];

function renderEveryVariant(dir: 'ltr' | 'rtl') {
  return renderSurface(
    <div dir={dir}>
      {([1, 2, 3, 4] as const).map((variant) => (
        <DataTerminalCard
          key={variant}
          variant={variant}
          label="Active pipelines"
          value={128450}
          change="+12%"
          progress={64}
          subtitle="This week"
          icon={StubIcon}
          path="/dashboard"
        />
      ))}
      <DataTerminalStat label="Open roles" value={42} change="+3" icon={StubIcon} progress={64} />
    </div>,
    { engine: 'modern' },
  );
}

describe('F-1 RTL semantic alignment', () => {
  it.each(['ltr', 'rtl'] as const)('stamps the logical start on every reading-order label and figure under dir=%s', async (dir) => {
    const { container } = renderEveryVariant(dir);
    await screen.findAllByText('128,450');

    for (const hook of START_HOOKS) {
      const nodes = container.querySelectorAll(`.${hook}`);
      expect(nodes.length, hook).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(node.getAttribute('data-align'), hook).toBe('start');
        expect(node.classList.contains('text-start'), hook).toBe(true);
        // the regression: the physical default would pin these to the left edge in RTL
        expect(node.classList.contains('text-left'), hook).toBe(false);
        expect(node.closest('[dir]')?.getAttribute('dir')).toBe(dir);
      }
    }
  });

  // Not an RTL repair: E8-b took this label's LTR centring (HEAD painted text-align:center, 20/20 instances).
  // It is centred in its action chip under both directions; center has no direction to follow.
  it.each(['ltr', 'rtl'] as const)('keeps the quick-action label centred under dir=%s', async (dir) => {
    const { container } = renderEveryVariant(dir);
    await screen.findAllByText('128,450');

    const labels = container.querySelectorAll('.ds-data-terminal-card__quick-action-label');
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.getAttribute('data-align')).toBe('center');
      expect(label.classList.contains('text-center')).toBe(true);
      expect(label.classList.contains('text-left')).toBe(false);
    }
  });
});

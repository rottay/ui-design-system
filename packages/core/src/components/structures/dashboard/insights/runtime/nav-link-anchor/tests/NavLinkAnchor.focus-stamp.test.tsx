/**
 * The focus stamp behind the four activity strips' view-all ring.
 *
 * Each strip's skin carries the tenant focus signature (`--ds-focus-ring`) on
 * an overlay of the anchor under `:is([data-state~='focus-visible'],
 * :focus-visible)`. The pseudo-class arm is the platform's fallback; the
 * stamped arm is what carries the tenant's focus decision to a probe and to any
 * host Link. A twin with no producer is a dead selector, so this pins the
 * producer — and pins that the anchor is silent at rest.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

import { NavigationLinkProvider } from '@/infrastructure/runtime/adapters/presentation/react/navigation';
import { NavLinkAnchor } from '..';

const SKIN_ROOT = join(
  __dirname,
  '../../../../../../../foundation/tokens/css/presentation/components/skin',
);

const STRIPS = ['activity-cards', 'activity-compact', 'activity-ticker', 'activity-timeline'];

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

afterEach(cleanup);

describe('insights view-all anchor focus stamp', () => {
  it.each(STRIPS)('%s carries the focus signature on the stamped anchor', (strip) => {
    const skin = readFileSync(join(SKIN_ROOT, strip, 'index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const root = `.ds-${strip}.ds-${strip}`;
    const focus = `${root} .view-all-anchor:is([data-state~='focus-visible'], :focus-visible)`;
    const forced = forcedColorsBlock(skin);
    const authored = rulesOf(skin.replace(forced, '')).filter((rule) => rule.selector.startsWith(focus));

    expect(authored.filter(paintsSolidOutline)).toEqual([]);
    expect(skin).not.toContain('--ds-focus-ring-color');
    expect(authored).toEqual([
      {
        selector: focus,
        declarations: [
          'position: relative',
          'outline: var(--ds-focus-ring-width) solid transparent',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      },
      {
        selector: `${focus}::after`,
        declarations: [
          'position: absolute',
          'inset: 0',
          "content: ''",
          'border-radius: inherit',
          'box-shadow: var(--ds-focus-ring)',
          'pointer-events: none',
        ],
      },
    ]);
    expect(rulesOf(forced).filter((rule) => rule.selector.startsWith(focus))).toEqual([
      {
        selector: focus,
        declarations: [
          'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
          'outline-offset: var(--ds-focus-ring-offset)',
        ],
      },
      { selector: `${focus}::after`, declarations: ['box-shadow: none'] },
    ]);
    // The bare pseudo-class must not survive as the only arm of the ring rule.
    expect(skin).not.toMatch(/\.view-all-anchor:focus-visible\s*\{/u);
  });

  it('carries no data-state at rest, so resting paint is unchanged', () => {
    const { container } = render(
      <NavLinkAnchor href="/all" className="view-all-anchor">
        all
      </NavLinkAnchor>,
    );
    const anchor = container.querySelector<HTMLElement>('a.view-all-anchor')!;
    expect(anchor.hasAttribute('data-state')).toBe(false);
  });

  it('stamps focus-visible for a keyboard focus and clears it on blur', () => {
    const { container } = render(
      <NavLinkAnchor href="/all" className="view-all-anchor">
        all
      </NavLinkAnchor>,
    );
    const anchor = container.querySelector<HTMLElement>('a.view-all-anchor')!;

    fireEvent.focus(anchor);
    expect(anchor.getAttribute('data-state')?.split(' ')).toContain('focus-visible');

    fireEvent.blur(anchor);
    expect(anchor.hasAttribute('data-state')).toBe(false);
  });

  it('withholds the ring from a pointer-driven focus', () => {
    const { container } = render(
      <NavLinkAnchor href="/all" className="view-all-anchor">
        all
      </NavLinkAnchor>,
    );
    const anchor = container.querySelector<HTMLElement>('a.view-all-anchor')!;

    fireEvent.pointerDown(anchor);
    fireEvent.focus(anchor);
    expect(anchor.getAttribute('data-state')?.split(' ') ?? []).not.toContain('focus-visible');
  });

  it('hands the stamp to an injected host Link, not only to the native anchor', () => {
    const HostLink = ({ href, children, ...rest }: Record<string, unknown> & { href: string; children: React.ReactNode }) => (
      <a data-host="true" href={href} {...rest}>
        {children}
      </a>
    );
    const { container } = render(
      <NavigationLinkProvider Link={HostLink as never}>
        <NavLinkAnchor href="/all" className="view-all-anchor">
          all
        </NavLinkAnchor>
      </NavigationLinkProvider>,
    );
    const anchor = container.querySelector<HTMLElement>('a[data-host="true"]')!;
    fireEvent.focus(anchor);
    expect(anchor.getAttribute('data-state')?.split(' ')).toContain('focus-visible');
  });
});

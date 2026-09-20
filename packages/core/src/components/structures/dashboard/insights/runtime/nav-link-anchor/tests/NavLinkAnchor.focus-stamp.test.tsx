/**
 * The focus stamp behind the four activity strips' view-all ring.
 *
 * Each strip's skin draws that ring from `--ds-focus-ring-width` /
 * `--ds-focus-ring-offset` under `:is([data-state~='focus-visible'],
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

afterEach(cleanup);

describe('insights view-all anchor focus stamp', () => {
  it.each(STRIPS)('%s pairs the skin ring with the stamped state', (strip) => {
    const skin = readFileSync(join(SKIN_ROOT, strip, 'index.css'), 'utf8');
    expect(skin).toContain(
      ".view-all-anchor:is([data-state~='focus-visible'], :focus-visible)",
    );
    expect(skin).toContain('outline: var(--ds-focus-ring-width, 2px) solid');
    expect(skin).toContain('outline-offset: var(--ds-focus-ring-offset, 2px);');
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

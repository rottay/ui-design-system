/**
 * BottomTabBar elevation contract.
 *
 * Guards the CHAIN and the POSTURE, never the pixels.
 *
 * The bar is fixed chrome, so the two things that can be wrong about it are
 * invisible in the file: a published reservation that no longer describes the
 * bar it reserves for, and a mobile family with no responsive posture at all.
 * Both are asserted here because neither is visible to a DOM snapshot.
 *
 * Reachability is asserted against a RENDERED tree, not against the CSS: a
 * selector states what an element must carry to be matched, never that any
 * component emits it. BottomTabBar is not portalled — it renders in place —
 * so the render container is the whole scope and the portal readiness gate
 * does not apply.
 */

import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';

import { BottomTabBar } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import {
  readSkinDeclarations,
  readSkinRules,
  unreachableSelectors,
  winningDecl,
} from '../../../../../tooling/testing/helpers/skin-reachability';

const RULES = readSkinRules('bottom-tab-bar');
const SKIN = readSkinDeclarations('bottom-tab-bar');

beforeAll(async () => {
  await Promise.all([
    import('../engines/modern'),
    import('../../../../primitives/layout/Box/engines/modern'),
    import('../../../../primitives/layout/Flex/engines/modern'),
    import('../../../../primitives/display/Typography/engines/modern'),
  ]);
});

// Every state the skin predicates on: a selected tab, an idle tab, and a
// badge past the 99+ cap so `[data-wide='true']` is reachable.
const ITEMS = [
  { key: 'home', label: 'Home', icon: <span>H</span> },
  { key: 'search', label: 'Search', icon: <span>S</span> },
  { key: 'alerts', label: 'Alerts', icon: <span>A</span>, badge: 120 },
];

describe('BottomTabBar elevation contract', () => {
  it('derives the published reservation from the geometry it reserves for', () => {
    const root = winningDecl(
      RULES,
      '--ds-bottom-tab-bar-reserved-block-end',
      (rule) => rule.selector === ".rottay-bottom-tab-bar[data-part='root']",
    );

    expect(root).toBeDefined();
    const reserved = root!.decls['--ds-bottom-tab-bar-reserved-block-end'];

    // The retired form hand-summed the bar's five block terms into one literal
    // under an "update it if that geometry changes" contract. One of those
    // terms is type-scale-relative, so the literal fell behind the moment a
    // tenant scaled its type and the fixed bar covered page content.
    expect(reserved).toContain('--_ds-bottom-tab-bar-content-block-size');
    expect(reserved).not.toMatch(/\b50px\b/);

    // Every term of the derivation is authored in this file: a formula may
    // only bake a value its own file states.
    const content = root!.decls['--_ds-bottom-tab-bar-content-block-size'];
    for (const term of [
      '--_ds-bottom-tab-bar-tab-lead',
      '--_ds-bottom-tab-bar-pill-block-size',
      '--_ds-bottom-tab-bar-label-gap',
      '--_ds-bottom-tab-bar-label-size',
      '--_ds-bottom-tab-bar-label-leading',
      '--_ds-bottom-tab-bar-tab-trail',
    ]) {
      expect(content).toContain(term);
      expect(root!.decls[term]).toBeDefined();
    }
  });

  it('routes the safe-area inset through the DS channel, never bare env()', () => {
    // `action-dock`, `chat-surface` and `page-shell` all read
    // `--ds-safe-area-bottom`. Read bare, an app moving the DS inset moved
    // every other piece of bottom chrome on the screen and not this bar.
    for (const match of SKIN.matchAll(/env\(safe-area-inset-bottom[^)]*\)/g)) {
      const before = SKIN.slice(Math.max(0, match.index! - 120), match.index!);
      expect(before).toContain('--ds-safe-area-bottom');
    }
    expect(SKIN).toContain('--ds-safe-area-bottom');
  });

  it('carries a container posture and no viewport media query', () => {
    expect(SKIN).toContain('container: ds-bottom-tab-bar / inline-size');
    expect(SKIN).toMatch(/@container ds-bottom-tab-bar \(min-width/);
    expect(SKIN).toMatch(/@container ds-bottom-tab-bar \(max-width/);

    // The tier's viewport-MQ count is exact-0; semantic queries are not
    // layout breakpoints and are always allowed.
    const media = [...SKIN.matchAll(/@media\s+([^{]+)\{/g)].map((m) => m[1]);
    for (const condition of media) {
      expect(condition).toMatch(/forced-colors|prefers-|hover:/);
    }
  });

  it('reads no private channel it does not declare or default', () => {
    const declared = new Set(
      [...SKIN.matchAll(/(--_ds-bottom-tab-bar-[a-z-]+)\s*:/g)].map((m) => m[1]),
    );
    // A private read with no declaration and no fallback resolves to
    // guaranteed-invalid and takes its whole declaration down — the same
    // shape as a tenant-only channel consumed bare.
    for (const match of SKIN.matchAll(/var\((--_ds-bottom-tab-bar-[a-z-]+)([^)]*)\)/g)) {
      const [, name, tail] = match;
      expect(declared.has(name) || tail.includes(','), `${name} is read bare`).toBe(true);
    }
    // And nothing is declared that no rule reads.
    for (const name of declared) {
      expect(SKIN.includes(`var(${name}`), `${name} is declared but never read`).toBe(true);
    }
  });

  it('leaves no authored selector unmatched by the rendered family', async () => {
    const { container, findByTestId } = renderSurface(
      <BottomTabBar items={ITEMS} activeKey="home" />,
      { engine: 'modern' },
    );
    await findByTestId('bottom-tab-bar');

    // A pseudo-element is not addressable by `querySelector` in ANY DOM, so
    // reporting one as unmatched would be the instrument's limit read as a
    // finding. It is exempted here and checked properly instead: a `::before`
    // paints exactly when its ORIGINATING element matches, so the selector is
    // re-asked with the pseudo stripped.
    const isPseudo = (selector: string) => /::[a-z-]+$/.test(selector);
    expect(
      unreachableSelectors({ rules: RULES, scopes: [container], exempt: isPseudo }),
    ).toEqual([]);

    const pseudos = RULES.filter((rule) => isPseudo(rule.selector));
    expect(pseudos.length).toBeGreaterThan(0);
    for (const rule of pseudos) {
      const originating = rule.selector.replace(/::[a-z-]+$/, '');
      expect(container.querySelector(originating), rule.selector).not.toBeNull();
    }
  });
});

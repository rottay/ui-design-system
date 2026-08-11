/**
 * LoadingOverlay elevation contract.
 *
 * Guards the CHAIN and the POSTURE, never the pixels. The pre-step contract
 * test beside this one pins the migrated declaration STRINGS; this one pins
 * which ELEMENT carries them and whether the family's rhythm is reachable.
 *
 * PORTAL LAW, checked and NOT applicable: this family was flagged as the
 * likely portal case in the tier. It is not one — the root renders in place
 * as `position: absolute; inset: 0` over its host, so it appears inside the
 * render container and a content-level readiness gate has nothing to gate on.
 * The assertion below is what settles that, rather than an assumption either
 * way.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { LoadingOverlay } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import {
  readSkinDeclarations,
  readSkinRules,
  unreachableSelectors,
  winningDecl,
} from '../../../../../tooling/testing/helpers/skin-reachability';

const RULES = readSkinRules('loading-overlay');
const SKIN = readSkinDeclarations('loading-overlay');
const ROOT = ".ds-loading-overlay[data-part='root']";
const VEIL = `${ROOT}::before`;

async function renderFull() {
  const view = renderWithEngine(
    <LoadingOverlay
      visible
      message="Syncing records"
      logo={<span data-testid="consumer-logo">RT</span>}
    />,
    'modern',
  );
  // The composed primitives resolve lazily. Sampling before they do reads the
  // family as entirely unpainted — a state not reached, never a dead rule.
  await waitFor(() => {
    expect(view.container.querySelector('[data-part="root"]')).not.toBeNull();
  });
  return view;
}

describe('LoadingOverlay elevation contract', () => {
  it('renders in place, so the portal readiness gate does not apply', async () => {
    const { container } = await renderFull();

    expect(container.querySelector('[data-part="root"]')).not.toBeNull();
  });

  it('puts the veil on the pseudo-element and leaves the root undimmed', () => {
    // Unconditional rules only: the last `background` on the veil is the
    // forced-colors override, and reading it as the resting veil is how a
    // conditional rule gets mistaken for the family's default.
    const unconditional = (selector: string) => (rule: { selector: string; conditions: string }) =>
      rule.selector === selector && rule.conditions === '';

    const root = winningDecl(RULES, 'display', unconditional(ROOT));
    const veil = winningDecl(RULES, 'background', unconditional(VEIL));

    expect(root).toBeDefined();
    expect(veil).toBeDefined();

    // The forced-colors override follows the veil onto the pseudo; left on the
    // root it would have re-introduced the ground the split just moved.
    const forced = winningDecl(
      RULES,
      'background',
      (rule) => rule.selector === VEIL && rule.conditions.includes('forced-colors'),
    );
    expect(forced?.decls.background).toBe('Canvas');

    // Element opacity composites the whole subtree, so a scrim channel applied
    // to the root dims the overlay's own message and dots along with the
    // ground — and the dots multiply it by their 0.3 keyframe floor.
    expect(root!.decls.opacity).toBeUndefined();
    expect(root!.decls.background).toBeUndefined();
    expect(root!.decls['backdrop-filter']).toBeUndefined();

    expect(veil!.decls.opacity).toContain('--ds-loading-overlay-scrim-opacity');
    expect(veil!.decls['backdrop-filter']).toBe('blur(2px)');

    // Paint order, not z-index: the content is positioned so it lands after
    // the positioned pseudo that precedes it.
    const content = winningDecl(
      RULES,
      'position',
      (rule) => rule.selector === `${ROOT} [data-part='content']`,
    );
    expect(content?.decls.position).toBe('relative');
  });

  it('owns the rhythm in the skin, with nothing inline on the stack', async () => {
    for (const part of ['content', 'status']) {
      const rule = winningDecl(
        RULES,
        'gap',
        (candidate) => candidate.selector === `${ROOT} [data-part='${part}']`,
      );
      expect(rule, `no skin gap for ${part}`).toBeDefined();
      expect(rule!.decls.gap).toContain('--_ds-loading-overlay-');
    }

    // A numeric `gap` prop lands inline, which outranks every layer
    // permanently — the parts exist so the rhythm does not have to.
    const { container } = await renderFull();
    for (const part of ['content', 'status']) {
      const node = container.querySelector<HTMLElement>(`[data-part="${part}"]`);
      expect(node, `${part} is not stamped`).not.toBeNull();
      expect(node!.getAttribute('style') ?? '').not.toContain('gap');
    }
  });

  it('carries a container posture and no viewport media query', () => {
    expect(SKIN).toContain('container: ds-loading-overlay / size');
    expect(SKIN).toMatch(/@container ds-loading-overlay \(max-height/);

    const media = [...SKIN.matchAll(/@media\s+([^{]+)\{/g)].map((m) => m[1]);
    expect(media.length).toBeGreaterThan(0);
    for (const condition of media) {
      expect(condition).toMatch(/forced-colors|prefers-|hover:/);
    }
  });

  it('leaves no authored selector unmatched by the rendered family', async () => {
    const { container } = await renderFull();

    // A pseudo-element is not addressable by `querySelector` in ANY DOM, so
    // reporting one as unmatched would be the instrument's limit read as a
    // finding. Checked properly instead: a `::before` paints exactly when its
    // originating element matches.
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

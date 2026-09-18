/**
 * MobileHeader elevation contract.
 *
 * Guards the CHAIN and the POSTURE, never the pixels.
 *
 * Three things about this family are invisible in the file and invisible to a
 * DOM snapshot: which of the two boxes the 56px describes once a notch inset
 * is padded into it, whether the coloured hairline still clears the border
 * floor after any selector edit, and whether the bar has a posture at all.
 *
 * MobileHeader is not portalled — it renders in place — so the render
 * container is the whole scope and the portal readiness gate does not apply.
 */

import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { MobileHeader } from '..';
import { deriveMobileHeaderChannels } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/mobile-header';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import {
  readSkinDeclarations,
  readSkinRules,
  unreachableSelectors,
  winningDecl,
} from '@tests/support/skin-reachability';

const RULES = readSkinRules('mobile-header');
const SKIN = readSkinDeclarations('mobile-header');
const ROOT = ".rottay-mobile-header[data-part='root']";

beforeAll(async () => {
  await Promise.all([
    import('../engines/modern'),
    import('../../../../primitives/layout/box/engines/modern'),
    import('../../../../primitives/layout/flex/engines/modern'),
  ]);
});

async function renderFull() {
  const view = renderSurface(
    <MobileHeader
      title="Order Details"
      onBack={() => undefined}
      rightActions={<span data-testid="right-action">Edit</span>}
      sticky
    >
      <span data-testid="header-body">Subtitle</span>
    </MobileHeader>,
    { engine: 'modern' },
  );
  // GATE ON CONTENT, NEVER ON THE CONTAINER. `createEngineComponent` gives
  // every primitive its own `React.lazy`, so the Box root can resolve while
  // the Flex bar and the slots inside it are still pending. Waiting on the
  // root samples a correctly-classed but empty header and reads every
  // descendant rule as unmatched — a state not reached, never a dead rule.
  await waitFor(() => {
    const { container } = view;
    expect(container.querySelector('[data-part="bar"]')).not.toBeNull();
    expect(container.querySelector('[data-part="trigger"]')).not.toBeNull();
    expect(container.querySelector('[data-part="label"]')).not.toBeNull();
    expect(container.querySelector('[data-part="body"]')).not.toBeNull();
  });
  return view;
}

describe('MobileHeader elevation contract', () => {
  it('adds the notch inset to the root box instead of taking it out of the bar', () => {
    const root = winningDecl(RULES, 'block-size', (rule) => rule.selector === ROOT);
    expect(root).toBeDefined();

    // The family owns its box model rather than inheriting the host's reset:
    // under border-box a flat `block-size: 56px` with the inset padded inside
    // it hands the notch a subtraction from the bar row.
    expect(root!.decls['box-sizing']).toBe('border-box');

    for (const property of ['block-size', 'min-block-size']) {
      expect(root!.decls[property]).toContain('--ds-mobile-header-bar-block-size');
      expect(root!.decls[property]).toContain('--ds-safe-area-top');
      expect(root!.decls[property]).not.toContain('--ds-mobile-header-safe-area');
    }
    expect(root!.decls['padding-block-start']).toContain('--ds-safe-area-top');
    expect(root!.decls['padding-block-start']).not.toContain('--ds-mobile-header-safe-area');

    // The bar row is the family's own channel now rather than a `--_ds-` private,
    // stated by the deriver at the value the skin reads it with. The safe-area
    // channel is deliberately NOT produced: its only honest value is an `env()`
    // chain, and `env` is not in the emission door's admitted value functions —
    // the door would drop the channel whole and the `produces` claim would be
    // false. The skin therefore reads the canonical `--ds-safe-area-top` directly
    // and never re-states an unproduced family channel around it — the two
    // NOT-contain assertions above guard against that read silently coming back.
    expect(deriveMobileHeaderChannels()['--ds-mobile-header-safe-area']).toBeUndefined();
    expect(deriveMobileHeaderChannels()['--ds-mobile-header-bar-block-size']).toBe('56px');
    for (const match of SKIN.matchAll(/env\(safe-area-inset-top[^)]*\)/g)) {
      const before = SKIN.slice(Math.max(0, match.index! - 120), match.index!);
      expect(before).toContain('--ds-safe-area-top');
    }
  });

  it('keeps `position` out of the runtime: the sticky posture is the skin\'s', async () => {
    const { container } = await renderFull();
    const root = container.querySelector<HTMLElement>('.rottay-mobile-header');
    // The retired inline `position: sticky` is the family's last stamped geometry.
    expect(root!.style.position).toBe('');
    expect(root!.getAttribute('data-sticky')).toBe('true');
    const sticky = RULES.find(
      (rule) => rule.selector === `${ROOT}[data-sticky='true']` && !rule.conditions,
    );
    expect(sticky!.decls.position).toBe('sticky');
  });

  it('keeps the hairline and its forced-colors override on one selector', () => {
    const hairline = RULES.filter((rule) => 'border-bottom' in rule.decls && !rule.conditions);
    const forced = RULES.filter((rule) => 'border-bottom-color' in rule.decls);

    expect(hairline).toHaveLength(1);
    expect(forced).toHaveLength(1);

    // A media query adds no specificity, so an override written below what it
    // overrides is dead. Selector equality is the invariant that survives any
    // future specificity change to either one.
    expect(forced[0].selector).toBe(hairline[0].selector);

    // Four units of `b` to clear the (0,3,1) border floor — one class and
    // three attributes, no repetition.
    const units = hairline[0].selector.match(/\[[^\]]+\]|\.[a-z0-9_-]+/gi) ?? [];
    expect(units).toHaveLength(4);
    expect(hairline[0].selector).toContain("[data-testid='mobile-header']");
  });

  it('stamps the attributes that specificity is bought from', async () => {
    const { container } = await renderFull();
    const root = container.querySelector<HTMLElement>('.rottay-mobile-header');

    expect(root).not.toBeNull();
    // The hairline silently drops under the floor if either ever goes away.
    expect(root).toHaveAttribute('data-testid', 'mobile-header');
    expect(root).toHaveAttribute('data-sticky');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  it('carries a container posture and no viewport media query', () => {
    expect(SKIN).toContain('container: ds-mobile-header / inline-size');
    expect(SKIN).toMatch(/@container ds-mobile-header \(max-width/);

    const media = [...SKIN.matchAll(/@media\s+([^{]+)\{/g)].map((m) => m[1]);
    expect(media.length).toBeGreaterThan(0);
    for (const condition of media) {
      expect(condition).toMatch(/forced-colors|prefers-|hover:/);
    }
  });

  it('leaves no authored selector unmatched by the rendered family', async () => {
    const { container } = await renderFull();

    // `data-stuck='true'` is a state this environment cannot reach, not a dead
    // rule: the stuck probe is an IntersectionObserver, which happy-dom does
    // not ship, so the component's guard fails closed and the attribute stays
    // false by design (documented in the family's own runtime). Saying "I
    // could not reach this" is a different claim from "this is dead".
    // The kernel state tokens are the same kind of claim: `data-state` is stamped
    // by a pointer or focus event this static render never fires, so the arms are
    // states not reached. Their paint is measured in the browser suite, which
    // stamps the token and reads the computed value back.
    const unreachedState = (selector: string) =>
      selector.includes("[data-stuck='true']") || selector.includes('[data-state~=');

    expect(
      unreachableSelectors({ rules: RULES, scopes: [container], exempt: unreachedState }),
    ).toEqual([]);
    expect(RULES.some((rule) => rule.selector.includes("[data-stuck='true']"))).toBe(true);
    expect(RULES.some((rule) => rule.selector.includes('[data-state~='))).toBe(true);
  });
});

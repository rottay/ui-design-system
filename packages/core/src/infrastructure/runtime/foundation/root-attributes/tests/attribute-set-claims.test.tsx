// R1-P Phase4 — run in serial tanda

/**
 * Dynamic attribute-set claims.
 *
 * THE DEFECT THIS PINS. `data-anatomy-*` is a channel whose KEY SET is data:
 * the compiled tenant artifact declares one attribute per chrome family it
 * selects, and a family it does not select emits nothing. The application
 * reconciled that by hand, which forced it to keep its own memory of the keys
 * it had stamped -- on a `<style>` element's dataset -- and to `removeAttribute`
 * a key that stopped being declared. Two consequences, both reproduced below as
 * the "raw reconciliation" the claim replaces:
 *
 *   - a key the SERVER stamped came back ABSENT rather than coming back, so a
 *     vertical's static anatomy was destroyed by a tenant artifact that simply
 *     declared fewer families;
 *   - a cross-tenant swap needed a SECOND release path, reading the same
 *     dataset memory, because nothing tied the keys to a lifecycle.
 *
 * The property under test throughout is per-KEY: a set claim is one owner of a
 * namespace, but each key it holds is an ordinary claim in the shared stack, so
 * it composes with single-attribute claimants by identity like any other pair.
 */

import React, { StrictMode, useEffect } from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { claimRootAttribute, claimRootAttributeSet, outstandingRootClaims } from '..';
import type { RootAttributeSetClaim } from '..';

/** The namespace the application claims as one unit. */
const ANATOMY = 'data-anatomy-';

const CARD = 'data-anatomy-card';
const TABLE = 'data-anatomy-table';
const SIDEBAR = 'data-anatomy-sidebar';
const LAYOUT = 'data-anatomy-layout';

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement('html');
  document.body.appendChild(root);
});

/** Every mutation of one element, so "wrote nothing" is a fact and not a hope. */
function captureMutations(element: Element) {
  const originalSet = element.setAttribute.bind(element);
  const originalRemove = element.removeAttribute.bind(element);
  const seen: string[] = [];

  Object.defineProperty(element, 'setAttribute', {
    configurable: true,
    writable: true,
    value: function patchedSet(name: string, value: string): void {
      seen.push(`set ${name}=${value}`);
      originalSet(name, value);
    },
  });
  Object.defineProperty(element, 'removeAttribute', {
    configurable: true,
    writable: true,
    value: function patchedRemove(name: string): void {
      seen.push(`remove ${name}`);
      originalRemove(name);
    },
  });

  return {
    seen,
    restore(): void {
      delete (element as unknown as Record<string, unknown>).setAttribute;
      delete (element as unknown as Record<string, unknown>).removeAttribute;
    },
  };
}

/** The `data-anatomy-*` attributes actually live on an element. */
function anatomyOf(element: Element): Record<string, string> {
  return Object.fromEntries(
    Array.from(element.attributes)
      .filter((attribute) => attribute.name.startsWith(ANATOMY))
      .map((attribute) => [attribute.name, attribute.value]),
  );
}

describe('claimRootAttributeSet over a variable key set', () => {
  it('claims every key in the map and hands each one back to what it found', () => {
    // The SSR document already carries the vertical's static anatomy for two
    // families; the tenant artifact re-declares one of them and introduces one
    // the server never stamped.
    root.setAttribute(CARD, 'framed');
    root.setAttribute(TABLE, 'ruled');

    const claim = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'underline', [SIDEBAR]: 'panel' });
    expect(anatomyOf(root)).toEqual({
      [CARD]: 'underline',
      [TABLE]: 'ruled',
      [SIDEBAR]: 'panel',
    });

    claim.release();
    expect(anatomyOf(root)).toEqual({ [CARD]: 'framed', [TABLE]: 'ruled' });
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('never touches a key it did not claim', () => {
    // The exact shape of the vertical baseline: the server stamps four
    // families, the artifact declares one. The other three are not this
    // owner's to reconcile, and a set claim that "owned the namespace" in the
    // destructive sense would blank them.
    root.setAttribute(CARD, 'framed');
    root.setAttribute(TABLE, 'ruled');
    root.setAttribute(SIDEBAR, 'rail');
    root.setAttribute(LAYOUT, 'flat');

    const claim = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'ghost' });
    claim.reconcile({ [CARD]: 'ghost' });
    claim.release();

    expect(anatomyOf(root)).toEqual({
      [CARD]: 'framed',
      [TABLE]: 'ruled',
      [SIDEBAR]: 'rail',
      [LAYOUT]: 'flat',
    });
  });

  it('restores a key that disappears from the next map to its own baseline', () => {
    // A refreshed artifact stops declaring the table family. The key must go
    // back to the SSR stamp -- the defect was that it went to ABSENT.
    root.setAttribute(TABLE, 'ruled');

    const claim = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'framed', [TABLE]: 'zebra' });
    expect(root.getAttribute(TABLE)).toBe('zebra');

    claim.reconcile({ [CARD]: 'framed' });
    expect(root.getAttribute(TABLE)).toBe('ruled');

    // The key this claim CREATED is the other half: it must end up absent, not
    // stuck at the value the claim introduced.
    claim.reconcile({});
    expect(root.hasAttribute(CARD)).toBe(false);
    expect(anatomyOf(root)).toEqual({ [TABLE]: 'ruled' });
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('moves several keys at once and writes only the ones that changed', () => {
    const claim = claimRootAttributeSet(root, ANATOMY, {
      [CARD]: 'framed',
      [TABLE]: 'ruled',
      [SIDEBAR]: 'rail',
    });

    const capture = captureMutations(root);
    claim.reconcile({ [CARD]: 'ghost', [TABLE]: 'zebra', [SIDEBAR]: 'rail', [LAYOUT]: 'floating' });
    capture.restore();

    expect(anatomyOf(root)).toEqual({
      [CARD]: 'ghost',
      [TABLE]: 'zebra',
      [SIDEBAR]: 'rail',
      [LAYOUT]: 'floating',
    });
    expect(capture.seen).toEqual([
      `set ${CARD}=ghost`,
      `set ${TABLE}=zebra`,
      `set ${LAYOUT}=floating`,
    ]);

    claim.release();
  });

  it('DRILL: re-reconciling an equal map mutates nothing', () => {
    const claim = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'framed', [TABLE]: 'ruled' });

    const capture = captureMutations(root);
    claim.reconcile({ [CARD]: 'framed', [TABLE]: 'ruled' });
    claim.reconcile({ [TABLE]: 'ruled', [CARD]: 'framed' });
    capture.restore();

    expect(capture.seen).toEqual([]);
    expect(anatomyOf(root)).toEqual({ [CARD]: 'framed', [TABLE]: 'ruled' });
    claim.release();
  });

  it('DRILL: hydrating over an identical SSR stamp mutates nothing', () => {
    // The ordinary case: the server rendered the artifact's anatomy, and the
    // client resolves the same artifact. Re-stamping identical values wakes
    // every MutationObserver on the root for no reason.
    root.setAttribute(CARD, 'framed');
    root.setAttribute(TABLE, 'ruled');

    const capture = captureMutations(root);
    const claim = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'framed', [TABLE]: 'ruled' });
    capture.restore();

    expect(capture.seen).toEqual([]);
    // The claim is still real: releasing it restores the same values it found.
    claim.release();
    expect(anatomyOf(root)).toEqual({ [CARD]: 'framed', [TABLE]: 'ruled' });
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('refuses a key outside its namespace and applies none of the map', () => {
    // A set claim is the owner of ONE namespace. If `reconcile` could reach
    // `data-theme`, the set would be a second authority over a channel with a
    // different owner, and the gate that proves apps hold no raw writers would
    // be proving nothing.
    root.setAttribute('data-theme', 'dark');
    const claim = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'framed' });

    expect(() => claim.reconcile({ [TABLE]: 'ruled', 'data-theme': 'light' })).toThrow(
      /outside the claimed namespace/,
    );
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(anatomyOf(root)).toEqual({ [CARD]: 'framed' });

    claim.release();
  });

  it('is inert once released', () => {
    root.setAttribute(CARD, 'framed');
    const claim = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'ghost' });

    claim.release();
    claim.release();
    claim.reconcile({ [CARD]: 'underline', [TABLE]: 'zebra' });

    expect(anatomyOf(root)).toEqual({ [CARD]: 'framed' });
    expect(outstandingRootClaims(root)).toBe(0);
  });
});

describe('set claims and single-attribute claims over the same key', () => {
  it('gives the live value to the top claim and hands it down on release', () => {
    root.setAttribute(CARD, 'framed');

    const set = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'underline' });
    const single = claimRootAttribute(root, CARD, 'ghost');
    expect(root.getAttribute(CARD)).toBe('ghost');

    single();
    expect(root.getAttribute(CARD)).toBe('underline');

    set.release();
    expect(root.getAttribute(CARD)).toBe('framed');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: two claimants at the SAME value are told apart by identity', () => {
    // The value-based failure, in the set shape: two owners hold the key at the
    // artifact's value, and releasing the first must not restore the baseline
    // while the second is still live.
    root.setAttribute(CARD, 'framed');

    const first = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'ghost' });
    const second = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'ghost' });

    first.release();
    expect(root.getAttribute(CARD)).toBe('ghost');

    second.release();
    expect(root.getAttribute(CARD)).toBe('framed');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('lets a covered set claim record a new value without stealing the live one', () => {
    root.setAttribute(CARD, 'framed');

    const set = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'underline' });
    const single = claimRootAttribute(root, CARD, 'ghost');

    // A refresh arrives while another owner holds the key: the set records what
    // it wants without overwriting the claim above it.
    set.reconcile({ [CARD]: 'framed' });
    expect(root.getAttribute(CARD)).toBe('ghost');

    // ...and the recorded value is what comes back, not the stale one.
    single();
    expect(root.getAttribute(CARD)).toBe('framed');

    set.release();
    expect(root.getAttribute(CARD)).toBe('framed');
    expect(outstandingRootClaims(root)).toBe(0);
  });

  it('DRILL: an external writer is not rolled back over', () => {
    root.setAttribute(CARD, 'framed');
    const set = claimRootAttributeSet(root, ANATOMY, { [CARD]: 'ghost' });

    root.setAttribute(CARD, 'app-owned');
    set.release();

    expect(root.getAttribute(CARD)).toBe('app-owned');
    expect(outstandingRootClaims(root)).toBe(0);
  });
});

// --------------------------------------------------------------------------
// React lifecycle — the shape of the application's effect, not an import of it
// --------------------------------------------------------------------------

/** SSR stamp of the document the fixtures hydrate over. */
const SSR_ANATOMY: Readonly<Record<string, string>> = {
  [CARD]: 'framed',
  [TABLE]: 'ruled',
};

let mountCount = 0;
const liveClaim: { current: RootAttributeSetClaim | null } = { current: null };

/**
 * Mirrors app-bithire `core/hooks/runtime-tenant-theme`: the effect owns the
 * claim, and the out-of-lifecycle refresh path reconciles through the same
 * owner rather than writing the root itself.
 */
function AnatomyOwner({ anatomy }: { anatomy: Record<string, string> }): React.ReactElement {
  useEffect(() => {
    mountCount += 1;
    const claim = claimRootAttributeSet(document.documentElement, ANATOMY, anatomy);
    liveClaim.current = claim;

    return () => {
      liveClaim.current = null;
      claim.release();
    };
  }, [anatomy]);

  return <output data-testid="anatomy">anatomy</output>;
}

function AnatomyTree({ anatomy }: { anatomy: Record<string, string> }): React.ReactElement {
  return (
    <StrictMode>
      <AnatomyOwner anatomy={anatomy} />
    </StrictMode>
  );
}

describe('the application effect that owns the namespace', () => {
  beforeEach(() => {
    mountCount = 0;
    liveClaim.current = null;
    for (const [name, value] of Object.entries(SSR_ANATOMY)) {
      document.documentElement.setAttribute(name, value);
    }
  });

  afterEach(() => {
    for (const name of Object.keys(anatomyOf(document.documentElement))) {
      document.documentElement.removeAttribute(name);
    }
  });

  it('double-invokes the effect, so the remount drills below are not vacuous', async () => {
    // StrictMode's automatic double-invocation depends on a development React
    // build, which this project does not guarantee. The property under test is
    // the SEMANTICS -- mount, cleanup, mount at the same values -- so it is
    // exercised explicitly instead of being hoped for.
    const first = render(<AnatomyTree anatomy={{ [CARD]: 'ghost' }} />);
    await first.findByTestId('anatomy');
    first.unmount();
    const second = render(<AnatomyTree anatomy={{ [CARD]: 'ghost' }} />);
    await second.findByTestId('anatomy');

    expect(
      mountCount,
      'the harness did not re-invoke the effect; the remount drills would be vacuous',
    ).toBeGreaterThanOrEqual(2);

    second.unmount();
  });

  it('keeps the claimed set live across a double mount at the same values', async () => {
    const view = render(<AnatomyTree anatomy={{ [CARD]: 'ghost', [SIDEBAR]: 'panel' }} />);
    await view.findByTestId('anatomy');

    expect(anatomyOf(document.documentElement)).toEqual({
      [CARD]: 'ghost',
      [TABLE]: 'ruled',
      [SIDEBAR]: 'panel',
    });

    view.unmount();
    expect(anatomyOf(document.documentElement)).toEqual(SSR_ANATOMY);
  });

  it('hands the whole namespace back to the server on unmount', async () => {
    const view = render(<AnatomyTree anatomy={{ [CARD]: 'ghost', [LAYOUT]: 'floating' }} />);
    await view.findByTestId('anatomy');
    view.unmount();

    expect(anatomyOf(document.documentElement)).toEqual(SSR_ANATOMY);
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });

  it('DRILL: a tenant swap through the same owner orphans nothing', async () => {
    // The path that used to need a second release: an artifact for another
    // tenant replaces the live one, declaring a different set of families.
    const view = render(<AnatomyTree anatomy={{ [CARD]: 'ghost', [SIDEBAR]: 'panel' }} />);
    await view.findByTestId('anatomy');

    liveClaim.current?.reconcile({ [TABLE]: 'zebra', [LAYOUT]: 'floating' });
    expect(anatomyOf(document.documentElement)).toEqual({
      [CARD]: 'framed',
      [TABLE]: 'zebra',
      [LAYOUT]: 'floating',
    });

    // A swap to a tenant that declares no anatomy at all leaves the document
    // exactly as the server rendered it.
    liveClaim.current?.reconcile({});
    expect(anatomyOf(document.documentElement)).toEqual(SSR_ANATOMY);

    view.unmount();
    expect(anatomyOf(document.documentElement)).toEqual(SSR_ANATOMY);
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });

  it('DRILL: the hand-rolled reconciliation is what leaves an orphan', () => {
    // The comparison the claim exists to win, run twice over the same input.
    // A raw reconciler remembers the keys it stamped and deletes the ones that
    // drop out. It holds no baseline, so the delete lands on the SERVER's stamp.
    const stampedLastTime = [CARD, TABLE];
    const next: Record<string, string> = { [CARD]: 'ghost' };

    for (const key of stampedLastTime) {
      if (!(key in next)) document.documentElement.removeAttribute(key);
    }
    for (const [key, value] of Object.entries(next)) {
      document.documentElement.setAttribute(key, value);
    }
    expect(document.documentElement.hasAttribute(TABLE)).toBe(false);

    // The same reconciliation through the claim hands the key back instead.
    document.documentElement.setAttribute(TABLE, 'ruled');
    const claim = claimRootAttributeSet(document.documentElement, ANATOMY, {
      [CARD]: 'ghost',
      [TABLE]: 'zebra',
    });
    claim.reconcile(next);

    expect(document.documentElement.getAttribute(TABLE)).toBe('ruled');
    claim.release();
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });
});

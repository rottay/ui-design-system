// R1-P Phase4 — run in serial tanda

/**
 * App-owned root channels under the shared claim registry.
 *
 * WHAT THIS PINS. Four `<html>` channels are stamped by the server and then
 * re-stamped by a client effect that the design system does not own:
 *
 *   data-account-tenant  \
 *   data-brand-artifact   > app-bithire `core/providers` (tenant scope trio)
 *   data-css-tenant      /
 *   data-tenant-theme-mode  app-bithire `core/hooks/runtime-tenant-theme`
 *
 * Until R1-P the application reimplemented the claim stack locally, because the
 * canonical registry was not exported from any package entrypoint. A local copy
 * is a second authority by construction, and the copy was VALUE-based: it
 * decided ownership by comparing the live value against the value it wrote.
 * That is indistinguishable from a later claim carrying the same value, which
 * is exactly what a StrictMode double-mount produces.
 *
 * The fixtures below mirror the application's effects rather than importing
 * them: this owner is the foundation the app consumes, so it must not depend on
 * an application, and the property under test is the registry's, not the app's.
 *
 * @see infrastructure/runtime/bootstrap/.../root-attribute-authority.integration.test.tsx
 *      for the design system's own single-writer census.
 */

import React, { StrictMode, useEffect } from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { claimRootAttribute, composeRootAttributeReleases, outstandingRootClaims } from '..';

/** The four channels the application claims, and what the server stamps. */
const SSR_BASELINE: Readonly<Record<string, string>> = {
  'data-account-tenant': 'themanagement',
  'data-brand-artifact': 'themanagement',
  'data-css-tenant': 'themanagement',
  'data-tenant-theme-mode': 'dark',
};

const APP_OWNED_CHANNELS = Object.keys(SSR_BASELINE);

const CLAIM_REGISTRY_MODULE = 'infrastructure/runtime/foundation/root-attributes/index.ts';

interface RootWrite {
  readonly attribute: string;
  /** `registry` when the mutation passed through the canonical claim stack. */
  readonly through: 'registry' | 'raw';
  /**
   * First source frame seen, for a readable failure message only. The fixtures
   * and the interceptor share this file, so it does not discriminate between
   * the two paths -- `through` is the property under test.
   */
  readonly origin: string;
}

let writes: RootWrite[] = [];
let restoreIntercept: (() => void) | null = null;
let mountCount = 0;

/**
 * Classifies a mutation by whether the canonical registry is on the call stack.
 *
 * The design system's own census asks WHICH module wrote a channel. Here the
 * question is narrower and stricter: did the write go THROUGH the one stack
 * that captures a baseline. A raw `setAttribute` reaches the same DOM with the
 * same value and is invisible to a value assertion — it only shows up here.
 */
function classifyWrite(): Pick<RootWrite, 'through' | 'origin'> {
  const stack = new Error().stack ?? '';
  let through: RootWrite['through'] = 'raw';
  let origin = '<unattributed>';

  for (const line of stack.split('\n').slice(1)) {
    const match = line.match(/(?:\(|\s|^)(?:file:\/\/)?(\/[^\s()]*?\/src\/[^\s():]+)/);
    if (!match) continue;
    const path = match[1];
    if (path.includes('/node_modules/')) continue;
    const relative = path.slice(path.lastIndexOf('/src/') + 5);

    if (relative === CLAIM_REGISTRY_MODULE) {
      through = 'registry';
      continue;
    }
    if (origin === '<unattributed>') origin = relative;
  }

  return { through, origin };
}

function interceptRootMutations(): () => void {
  const root = document.documentElement;
  const originalSet = root.setAttribute.bind(root);
  const originalRemove = root.removeAttribute.bind(root);

  Object.defineProperty(root, 'setAttribute', {
    configurable: true,
    writable: true,
    value: function patchedSetAttribute(name: string, value: string): void {
      if (APP_OWNED_CHANNELS.includes(name)) writes.push({ attribute: name, ...classifyWrite() });
      originalSet(name, value);
    },
  });
  Object.defineProperty(root, 'removeAttribute', {
    configurable: true,
    writable: true,
    value: function patchedRemoveAttribute(name: string): void {
      if (APP_OWNED_CHANNELS.includes(name)) writes.push({ attribute: name, ...classifyWrite() });
      originalRemove(name);
    },
  });

  return () => {
    delete (root as unknown as Record<string, unknown>).setAttribute;
    delete (root as unknown as Record<string, unknown>).removeAttribute;
  };
}

function rawWrites(): RootWrite[] {
  return writes.filter((write) => write.through === 'raw');
}

function readRoot(): Record<string, string | null> {
  return Object.fromEntries(
    APP_OWNED_CHANNELS.map((name) => [name, document.documentElement.getAttribute(name)]),
  );
}

// --------------------------------------------------------------------------
// Fixtures — the shape of the application's effects, not an import of them
// --------------------------------------------------------------------------

/** Mirrors app-bithire `core/providers` InnerProviders. */
function TenantScopeClaims({
  accountTenant,
  brandArtifact,
  cssTenant,
}: {
  accountTenant: string;
  brandArtifact: string;
  cssTenant: string;
}): React.ReactElement {
  useEffect(() => {
    mountCount += 1;
    const root = document.documentElement;

    return composeRootAttributeReleases([
      claimRootAttribute(root, 'data-account-tenant', accountTenant),
      claimRootAttribute(root, 'data-brand-artifact', brandArtifact),
      claimRootAttribute(root, 'data-css-tenant', cssTenant),
    ]);
  }, [accountTenant, brandArtifact, cssTenant]);

  return <output data-testid="scope">scope</output>;
}

/** Mirrors app-bithire `core/hooks/runtime-tenant-theme`. */
function ThemeModeClaim({ mode }: { mode: string }): React.ReactElement {
  useEffect(
    () => claimRootAttribute(document.documentElement, 'data-tenant-theme-mode', mode),
    [mode],
  );

  return <output data-testid="mode">mode</output>;
}

/**
 * The violation a regression looks like: a component inside the same tree that
 * stamps a governed channel without taking a claim.
 */
function ClandestineWriter(): React.ReactElement {
  useEffect(() => {
    document.documentElement.setAttribute('data-css-tenant', 'clandestine');
  }, []);

  return <output data-testid="clandestine">clandestine</output>;
}

function AppTree({
  mode = 'dark',
  tenant = 'themanagement',
  clandestine = false,
}: {
  mode?: string;
  tenant?: string;
  clandestine?: boolean;
}): React.ReactElement {
  return (
    <StrictMode>
      <TenantScopeClaims accountTenant={tenant} brandArtifact={tenant} cssTenant={tenant} />
      <ThemeModeClaim mode={mode} />
      {clandestine ? <ClandestineWriter /> : null}
    </StrictMode>
  );
}

beforeEach(() => {
  writes = [];
  mountCount = 0;
  for (const [name, value] of Object.entries(SSR_BASELINE)) {
    document.documentElement.setAttribute(name, value);
  }
  restoreIntercept = interceptRootMutations();
});

afterEach(() => {
  restoreIntercept?.();
  restoreIntercept = null;
  for (const name of APP_OWNED_CHANNELS) document.documentElement.removeAttribute(name);
});

describe('app-owned root channels under StrictMode', () => {
  it('double-invokes the claim effects, so the drill below is not vacuous', async () => {
    // StrictMode's automatic double-invocation only happens on a development
    // React build, which this vitest project does not guarantee. The property
    // under test is the double-invocation SEMANTICS (mount → cleanup → mount at
    // the same value), so it is exercised explicitly and deterministically.
    const first = render(<AppTree />);
    await first.findByTestId('scope');
    first.unmount();
    const second = render(<AppTree />);
    await second.findByTestId('scope');

    expect(
      mountCount,
      'the harness did not re-invoke the claim effects; the remount drills would be vacuous',
    ).toBeGreaterThanOrEqual(2);

    second.unmount();
  });

  it('keeps the claimed values live across the double mount', async () => {
    const view = render(<AppTree mode="light" tenant="acme" />);
    await view.findByTestId('mode');

    // The value-based copy failed exactly here: the first mount's cleanup ran
    // while the second mount held the channel at the same value, so the
    // rollback fired against a live owner and restored the SSR stamp.
    expect(readRoot()).toEqual({
      'data-account-tenant': 'acme',
      'data-brand-artifact': 'acme',
      'data-css-tenant': 'acme',
      'data-tenant-theme-mode': 'light',
    });

    view.unmount();
  });

  it('DRILL: a remount at the SSR value does not blank the channel', async () => {
    // The identity-vs-value case with nothing to tell the claims apart: the
    // tenant and mode the client resolves are the ones the server stamped.
    const view = render(<AppTree mode="dark" tenant="themanagement" />);
    await view.findByTestId('scope');

    expect(readRoot()).toEqual(SSR_BASELINE);
    expect(rawWrites()).toEqual([]);

    view.unmount();
  });

  it('hands every channel back to the server on unmount', async () => {
    const view = render(<AppTree mode="light" tenant="acme" />);
    await view.findByTestId('scope');
    view.unmount();

    // Non-destructive is the whole point: the artifact selectors match on the
    // tenant scope, so a cleanup that removed these would unstyle the document.
    expect(readRoot()).toEqual(SSR_BASELINE);
    expect(outstandingRootClaims(document.documentElement)).toBe(0);
  });

  it('restores the SSR baseline after the mode moves at runtime', async () => {
    // A refreshed artifact changes the tenant's configured mode mid-session.
    const view = render(<AppTree mode="light" tenant="acme" />);
    await view.findByTestId('mode');

    view.rerender(<AppTree mode="auto" tenant="acme" />);
    expect(document.documentElement.getAttribute('data-tenant-theme-mode')).toBe('auto');

    view.unmount();
    expect(readRoot()).toEqual(SSR_BASELINE);
  });
});

describe('claim-registry census over app-owned channels', () => {
  it('routes every governed write through the canonical claim stack', async () => {
    const view = render(<AppTree mode="light" tenant="acme" />);
    await view.findByTestId('scope');
    view.rerender(<AppTree mode="auto" tenant="globex" />);
    view.unmount();

    // Anti-cheat: a census that observed nothing would pass the assertion below
    // even if the app stopped claiming these channels altogether.
    for (const channel of APP_OWNED_CHANNELS) {
      expect(
        writes.filter((write) => write.attribute === channel),
        `${channel}: no write observed`,
      ).not.toHaveLength(0);
    }

    expect(
      rawWrites(),
      `writes bypassing the claim registry: ${rawWrites()
        .map((write) => `${write.attribute} <- ${write.origin}`)
        .join(', ')}`,
    ).toEqual([]);
  });

  it('DRILL: reports a clandestine raw writer planted inside the tree', async () => {
    const view = render(<AppTree mode="light" tenant="acme" clandestine />);
    await view.findByTestId('clandestine');

    const bypassed = rawWrites();
    expect(bypassed).not.toHaveLength(0);
    expect(bypassed.every((write) => write.attribute === 'data-css-tenant')).toBe(true);

    // The census separates the two paths on ONE channel: the same attribute
    // carries legitimate claims in the same lifecycle. Without this, a drill
    // that merely counted raw writes would also pass on a tree that had stopped
    // claiming the channel at all.
    expect(
      writes.some((write) => write.attribute === 'data-css-tenant' && write.through === 'registry'),
    ).toBe(true);

    // The reason a value assertion cannot replace this census: the planted
    // writer took the channel, and the claim that owned it correctly declines
    // to roll back over an external writer, so the DOM alone looks deliberate.
    expect(document.documentElement.getAttribute('data-css-tenant')).toBe('clandestine');

    view.unmount();
  });
});

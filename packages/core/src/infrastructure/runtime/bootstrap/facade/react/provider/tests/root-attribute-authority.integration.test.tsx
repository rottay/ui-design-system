/**
 * Root-attribute single-writer proof.
 *
 * `<html>` is the one DOM node every runtime owner can reach, so it is where a
 * second authority would show up first. Each governed attribute is a separate
 * channel with a named owner:
 *
 *   data-tenant    -> TenantProvider
 *   data-theme     -> ThemeProvider          (the DS half of the split; BitHire
 *                                             owns `data-tenant-theme-mode`)
 *   data-engine    -> EngineProvider
 *   data-density   -> RootDensityProvider
 *   data-ds-motion -> MotionProvider
 *   dir / lang     -> I18nProvider
 *
 * The proof is a RUNTIME writer census, not a source census: every mutation of
 * `document.documentElement` is intercepted during a full provider lifecycle
 * and attributed to the module that made it, read off the call stack. A second
 * emitter anywhere in the composed tree — including one reached only through a
 * lazily mounted branch — raises the writer count for its channel and fails.
 *
 * Source text is never inspected here, so a writer added through an alias, a
 * re-export, or a helper cannot hide from it.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import { DesignSystemProvider } from '..';

/** Attribute -> the single module path allowed to write it. */
const GOVERNED_ROOT_ATTRIBUTES: Readonly<Record<string, string>> = {
  'data-tenant': 'infrastructure/runtime/tenant/composition/react/provider/index.tsx',
  'data-theme': 'infrastructure/runtime/theming/composition/react/provider/index.tsx',
  'data-engine': 'infrastructure/runtime/engines/composition/react/provider/index.tsx',
  'data-density': 'infrastructure/runtime/foundation/density/index.ts',
  // `lang`/`dir` used to be exempt from this census on the grounds that they
  // were written through the reflected IDL properties and so could only be
  // proven behaviourally. That exemption is gone: they are ordinary claims on
  // the shared registry now, which means they are censused for a single writer
  // and restored to their exact predecessor by the two drills below, on the
  // same terms as every other governed channel.
  lang: 'infrastructure/runtime/i18n/runtime/context/provider/index.tsx',
  dir: 'infrastructure/runtime/i18n/runtime/context/provider/index.tsx',
};

/**
 * Channels an APPLICATION claims, which this tree must therefore never write.
 *
 * These four are stamped by the SSR projection and re-claimed on hydration by
 * app-bithire (`core/providers` for the tenant-scope trio, the runtime tenant
 * theme hook for the mode) through the shared claim registry. They are censused
 * here for one property only: the design system must not quietly become their
 * second writer. They are deliberately NOT in the owner map above -- nothing in
 * this tree writes them, so the "at least one writer" anti-cheat would report a
 * false violation.
 *
 * Moving one of these into a design-system provider is a legitimate future
 * decision. It turns this assertion red, which is the intent: the transfer has
 * to be made deliberately and the application's claim removed in the same
 * change, rather than two owners accumulating in silence.
 */
const APP_OWNED_ROOT_CHANNELS: readonly string[] = [
  'data-account-tenant',
  'data-brand-artifact',
  'data-css-tenant',
  'data-tenant-theme-mode',
];

function isCensusedChannel(name: string): boolean {
  return name in GOVERNED_ROOT_ATTRIBUTES || APP_OWNED_ROOT_CHANNELS.includes(name);
}

const THIS_TEST_FILE = 'root-attribute-authority.integration.test.tsx';

/**
 * The two leaf modules of the claim stack. Attribute writes carry the registry
 * frame; style/class writes carry both leaves (the adapter closures live in
 * presentation, claimChannel in registry). The facade at the old monolith path
 * is a pure re-export barrel: it creates no frames, so it is not allowlisted.
 */
const CLAIM_STACK_MODULES: ReadonlySet<string> = new Set([
  'infrastructure/runtime/foundation/root-attributes/registry/index.ts',
  'infrastructure/runtime/foundation/root-attributes/presentation/index.ts',
]);

interface RootWrite {
  readonly attribute: string;
  readonly writer: string;
}

let writes: RootWrite[] = [];
let restore: (() => void) | null = null;

/**
 * Resolves the module that performed a mutation from the call stack.
 *
 * Vite serves each module from its own source path, so the first frame below
 * the interceptor that lives under `src/` is the writer. Frames are normalised
 * to a repo-relative path so a pinned owner is readable and stable.
 */
function callerModule(): string {
  const stack = new Error().stack ?? '';
  const lines = stack.split('\n').slice(1);
  let crossedClaimRegistry = false;
  for (const line of lines) {
    const match = line.match(/(?:\(|\s|^)(?:file:\/\/)?(\/[^\s()]*?\/src\/[^\s():]+)/);
    if (!match) continue;
    const path = match[1];
    if (path.includes('/node_modules/')) continue;
    const relative = path.slice(path.lastIndexOf('/src/') + 5);
    // The claim registry performs the physical set/remove on behalf of a
    // semantic provider. Attribute the write to its first caller so two
    // providers cannot collapse into one apparent "root-attributes" writer.
    if (CLAIM_STACK_MODULES.has(relative)) {
      crossedClaimRegistry = true;
      continue;
    }
    // The interceptor itself sits in this file; skip it so the frame below is
    // credited, but keep a genuine write made BY this file (the planted
    // violation) attributable.
    if (relative.endsWith(THIS_TEST_FILE) && lines.indexOf(line) < 2) continue;
    return relative;
  }
  // A release returned by claimRootAttribute can restore an SSR baseline from
  // React's passive-unmount machinery. That is the lifecycle of an already
  // attributed claim, not a second semantic writer.
  if (crossedClaimRegistry) return '<claim-release>';
  return '<unattributed>';
}

function interceptRootMutations(): () => void {
  const root = document.documentElement;
  const originalSet = root.setAttribute.bind(root);
  const originalRemove = root.removeAttribute.bind(root);

  Object.defineProperty(root, 'setAttribute', {
    configurable: true,
    writable: true,
    value: function patchedSetAttribute(name: string, value: string): void {
      if (isCensusedChannel(name)) {
        writes.push({ attribute: name, writer: callerModule() });
      }
      originalSet(name, value);
    },
  });
  Object.defineProperty(root, 'removeAttribute', {
    configurable: true,
    writable: true,
    value: function patchedRemoveAttribute(name: string): void {
      if (isCensusedChannel(name)) {
        writes.push({ attribute: name, writer: callerModule() });
      }
      originalRemove(name);
    },
  });

  return () => {
    delete (root as unknown as Record<string, unknown>).setAttribute;
    delete (root as unknown as Record<string, unknown>).removeAttribute;
  };
}

function writersOf(attribute: string): string[] {
  return Array.from(
    new Set(
      writes
        .filter((write) => write.attribute === attribute && write.writer !== '<claim-release>')
        .map((w) => w.writer),
    ),
  ).sort();
}

function tenantConfig(overrides: Partial<TenantConfig> = {}): TenantConfig {
  return {
    slug: 'root-attribute-authority',
    name: 'Root attribute authority',
    theme: 'dark',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Root attribute authority' },
    ...overrides,
  } as TenantConfig;
}

function Probe(): React.ReactElement {
  return <output data-testid="mounted">mounted</output>;
}

beforeEach(() => {
  writes = [];
  restore = interceptRootMutations();
});

afterEach(() => {
  restore?.();
  restore = null;
  const root = document.documentElement;
  for (const attribute of Object.keys(GOVERNED_ROOT_ATTRIBUTES)) {
    root.removeAttribute(attribute);
  }
  for (const attribute of APP_OWNED_ROOT_CHANNELS) {
    root.removeAttribute(attribute);
  }
  root.removeAttribute('data-ds-motion');
  root.style.cssText = '';
});

async function mountFullTree(config: TenantConfig = tenantConfig()) {
  const view = render(
    <DesignSystemProvider
      tenantConfig={config}
      vertical="bithire"
      forceEngine="modern"
      locale="en"
      skipCssLoading
    >
      <Probe />
    </DesignSystemProvider>,
  );
  await view.findByTestId('mounted');
  await waitFor(() => {
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
    expect(document.documentElement.getAttribute('data-density')).toBeTruthy();
    expect(document.documentElement.getAttribute('data-engine')).toBeTruthy();
    expect(document.documentElement.getAttribute('data-tenant')).toBeTruthy();
    // Waited on for the same reason as the four above: every governed channel
    // must be live before a census reads its writers, or the anti-cheat below
    // is measuring a tree that had not finished claiming.
    expect(document.documentElement.getAttribute('lang')).toBeTruthy();
    expect(document.documentElement.getAttribute('dir')).toBeTruthy();
  });
  return view;
}

describe('root attribute authority', () => {
  it('attributes every governed root write to exactly one module', async () => {
    const view = await mountFullTree();
    // Exercise the channels that only move on a change, so a writer reachable
    // only from an update path is included in the census.
    view.rerender(
      <DesignSystemProvider
        tenantConfig={tenantConfig({ theme: 'light' })}
        vertical="bithire"
        forceEngine="rustic"
        locale="es"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-engine')).toBe('rustic');
    });
    view.unmount();

    // Anti-cheat: the census must have inspected a non-empty corpus on EVERY
    // channel. Without this the whole suite would pass if the provider stopped
    // writing the document element altogether.
    for (const attribute of Object.keys(GOVERNED_ROOT_ATTRIBUTES)) {
      const writers = writersOf(attribute);
      expect(writers.length, `${attribute}: no writer observed`).toBeGreaterThan(0);
      expect(writers, `${attribute}: unattributed writer in ${writers.join(', ')}`).not.toContain(
        '<unattributed>',
      );
    }

    for (const [attribute, owner] of Object.entries(GOVERNED_ROOT_ATTRIBUTES)) {
      const writers = writersOf(attribute);
      expect(writers, `${attribute} has more than one writer: ${writers.join(', ')}`).toHaveLength(1);
      expect(writers[0]).toBe(owner);
    }
  });

  it('reports a planted second writer instead of ignoring it', async () => {
    await mountFullTree();
    expect(writersOf('data-theme')).toHaveLength(1);

    // The violation a real regression would look like: any other module
    // stamping the same channel on the same node.
    document.documentElement.setAttribute('data-theme', 'planted');

    const writers = writersOf('data-theme');
    expect(writers).toHaveLength(2);
    expect(writers.some((writer) => writer.endsWith(THIS_TEST_FILE))).toBe(true);
  });

  it('restores every exact governed root predecessor on unmount', async () => {
    const root = document.documentElement;
    const predecessors = Object.fromEntries(
      Object.keys(GOVERNED_ROOT_ATTRIBUTES).map((attribute) => [attribute, `ssr-${attribute}`]),
    );
    for (const [attribute, value] of Object.entries(predecessors)) {
      root.setAttribute(attribute, value);
    }
    writes = [];
    const view = await mountFullTree();
    view.unmount();

    await waitFor(() => {
      for (const [attribute, value] of Object.entries(predecessors)) {
        expect(root.getAttribute(attribute), `${attribute} did not restore`).toBe(value);
      }
    });
  });

  it('never writes a channel an application claims', async () => {
    // R1-P Phase4. The SSR projection stamps all four, so the document arrives
    // with them already set; a provider that re-derived any of them would be a
    // second hydrated owner of a channel it does not project.
    const root = document.documentElement;
    for (const channel of APP_OWNED_ROOT_CHANNELS) root.setAttribute(channel, 'ssr');
    // The interceptor is already installed, so the planted stamps above are
    // this test's own writes. Drop them or they read as the trespass.
    writes = [];

    const view = await mountFullTree();
    view.rerender(
      <DesignSystemProvider
        tenantConfig={tenantConfig({ theme: 'light' })}
        vertical="evnto"
        forceEngine="rustic"
        locale="es"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );
    view.unmount();

    const trespass = writes.filter((write) => APP_OWNED_ROOT_CHANNELS.includes(write.attribute));
    expect(
      trespass,
      `design system wrote app-owned channels: ${trespass
        .map((write) => `${write.attribute} <- ${write.writer}`)
        .join(', ')}`,
    ).toEqual([]);

    // The values the test planted survive untouched, which is the same property
    // stated as a DOM fact rather than a writer census.
    for (const channel of APP_OWNED_ROOT_CHANNELS) {
      expect(root.getAttribute(channel), `${channel} was modified`).toBe('ssr');
    }
  });

  it('keeps each channel independent when a single input moves', async () => {
    const view = await mountFullTree();
    const before = {
      tenant: document.documentElement.getAttribute('data-tenant'),
      engine: document.documentElement.getAttribute('data-engine'),
      density: document.documentElement.getAttribute('data-density'),
    };

    view.rerender(
      <DesignSystemProvider
        tenantConfig={tenantConfig({ theme: 'light' })}
        vertical="bithire"
        forceEngine="modern"
        locale="en"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
    expect(document.documentElement.getAttribute('data-tenant')).toBe(before.tenant);
    expect(document.documentElement.getAttribute('data-engine')).toBe(before.engine);
    expect(document.documentElement.getAttribute('data-density')).toBe(before.density);
  });
});

describe('locale root attributes', () => {
  /**
   * Single ownership and exact restore are covered generically above, now that
   * `lang`/`dir` are governed channels like any other. What is specific to
   * this pair, and so proven here, is that the VALUE tracks the active locale
   * across a switch -- and that the switch does not accumulate owners.
   *
   * Assertions read `getAttribute`, not the reflected `.dir`/`.lang`: `dir` is
   * an enumerated attribute, so the IDL property lowercases valid values and
   * reports invalid ones as `''`. The claim registry stores and restores the
   * raw attribute, and only the attribute API can observe that faithfully.
   */
  it('routes dir and lang through the single i18n owner', async () => {
    const root = document.documentElement;
    const view = render(
      <DesignSystemProvider tenantConfig={tenantConfig()} locale="ar" skipCssLoading>
        <Probe />
      </DesignSystemProvider>,
    );
    await view.findByTestId('mounted');
    await waitFor(() => {
      expect(root.getAttribute('dir')).toBe('rtl');
      expect(root.getAttribute('lang')).toBe('ar');
    });

    view.rerender(
      <DesignSystemProvider tenantConfig={tenantConfig()} locale="en" skipCssLoading>
        <Probe />
      </DesignSystemProvider>,
    );
    await waitFor(() => {
      expect(root.getAttribute('dir')).toBe('ltr');
      expect(root.getAttribute('lang')).toBe('en');
    });

    view.unmount();

    expect(writersOf('lang')).toEqual([GOVERNED_ROOT_ATTRIBUTES.lang]);
    expect(writersOf('dir')).toEqual([GOVERNED_ROOT_ATTRIBUTES.dir]);
  });

  it('leaves an application-owned locale pair exactly as it found it', async () => {
    // The pair the SSR projection stamps. A provider that assigned rather than
    // claimed would hand back its own last locale -- or nothing at all -- and
    // the application's document would silently change language on unmount.
    const root = document.documentElement;
    root.setAttribute('lang', 'fr-CA');
    root.setAttribute('dir', 'ltr');

    const view = render(
      <DesignSystemProvider tenantConfig={tenantConfig()} locale="ar" skipCssLoading>
        <Probe />
      </DesignSystemProvider>,
    );
    await view.findByTestId('mounted');
    await waitFor(() => {
      expect(root.getAttribute('dir')).toBe('rtl');
      expect(root.getAttribute('lang')).toBe('ar');
    });

    view.unmount();
    const handedBack = { lang: root.getAttribute('lang'), dir: root.getAttribute('dir') };
    root.removeAttribute('lang');
    root.removeAttribute('dir');

    expect(handedBack).toEqual({ lang: 'fr-CA', dir: 'ltr' });
  });
});

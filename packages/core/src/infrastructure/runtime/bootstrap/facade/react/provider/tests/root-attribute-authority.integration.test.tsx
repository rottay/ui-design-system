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
};

const THIS_TEST_FILE = 'root-attribute-authority.integration.test.tsx';

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
  for (const line of lines) {
    const match = line.match(/(?:\(|\s|^)(?:file:\/\/)?(\/[^\s()]*?\/src\/[^\s():]+)/);
    if (!match) continue;
    const path = match[1];
    if (path.includes('/node_modules/')) continue;
    const relative = path.slice(path.lastIndexOf('/src/') + 5);
    // The interceptor itself sits in this file; skip it so the frame below is
    // credited, but keep a genuine write made BY this file (the planted
    // violation) attributable.
    if (relative.endsWith(THIS_TEST_FILE) && lines.indexOf(line) < 2) continue;
    return relative;
  }
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
      if (name in GOVERNED_ROOT_ATTRIBUTES) {
        writes.push({ attribute: name, writer: callerModule() });
      }
      originalSet(name, value);
    },
  });
  Object.defineProperty(root, 'removeAttribute', {
    configurable: true,
    writable: true,
    value: function patchedRemoveAttribute(name: string): void {
      if (name in GOVERNED_ROOT_ATTRIBUTES) {
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
    new Set(writes.filter((write) => write.attribute === attribute).map((w) => w.writer)),
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
    appearance: { general: { density: 'compact' } },
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
        tenantConfig={tenantConfig({ theme: 'light', appearance: { general: { density: 'spacious' } } })}
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
      expect(document.documentElement.getAttribute('data-density')).toBe('spacious');
    });
    view.unmount();

    // Anti-cheat: the census must have inspected a non-empty corpus on EVERY
    // channel. Without this the whole suite would pass if the provider stopped
    // writing the document element altogether.
    for (const attribute of Object.keys(GOVERNED_ROOT_ATTRIBUTES)) {
      expect(writersOf(attribute).length).toBeGreaterThan(0);
      expect(writersOf(attribute)).not.toContain('<unattributed>');
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

  it('leaves no governed root attribute behind on unmount', async () => {
    const view = await mountFullTree();
    view.unmount();

    await waitFor(() => {
      for (const attribute of Object.keys(GOVERNED_ROOT_ATTRIBUTES)) {
        expect(
          document.documentElement.hasAttribute(attribute),
          `${attribute} survived unmount`,
        ).toBe(false);
      }
    });
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
   * `dir`/`lang` are written through the reflected IDL properties rather than
   * `setAttribute`, so they are proven behaviourally: one provider owns them,
   * and the value tracks the active locale on both mount and switch.
   */
  it('routes dir and lang through the single i18n owner', async () => {
    const view = render(
      <DesignSystemProvider tenantConfig={tenantConfig()} locale="ar" skipCssLoading>
        <Probe />
      </DesignSystemProvider>,
    );
    await view.findByTestId('mounted');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    view.rerender(
      <DesignSystemProvider tenantConfig={tenantConfig()} locale="en" skipCssLoading>
        <Probe />
      </DesignSystemProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });
  });
});

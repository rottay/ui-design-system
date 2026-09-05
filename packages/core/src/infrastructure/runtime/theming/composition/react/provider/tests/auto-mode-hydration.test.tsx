/**
 * `auto` has to resolve to the SAME mode on the server and on the hydrating
 * client, and only then move.
 *
 * `backgroundMode: 'auto'` is a legal tenant value, and the OS preference it
 * depends on exists only in the browser. Reading `window.matchMedia` while
 * rendering makes the first client frame disagree with the server markup for
 * every dark-preferring visitor: the server resolves `light`, the hydrating
 * render resolves `dark`, and under classic that disagreement reaches antd's
 * CSS-in-JS output through `selectAntdTheme`'s algorithm and seed block. The
 * result is a recoverable hydration error plus a full re-render of the tree.
 *
 * So this suite drives the real classic path — EngineProvider(classic) ->
 * ThemeProvider(theme="auto") -> the compiled projection -> AntdConfigProvider
 * — against a mocked OS preference of DARK, and asserts three separable facts:
 *
 * 1. the server render resolves `light` and selects the default algorithm;
 * 2. the hydrating render agrees with it byte-for-byte (no hydration error),
 *    which is the fact a snapshot-free implementation cannot deliver;
 * 3. the dark preference still lands, after hydration, and carries the
 *    COMPILED dark block with it — the fix must not cost `auto` its meaning.
 *
 * (3) is the counterfactual for (1) and (2): an implementation that hardcoded
 * `light` would pass the first two and fail here.
 */

import React from 'react';
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { theme as antdTheme } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { EngineVisualDeclarationProvider } from '@/infrastructure/runtime/foundation/engine-visual';
import { EngineProvider } from '../../../../../engines/composition/react/provider';
import { AntdConfigProvider, selectAntdTheme } from '../../../../../engines/presentation/adapters/antd';
import { ThemeProvider, useThemeContext } from '..';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const CLASSIC = firstPartyEngineVisual('bithire', 'classic');

type Listener = (event: MediaQueryListEvent) => void;

/** A `matchMedia` whose dark preference can be flipped after hydration. */
function createDarkPreferenceMock(initiallyDark: boolean) {
  const listeners = new Set<Listener>();
  let dark = initiallyDark;

  const matchMedia = vi.fn((query: string) => ({
    get matches() {
      return query === DARK_QUERY ? dark : false;
    },
    media: query,
    addEventListener: (event: string, callback: Listener) => {
      if (event === 'change' && query === DARK_QUERY) listeners.add(callback);
    },
    removeEventListener: (event: string, callback: Listener) => {
      if (event === 'change') listeners.delete(callback);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }));

  return {
    matchMedia,
    listenerCount: () => listeners.size,
    setDark(next: boolean) {
      dark = next;
      for (const listener of [...listeners]) {
        listener({ matches: next, media: DARK_QUERY } as MediaQueryListEvent);
      }
    },
  };
}

/**
 * Stamps what the theme context resolved AND what the classic bridge would
 * hand antd for it, so the assertion covers the compiled mode selection rather
 * than the context string alone.
 */
function ResolvedModeProbe(): React.ReactElement {
  const { resolvedTheme } = useThemeContext();
  const selected = selectAntdTheme(CLASSIC, resolvedTheme);
  return (
    <span
      data-testid="resolved"
      data-resolved-theme={resolvedTheme}
      data-algorithm={selected.algorithm === antdTheme.darkAlgorithm ? 'dark' : 'default'}
      data-color-primary={selected.token.colorPrimary}
    >
      {resolvedTheme}
    </span>
  );
}

function tree(): React.ReactElement {
  return (
    <EngineProvider defaultEngine="classic">
      <ThemeProvider theme="auto" tenant="bithire">
        <EngineVisualDeclarationProvider declaration={CLASSIC}>
          <AntdConfigProvider>
            <ResolvedModeProbe />
          </AntdConfigProvider>
        </EngineVisualDeclarationProvider>
      </ThemeProvider>
    </EngineProvider>
  );
}

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('classic + `auto` under an OS dark preference', () => {
  it('renders, hydrates from and then moves off the light server snapshot', async () => {
    const preference = createDarkPreferenceMock(true);
    window.matchMedia = preference.matchMedia as unknown as typeof window.matchMedia;

    // 1. The server has no OS preference to read, so `auto` is light.
    const html = renderToString(tree());
    expect(html).toContain('data-resolved-theme="light"');
    expect(html).toContain('data-algorithm="default"');
    expect(html).not.toContain('data-resolved-theme="dark"');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    // 2. The hydrating render has to agree with that markup, even though this
    //    client prefers dark.
    await act(async () => {
      root = hydrateRoot(container, tree());
    });

    expect(
      consoleError.mock.calls.some((call) =>
        String(call[0]).toLowerCase().includes('hydration'),
      ),
    ).toBe(false);
    expect(preference.listenerCount()).toBe(1);

    // 3. And the preference still lands, with the compiled dark block.
    const probe = container.querySelector('[data-testid="resolved"]');
    expect(probe).toHaveAttribute('data-resolved-theme', 'dark');
    expect(probe).toHaveAttribute('data-algorithm', 'dark');
    expect(probe).toHaveAttribute(
      'data-color-primary',
      String(
        CLASSIC.projection.modes.find((mode) => mode.mode === 'dark')?.seeds.colorPrimary,
      ),
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    await act(async () => root?.unmount());
    container.remove();
  });

  it('follows a preference change made after hydration', async () => {
    const preference = createDarkPreferenceMock(false);
    window.matchMedia = preference.matchMedia as unknown as typeof window.matchMedia;

    const container = document.createElement('div');
    container.innerHTML = renderToString(tree());
    document.body.appendChild(container);

    let root: Root | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree());
    });

    const probe = () => container.querySelector('[data-testid="resolved"]');
    expect(probe()).toHaveAttribute('data-resolved-theme', 'light');

    await act(async () => {
      preference.setDark(true);
    });
    expect(probe()).toHaveAttribute('data-resolved-theme', 'dark');
    expect(probe()).toHaveAttribute('data-algorithm', 'dark');

    await act(async () => {
      preference.setDark(false);
    });
    expect(probe()).toHaveAttribute('data-resolved-theme', 'light');
    expect(probe()).toHaveAttribute('data-algorithm', 'default');

    await act(async () => root?.unmount());
    expect(preference.listenerCount()).toBe(0);
    container.remove();
  });
});

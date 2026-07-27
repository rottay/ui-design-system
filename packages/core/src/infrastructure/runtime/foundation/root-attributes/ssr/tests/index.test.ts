/**
 * SSR root-attribute projection contract.
 *
 * The properties here are the ones an application cannot verify for itself:
 * that the server never guesses a viewer preference, that the pre-paint script
 * stays a refinement rather than a second authority, and that `lang`/`dir` come
 * from the same resolver the client uses.
 */

import { describe, it, expect } from 'vitest';

import {
  buildThemePrepaintScript,
  resolveDocumentRootAttributes,
} from '..';

const BASE = { engine: 'modern', locale: 'en' } as const;

describe('resolveDocumentRootAttributes', () => {
  it('stamps the engine so engine-scoped CSS matches on the first paint', () => {
    // `data-engine` was client-only: every engine-scoped rule missed until
    // hydration, which is a visible flash on a Modern-only app.
    expect(resolveDocumentRootAttributes({ ...BASE, themeMode: 'light' })['data-engine']).toBe(
      'modern',
    );
  });

  it('renders an explicit mode verbatim', () => {
    const dark = resolveDocumentRootAttributes({ ...BASE, themeMode: 'dark' });
    expect(dark['data-theme']).toBe('dark');
    expect(dark['data-tenant-theme-mode']).toBe('dark');
  });

  it('never resolves auto on the server, and says so in the attributes', () => {
    // The server cannot read `prefers-color-scheme`. It must render a declared
    // fallback AND preserve the `auto` intent, or the script cannot refine it.
    const auto = resolveDocumentRootAttributes({ ...BASE, themeMode: 'auto' });

    expect(auto['data-theme']).toBe('light');
    expect(auto['data-tenant-theme-mode']).toBe('auto');
  });

  it('honours an explicit auto fallback', () => {
    expect(
      resolveDocumentRootAttributes({ ...BASE, themeMode: 'auto', autoFallback: 'dark' })[
        'data-theme'
      ],
    ).toBe('dark');
  });

  it('derives dir from the locale, not from a separate switch', () => {
    expect(resolveDocumentRootAttributes({ ...BASE, themeMode: 'light' }).dir).toBe('ltr');

    const arabic = resolveDocumentRootAttributes({ ...BASE, locale: 'ar', themeMode: 'light' });
    expect(arabic.lang).toBe('ar');
    expect(arabic.dir).toBe('rtl');
  });

  it('emits tenant scope attributes only when a tenant is mounted', () => {
    const bare = resolveDocumentRootAttributes({ ...BASE, themeMode: 'light' });
    expect(bare['data-tenant']).toBeUndefined();
    expect(bare['data-ds-root']).toBeUndefined();

    const scoped = resolveDocumentRootAttributes({
      ...BASE,
      themeMode: 'light',
      tenant: { slug: 'themanagement', verticalKey: 'bithire' },
    });
    // The artifact selector needs all three; emitting a subset silently breaks it.
    expect(scoped['data-ds-root']).toBe('');
    expect(scoped['data-vertical']).toBe('bithire');
    expect(scoped['data-tenant']).toBe('themanagement');
  });

  it('is pure — no document, window or environment read', () => {
    // Called with no globals at all it must still answer, which is what makes
    // it safe in an RSC render.
    expect(() => resolveDocumentRootAttributes({ ...BASE, themeMode: 'light' })).not.toThrow();
  });
});

describe('buildThemePrepaintScript', () => {
  const script = buildThemePrepaintScript();

  /** Runs the script text against a fake root, with a stubbed media query. */
  function runScript(mode: string | null, prefersDark: boolean) {
    const root = document.createElement('html');
    if (mode !== null) root.setAttribute('data-tenant-theme-mode', mode);
    root.setAttribute('data-theme', 'light');

    const doc = { documentElement: root };
    const win = { matchMedia: () => ({ matches: prefersDark }) };
    // eslint-disable-next-line no-new-func
    new Function('document', 'window', script)(doc, win);
    return root;
  }

  it('refines auto to the viewer preference', () => {
    expect(runScript('auto', true).getAttribute('data-theme')).toBe('dark');
    expect(runScript('auto', false).getAttribute('data-theme')).toBe('light');
  });

  it('DRILL: leaves an explicit tenant choice alone', () => {
    // The failure that matters: a script that overrode an explicit mode would
    // let a system preference defeat a tenant's declared identity.
    expect(runScript('light', true).getAttribute('data-theme')).toBe('light');
    expect(runScript('dark', false).getAttribute('data-theme')).toBe('light');
  });

  it('DRILL: does nothing when the mode attribute is absent', () => {
    // Absent mode means the projection did not run. The script must not invent
    // a theme in that case -- that would make it an independent authority.
    expect(runScript(null, true).getAttribute('data-theme')).toBe('light');
  });

  it('writes only the three surfaces the provider also claims', () => {
    // A fourth surface would be a writer nobody reconciles.
    const written = script.match(/r\.(setAttribute\("([^"]+)"|classList|style)/g) ?? [];
    expect(written.length).toBeGreaterThan(0);
    expect(script).not.toMatch(/setAttribute\("(?!data-theme)/);
  });

  it('survives a browser without matchMedia', () => {
    const root = document.createElement('html');
    root.setAttribute('data-tenant-theme-mode', 'auto');
    root.setAttribute('data-theme', 'light');
    // eslint-disable-next-line no-new-func
    expect(() =>
      new Function('document', 'window', script)({ documentElement: root }, {}),
    ).not.toThrow();
  });
});

/**
 * A radius operand stated below `:root` reaches paint.
 *
 * The four dial steps are declared once at `:root`, and a custom property
 * resolves its `var()` where it is declared, so a nested tenant scope that moves
 * `--ds-radius-lg-base` or `--ds-radius-scale` painted the ROOT's radius unless
 * its own block re-declares the step. Read in a real Chromium page: an outer
 * bithire document, and nested scopes under it.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { resolvedBaseCss } from '@tests/support/family-causality';
import {
  compileThemeIntent,
  documentThemeIntent,
  mountTenantTheme,
  staticThemeIntent,
} from '@/entrypoints/server';
import ModernBox from '@/components/primitives/layout/box/engines/modern';
import ModernCard from '@/components/primitives/display/card/engines/modern';

import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '@/infrastructure/compilers/runtime/tenant-css/artifact-renderer';

import { emitThemeCss, emitTenantArtifactCss, tenantArtifactScope } from '../..';

interface ScenePage {
  setContent(html: string): Promise<void>;
  addStyleTag(options: { content: string }): Promise<unknown>;
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
}

interface SceneBrowser {
  newPage(): Promise<ScenePage>;
  close(): Promise<void>;
}

function launch(): Promise<SceneBrowser> {
  const root = resolve(__dirname, '../../../../../../../../../package.json');
  for (const base of [root, resolve(root, '../../package.json'), resolve(root, '../showroom/package.json')]) {
    for (const specifier of ['playwright', '@playwright/test']) {
      try {
        const module = createRequire(base)(specifier) as { chromium?: { launch(): Promise<SceneBrowser> } };
        if (module.chromium) return module.chromium.launch();
      } catch {
        // try the next resolution root
      }
    }
  }
  throw new Error('radius chain: no Playwright chromium is resolvable');
}

const SCOPES = {
  outer: '',
  vertical: '[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="plain"]',
  scaled: '[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="scaled"]',
  delta: '[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="lgdelta"]',
  rottay: "[data-ds-root][data-vertical='rottay']",
} as const;

type ScopeId = keyof typeof SCOPES;
type Reading = { token: string; box: string; card: string };

function tenantCss(slug: string, decisions: Record<string, unknown>): string {
  const { compiled } = compileThemeIntent(
    documentThemeIntent({
      vertical: 'bithire',
      slug,
      document: { version: 2, plan: 'pro', decisions } as never,
    }),
  );
  return emitThemeCss(compiled, tenantArtifactScope('bithire', slug));
}

/** The artifact bytes the build writes, selector projection included. */
function firstPartyArtifact(slug: string): string {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === slug);
  if (!spec) throw new Error(`radius chain: no first-party spec for ${slug}`);
  return renderFirstPartyArtifact({ spec }).css;
}

async function measure(): Promise<Record<ScopeId, Reading>> {
  const outer = await mountTenantTheme(staticThemeIntent('bithire'));
  const sheets = [
    resolvedBaseCss(),
    firstPartyArtifact('bithire'),
    tenantCss('plain', {}),
    tenantCss('scaled', { 'shape.radius-scale': 1.2 }),
    // The DB artifact carries deltas only: the one operand this tenant moved.
    emitTenantArtifactCss({
      verticalKey: 'bithire',
      slug: 'lgdelta',
      compilerVersion: 'test',
      digest: 'test',
      variables: { '--ds-radius-lg-base': '8px' },
    }),
    firstPartyArtifact('rottay'),
  ];
  const specimen = renderToStaticMarkup(
    <>
      <ModernBox rounded="lg" data-probe="box" padding="4">
        box
      </ModernBox>
      <ModernCard data-probe="card">card</ModernCard>
    </>,
  );
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    for (const content of sheets) await page.addStyleTag({ content });
    return await page.evaluate(
      ({ rootAttributes, scopes, specimen }) => {
        for (const [name, value] of Object.entries(rootAttributes)) {
          document.documentElement.setAttribute(name, value);
        }
        const attributesOf: Record<string, Record<string, string>> = {
          outer: {},
          vertical: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'plain' },
          scaled: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'scaled' },
          delta: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'lgdelta' },
          rottay: { 'data-ds-root': '', 'data-vertical': 'rottay' },
        };
        const readings: Record<string, { token: string; box: string; card: string }> = {};
        for (const id of Object.keys(scopes)) {
          const host = document.createElement('div');
          for (const [name, value] of Object.entries(attributesOf[id])) host.setAttribute(name, value);
          host.innerHTML = specimen;
          document.body.append(host);
          const radius = (probe: string) =>
            getComputedStyle(host.querySelector(`[data-probe='${probe}']`) as Element).borderTopLeftRadius;
          readings[id] = {
            token: getComputedStyle(host).getPropertyValue('--ds-radius-lg').trim(),
            box: radius('box'),
            card: radius('card'),
          };
          host.remove();
        }
        return readings;
      },
      { rootAttributes: outer.rootAttributes, scopes: SCOPES, specimen },
    ) as Record<ScopeId, Reading>;
  } finally {
    await browser.close();
  }
}

describe('the radius chain re-resolves at every scope that moves an operand', () => {
  let readings: Record<ScopeId, Reading>;

  beforeAll(async () => {
    readings = await measure();
  }, 120_000);

  it('records the scene', () => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(readings, null, 2));
    expect(readings.outer.box).not.toBe('0px');
  });

  it('a nested scope that only inherits paints the vertical default', () => {
    expect(readings.vertical).toEqual(readings.outer);
  });

  it('a nested radius-scale decision moves the painted Box corner', () => {
    expect(readings.scaled.token).toBe('calc(12px * 1.2)');
    expect(readings.scaled.box).toBe('14.4px');
    expect(readings.outer.box).toBe('9.6px');
  });

  it('a delta-only lg operand moves the step under the inherited scale', () => {
    expect(readings.delta.token).toBe('calc(8px * 0.8)');
    expect(readings.delta.box).toBe('6.4px');
  });

  it('a first-party vertical nested under another keeps its own dial', () => {
    expect(readings.rottay.token).toBe('calc(12px * 1)');
    expect(readings.rottay.box).toBe('12px');
  });
});

/**
 * A root alias re-resolves in every scope that states one of its operands.
 *
 * Read in a real Chromium page, twice: once with the emitted sheets and once
 * with the same sheets stripped of the restated root aliases (the emission
 * before this mechanism, radius steps kept). An outer bithire document, nested
 * scopes under it.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { resolvedBaseCss } from '@tests/support/family-causality';
import { compileThemeIntent, mountTenantTheme, staticThemeIntent } from '@/entrypoints/server';
import ModernCard from '@/components/primitives/display/card/engines/modern';
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '@/infrastructure/compilers/runtime/tenant-css/artifact-renderer';

import { emitTenantArtifactCss, type TenantArtifactComposition } from '../..';
import { ROOT_ALIASES } from '../root-aliases';

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
  throw new Error('root aliases: no Playwright chromium is resolvable');
}

const ROW = new Map(ROOT_ALIASES.map(([name, value]) => [`  ${name}: ${value};`, name]));
const RADIUS_STEP = /^--ds-radius-(sm|md|lg|xl)$/;

/** The same sheet without the restated root aliases a block does not itself state. */
function beforeMechanism(css: string, own: ReadonlySet<string>): string {
  return css
    .split('\n')
    .filter((line) => {
      const name = ROW.get(line);
      return name === undefined || own.has(name) || RADIUS_STEP.test(name);
    })
    .join('\n');
}

function compiledNames(slug: 'bithire' | 'rottay'): Set<string> {
  const { compiled } = compileThemeIntent(staticThemeIntent(slug));
  return new Set([
    ...Object.keys(compiled.cssVariables),
    ...compiled.modeBlocks.flatMap((block) => Object.keys(block.cssVariables)),
    ...(compiled.contrastBlocks ?? []).flatMap((block) => Object.keys(block.cssVariables)),
    ...Object.keys(compiled.densityScopeBlock?.cssVariables ?? {}),
  ]);
}

function firstPartyArtifact(slug: 'bithire' | 'rottay'): string {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === slug);
  if (!spec) throw new Error(`root aliases: no first-party spec for ${slug}`);
  return renderFirstPartyArtifact({ spec }).css;
}

const DELTAS: Record<string, Omit<TenantArtifactComposition, 'verticalKey' | 'slug' | 'compilerVersion' | 'digest'>> = {
  plain: { variables: {} },
  scaled: { variables: { '--ds-radius-scale': '1.2' } },
  primary: { variables: { '--ds-color-primary': 'rgb(1, 2, 3)' } },
  typed: { variables: { '--ds-type-scale': '1.5' } },
  darkonly: { variables: {}, modeDeltas: [{ mode: 'dark', variables: { '--ds-color-primary': 'rgb(4, 5, 6)' } }] },
};

function tenantArtifact(slug: string): string {
  return emitTenantArtifactCss({
    verticalKey: 'bithire',
    slug,
    compilerVersion: 'test',
    digest: 'test',
    ...DELTAS[slug],
  });
}

function deltaNames(slug: string): Set<string> {
  const delta = DELTAS[slug];
  return new Set([
    ...Object.keys(delta.variables),
    ...(delta.modeDeltas ?? []).flatMap((block) => Object.keys(block.variables)),
  ]);
}

type Reading = { card: string; checkbox: string; fontSize: string; cardToken: string };
type Scene = Record<string, Reading>;

const HOSTS: Record<string, Record<string, string>> = {
  outer: {},
  plain: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'plain' },
  scaled: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'scaled' },
  primary: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'primary' },
  typed: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'typed' },
  darkonly: { 'data-ds-root': '', 'data-vertical': 'bithire', 'data-tenant': 'darkonly', 'data-theme': 'dark' },
  rottay: { 'data-ds-root': '', 'data-vertical': 'rottay' },
};

async function measure(browser: SceneBrowser, sheets: readonly string[], rootAttributes: Record<string, string>): Promise<Scene> {
  const specimen = renderToStaticMarkup(<ModernCard data-probe="card">card</ModernCard>);
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><head></head><body></body></html>');
  for (const content of sheets) await page.addStyleTag({ content });
  return page.evaluate(
    ({ rootAttributes, hosts, specimen }) => {
      for (const [name, value] of Object.entries(rootAttributes)) document.documentElement.setAttribute(name, value);
      const readings: Record<string, { card: string; checkbox: string; fontSize: string; cardToken: string }> = {};
      for (const [id, attributes] of Object.entries(hosts)) {
        const host = document.createElement('div');
        for (const [name, value] of Object.entries(attributes)) host.setAttribute(name, value);
        host.innerHTML = specimen;
        document.body.append(host);
        const style = getComputedStyle(host);
        readings[id] = {
          card: getComputedStyle(host.querySelector("[data-probe='card']") as Element).borderTopLeftRadius,
          cardToken: style.getPropertyValue('--ds-card-radius').trim(),
          checkbox: style.getPropertyValue('--ds-checkbox-primary-bg').trim(),
          fontSize: style.getPropertyValue('--ds-font-size-md').replace(/\s+/g, '').trim(),
        };
        host.remove();
      }
      return readings;
    },
    { rootAttributes, hosts: HOSTS, specimen },
  ) as Promise<Scene>;
}

describe('a root alias re-resolves at every scope that states an operand', () => {
  let after: Scene;
  let before: Scene;

  beforeAll(async () => {
    const outer = await mountTenantTheme(staticThemeIntent('bithire'));
    const tenants = Object.keys(DELTAS);
    const current = [
      resolvedBaseCss(),
      firstPartyArtifact('bithire'),
      ...tenants.map(tenantArtifact),
      firstPartyArtifact('rottay'),
    ];
    const previous = [
      resolvedBaseCss(),
      beforeMechanism(firstPartyArtifact('bithire'), compiledNames('bithire')),
      ...tenants.map((slug) => beforeMechanism(tenantArtifact(slug), deltaNames(slug))),
      beforeMechanism(firstPartyArtifact('rottay'), compiledNames('rottay')),
    ];
    const browser = await launch();
    try {
      after = await measure(browser, current, outer.rootAttributes);
      before = await measure(browser, previous, outer.rootAttributes);
    } finally {
      await browser.close();
    }
  }, 180_000);

  it('records the scene', () => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ before, after }, null, 2));
    expect(after.outer.card).not.toBe('0px');
  });

  it('a scope that moves no operand paints what it inherits, before and after', () => {
    expect(after.plain).toEqual(after.outer);
    expect(before.plain).toEqual(before.outer);
    expect(after.outer).toEqual(before.outer);
  });

  it("the Card's aliased corner re-resolves under a nested radius-scale delta", () => {
    expect(before.scaled.card).toBe(before.outer.card);
    expect(after.scaled.card).toBe('14.4px');
    expect(after.outer.card).toBe('9.6px');
  });

  it('a nested primary delta reaches an alias of the primary', () => {
    expect(before.primary.checkbox).toBe(before.outer.checkbox);
    expect(after.primary.checkbox).toBe('rgb(1, 2, 3)');
  });

  it('a type-scale delta re-resolves the font-size ramp', () => {
    expect(before.typed.fontSize).toBe(before.outer.fontSize);
    expect(after.typed.fontSize).not.toBe(after.outer.fontSize);
    expect(after.typed.fontSize).toContain('1.5');
  });

  it('a mode-only delta re-resolves through the base rule', () => {
    expect(before.darkonly.checkbox).not.toBe('rgb(4, 5, 6)');
    expect(after.darkonly.checkbox).toBe('rgb(4, 5, 6)');
  });

  it('a first-party vertical nested under another paints its own Card corner', () => {
    expect(after.rottay.card).toBe('12px');
    expect(before.rottay.card).toBe(before.outer.card);
  });
});

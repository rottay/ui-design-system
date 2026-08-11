/**
 * @fileoverview Emergency-token precedence (FASE 5, leg 3).
 *
 * The ThemeProvider ships a hardcoded last-resort token block. Its fallback
 * chain is: requested tenant CSS -> vertical default tenant CSS ->
 * DEFAULT_TENANT CSS -> emergency inline tokens. The block exists so a total
 * stylesheet failure renders something legible instead of a blank UI.
 *
 * THE QUESTION: can that block ever win while a real artifact is present? If
 * it could, every tenant on that surface would silently paint the package
 * baseline and the visual system would be lying about who owns the paint.
 *
 * THE MEASURED ANSWER, and it is more precise than "no":
 *
 *   The protection is the STATE MACHINE, not the cascade.
 *
 * The block is `:root`-scoped and injected as a runtime `<style>` element, so
 * it lands LAST in document order. Against an artifact declaration of equal
 * specificity -- also `:root` -- last one wins, and that is the emergency
 * block. Only the artifact channels written under a TENANT-SCOPED selector
 * outrank it on specificity alone.
 *
 * So the two legs are not equal partners:
 *   - the state gate holds universally: the block is injected only after every
 *     stylesheet has failed, and only once;
 *   - the cascade backs it up only for the tenant-scoped subset.
 *
 * This file asserts the guarantee that is real, proves the block is entirely
 * redundant when artifacts load, and PINS the residual exposure by name
 * instead of hiding it behind a green tick. If the state gate ever regresses,
 * the pinned channels below are exactly what flips to the hardcoded baseline
 * -- including the whole spacing scale.
 *
 * Read as text, not imported: `ROTTAY_EMERGENCY_TOKENS` is module-local by
 * design and this contract must not force it public. Reading the source is the
 * same idiom the skin contracts use, and it leaves the provider untouched.
 *
 * NOT DUPLICATED HERE. `provider/tests/theme-provider.test.tsx` already proves
 * the injection fires when every stylesheet fails. This file owns the cascade
 * question that one cannot answer.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { SHIPPED_BUNDLES, loadBundle } from '../../../../quality/no-loss/index';

const PROVIDER = resolve(
  process.cwd(),
  'src/infrastructure/runtime/theming/composition/react/provider/index.tsx'
);

const providerSource = () => readFileSync(PROVIDER, 'utf8');

/** The literal block, lifted from the provider source. */
function emergencyBlock(): string {
  const match = providerSource().match(/const ROTTAY_EMERGENCY_TOKENS = `([\s\S]*?)`;/);
  if (!match) throw new Error('ROTTAY_EMERGENCY_TOKENS not found in the provider');
  return match[1];
}

function emergencyChannels(): string[] {
  const out: string[] = [];
  postcss.parse(emergencyBlock()).walkDecls((declaration) => {
    if (declaration.prop.startsWith('--')) out.push(declaration.prop);
  });
  return out;
}

const VERTICALS = Object.entries(SHIPPED_BUNDLES) as [keyof typeof SHIPPED_BUNDLES, string][];

/**
 * Emergency channels each shipped artifact declares ONLY at `:root`. Equal
 * specificity means document order decides, and the runtime `<style>` is last
 * -- so these are the channels the cascade does NOT protect.
 *
 * PINNED BY NAME, not by count. It was a decrease-only ceiling until a single
 * night moved evnto's membership twice and its count once: `--ds-color-border`
 * LEFT the set (the vertical finally seeds its own borders) while
 * `--ds-radius-sm`/`-md` ENTERED it, and a ceiling of 9 read that as +1. A
 * count cannot tell a repair from a regression when they arrive together.
 *
 * The radius pair entered for a reason that is not a defect: the tenant used to
 * emit `--ds-radius-sm: 6px` flat under its own scope, and now emits
 * `--ds-radius-sm-base: 6px` there while `:root` carries the
 * `calc(base * --ds-radius-scale)` that makes the tenant dial reach it. Same
 * painted radius, one rung less cascade cover. Re-authoring the flat channel
 * inside the tenant scope would buy that cover back by re-breaking the dial.
 */
const ROOT_ONLY_EXPOSURE: Record<string, string[]> = {
  bithire: [
    '--ds-color-border',
    '--ds-text-primary',
    '--ds-text-secondary',
    '--ds-spacing-xs',
    '--ds-spacing-sm',
    '--ds-spacing-md',
    '--ds-spacing-lg',
    '--ds-radius-sm',
    '--ds-radius-md',
  ],
  platform: [
    '--ds-color-bg-primary',
    '--ds-color-border',
    '--ds-color-text-primary',
    '--ds-color-text-secondary',
    '--ds-text-primary',
    '--ds-text-secondary',
    '--ds-spacing-xs',
    '--ds-spacing-sm',
    '--ds-spacing-md',
    '--ds-spacing-lg',
    '--ds-radius-sm',
    '--ds-radius-md',
  ],
  evnto: [
    '--ds-color-text-primary',
    '--ds-color-text-secondary',
    '--ds-text-primary',
    '--ds-text-secondary',
    '--ds-spacing-xs',
    '--ds-spacing-sm',
    '--ds-spacing-md',
    '--ds-spacing-lg',
    '--ds-radius-sm',
    '--ds-radius-md',
  ],
};

describe('emergency tokens: POSITIVE control (the block is real)', () => {
  it('declares a substantial `:root` token set, so the legs below are not vacuous', () => {
    const channels = emergencyChannels();
    // A zero here would mean the extraction rotted and every assertion in this
    // file would pass while proving nothing.
    expect(channels.length).toBeGreaterThanOrEqual(15);
    expect(channels).toContain('--ds-color-primary');
    expect(channels).toContain('--ds-spacing-md');
    expect(emergencyBlock()).toMatch(/:root\s*\{/);
  });
});

describe('emergency tokens: THE REAL GUARANTEE is the state gate', () => {
  it('injects only after every stylesheet has failed, and only once', () => {
    const source = providerSource();
    // Terminal branch: reached when the default tenant has also failed.
    expect(source).toMatch(/Even the default tenant failed/);
    expect(source).toMatch(/injectEmergencyTokens\(\)/);
    // Idempotence guard: a second pass cannot append a second block, which
    // would otherwise stack another last-in-document-order authority.
    expect(source).toMatch(/if \(emergencyTokensInjected\) return;/);
  });
});

describe('emergency tokens: the block is fully REDUNDANT when artifacts load', () => {
  it.each(VERTICALS)('%s authors every channel the emergency block declares', (_v, bundlePath) => {
    const bundle = loadBundle(bundlePath);
    const missing = emergencyChannels().filter((channel) => !bundle.sites.has(channel));
    // Nothing in the block is the sole author of anything: with the artifact
    // present, deleting the block outright would change no resolved value.
    expect(missing).toEqual([]);
  });
});

describe('emergency tokens: residual CASCADE exposure is pinned, not hidden', () => {
  it.each(VERTICALS)('%s exposes exactly the pinned `:root`-only channels', (vertical, bundlePath) => {
    const bundle = loadBundle(bundlePath);
    const rootOnly = emergencyChannels().filter((channel) => {
      const sites = bundle.sites.get(channel);
      return !!sites?.length && !sites.some((site) => site.tenantScoped);
    });
    // Non-vacuity: the overlap is real, so a passing pin is a measurement
    // rather than an empty set trivially satisfying it.
    expect(rootOnly.length).toBeGreaterThan(0);
    expect(rootOnly.sort()).toEqual([...ROOT_ONLY_EXPOSURE[vertical]].sort());
    // The whole spacing scale sits in this set in every vertical: if the state
    // gate regresses, layout rhythm is what breaks first.
    expect(rootOnly).toContain('--ds-spacing-md');
  });
});

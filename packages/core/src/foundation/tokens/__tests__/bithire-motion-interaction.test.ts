/**
 * Motion vocabulary + interaction-layer gate (WO-DES-11).
 *
 * Two halves of the Evidence Ledger interaction layer:
 *
 *  1. The brand compiler must emit the closed §2.6 motion vocabulary as tokens —
 *     three durations (--ds-motion-instant/calm/deliberate) and two easing
 *     families (--ds-ease-standard/--ds-ease-exit). These are the ONLY sanctioned
 *     durations; app-side raw ms literals bind to them. `calm` tracks the theme's
 *     own entranceDuration (200ms for bithire) per design-language §2.6.
 *
 *  2. The generated bithire artifact must carry the ledger tag/badge/tooltip
 *     defaults (§8.2): tags as tint-toned pills at detail size, counting badges
 *     in tabular figures, tooltips as a level-2 paper overlay, and a
 *     reduced-motion block that zeroes the motion tokens. This half asserts the
 *     committed artifact so a stale/unsynced release cannot ship a mixed
 *     interaction identity.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { bithireBrandTheme } from '../ts/presentation/brand-themes/bithire';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ARTIFACT_PATH = resolve(TEST_DIR, '..', 'css/facade/artifacts/bithire/index.css');

describe('bithire brand compiler emits the §2.6 motion vocabulary', () => {
  const { cssVariables } = compileBrandTheme({
    brandTheme: bithireBrandTheme,
    tenantSlug: 'bithire',
  });

  it('emits the three closed duration tokens (120/200/320ms)', () => {
    expect(cssVariables['--ds-motion-instant']).toBe('120ms');
    expect(cssVariables['--ds-motion-calm']).toBe('200ms');
    expect(cssVariables['--ds-motion-deliberate']).toBe('320ms');
  });

  it('binds --ds-motion-calm to the theme entranceDuration', () => {
    expect(cssVariables['--ds-motion-calm']).toBe(
      `${bithireBrandTheme.motion?.entranceDuration ?? 200}ms`,
    );
  });

  it('emits the two easing families of §2.6', () => {
    expect(cssVariables['--ds-ease-standard']).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(cssVariables['--ds-ease-exit']).toBe('cubic-bezier(0.4, 0, 1, 1)');
  });
});

describe('bithire artifact carries the ledger interaction defaults (§8.2)', () => {
  const artifact = readFileSync(ARTIFACT_PATH, 'utf8');

  it('projects the compiled motion tokens into the artifact (parity)', () => {
    // The compiled block must carry the motion vocabulary; otherwise a consumer
    // reading var(--ds-motion-calm) would fall through to its literal fallback.
    expect(artifact).toContain('--ds-motion-instant: 120ms');
    expect(artifact).toContain('--ds-motion-calm: 200ms');
    expect(artifact).toContain('--ds-motion-deliberate: 320ms');
    expect(artifact).toContain('--ds-ease-standard: cubic-bezier(0.2, 0, 0, 1)');
  });

  it('styles tags as tint-toned pills at detail size, sentence case', () => {
    expect(artifact).toContain('border-radius: var(--ds-tag-radius-full, 9999px)');
    expect(artifact).toContain('font-size: var(--ds-text-detail-size, 0.75rem)');
    expect(artifact).toContain('text-transform: none');
    // Tone binding: bg = tint-8, border = tint-24 of the tone role.
    expect(artifact).toContain('background: var(--ds-tint-success-8)');
    expect(artifact).toContain('border-color: var(--ds-tint-success-24)');
  });

  it('renders counting badges in tabular figures', () => {
    expect(artifact).toMatch(/\.ant-badge-count[\s\S]*?font-variant-numeric: tabular-nums/);
  });

  it('renders the tooltip as a level-2 paper overlay', () => {
    expect(artifact).toContain('.ant-tooltip .ant-tooltip-inner');
    expect(artifact).toContain('background: var(--ds-color-bg-primary, #FFFFFF)');
    expect(artifact).toContain('border-radius: var(--ds-radius-sm, 6px)');
  });

  it('zeroes the motion tokens under reduced motion', () => {
    expect(artifact).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?--ds-motion-calm: 0ms/,
    );
  });
});

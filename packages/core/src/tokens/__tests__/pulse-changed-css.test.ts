/**
 * .ds-pulse-changed CSS contract (WO-CRA-07).
 *
 * The reduced-motion guard and the never-loop contract for the data-changed
 * pulse are pure CSS (`foundation/animations/transitions.css`), so they
 * cannot be observed through a jsdom/happy-dom rendered-DOM assertion the
 * way inline-style-driven components can. This reads the source file
 * directly and fails if the `@media (prefers-reduced-motion: reduce)`
 * override, the `--ds-effect-intensity` tunability, or the single-iteration
 * (never `infinite`) contract is ever removed.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const TRANSITIONS_CSS_PATH = resolve(TEST_DIR, '..', 'css/foundation/animations/transitions.css');
const css = readFileSync(TRANSITIONS_CSS_PATH, 'utf-8');

describe('.ds-pulse-changed CSS contract', () => {
  it('defines the .ds-pulse-changed utility and its keyframe', () => {
    expect(css).toContain('.ds-pulse-changed');
    expect(css).toContain('@keyframes ds-pulse-changed-flash');
  });

  it('rides the --ds-motion-* canon, not a raw duration/easing literal', () => {
    const ruleMatch = css.match(/\.ds-pulse-changed\s*\{[^}]*\}/);
    expect(ruleMatch).toBeTruthy();
    const rule = ruleMatch?.[0] ?? '';
    expect(rule).toMatch(/animation-duration:\s*var\(--ds-motion-/);
    expect(rule).toMatch(/animation-timing-function:\s*var\(--ds-motion-/);
    expect(rule).not.toMatch(/\d+m?s\b/); // no raw "200ms" / "0.2s" style literal
    expect(rule).not.toContain('cubic-bezier(');
  });

  it('scales its flash alpha by --ds-effect-intensity so a zero-decoration tenant collapses it', () => {
    const keyframeMatch = css.match(/@keyframes ds-pulse-changed-flash\s*\{[\s\S]*?\n\}/);
    expect(keyframeMatch).toBeTruthy();
    expect(keyframeMatch?.[0]).toContain('var(--ds-effect-intensity');
  });

  it('never sets an infinite (or any non-default) iteration count -- the flash must fire exactly once', () => {
    const ruleMatch = css.match(/\.ds-pulse-changed\s*\{[^}]*\}/);
    const rule = ruleMatch?.[0] ?? '';
    expect(rule).not.toMatch(/animation-iteration-count/);
    expect(rule).not.toContain('infinite');
  });

  it('disables the animation entirely under prefers-reduced-motion', () => {
    const reducedMotionSection = css.slice(css.lastIndexOf('DATA-CHANGED PULSE'));
    const mediaMatch = reducedMotionSection.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.ds-pulse-changed\s*\{\s*animation:\s*none;/
    );
    expect(mediaMatch).toBeTruthy();
  });
});

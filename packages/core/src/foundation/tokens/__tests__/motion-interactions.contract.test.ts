import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const CSS_ROOT = resolve(TEST_DIR, '..', 'css');

function read(rel: string): string {
  return readFileSync(resolve(CSS_ROOT, rel), 'utf8');
}

/**
 * Layout properties that trigger reflow. A motion keyframe must never animate
 * one (modern engine spec section 2 / WO-CRA-06 -- transform/opacity only).
 */
const LAYOUT_PROPS = ['top', 'left', 'width', 'height', 'margin', 'padding'];

/** Extract the body text of every `@keyframes` block via brace matching. */
function keyframeBodies(css: string): string[] {
  const bodies: string[] = [];
  const re = /@keyframes\s+[\w-]+\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    const start = i;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') depth -= 1;
      i += 1;
    }
    bodies.push(css.slice(start, i - 1));
    re.lastIndex = i;
  }
  return bodies;
}

function declaresLayoutProperty(body: string): boolean {
  return LAYOUT_PROPS.some((prop) =>
    new RegExp(`(^|[\\s;{])${prop}\\s*:`, 'i').test(body),
  );
}

describe('collection.insert stagger preset', () => {
  const css = read('foundation/animations/collection-stagger.css');

  it('defines a ds-namespaced, compositor-only insert keyframe', () => {
    expect(css).toContain('@keyframes ds-collection-insert');
    for (const body of keyframeBodies(css)) {
      expect(declaresLayoutProperty(body)).toBe(false);
    }
  });

  it('clamps the per-item delay to the recipe cap', () => {
    expect(css).toMatch(/animation-delay:\s*min\(/);
    expect(css).toContain('var(--ds-stagger-index');
    expect(css).toContain('var(--ds-stagger-step)');
    expect(css).toContain('var(--ds-stagger-max)');
  });

  it('rides the motion canon and zeroes to final-state under reduced motion', () => {
    expect(css).toMatch(/animation-duration:\s*var\(--ds-motion-/);
    // no raw ms/s literal drives the animation timing
    expect(css).not.toMatch(/animation-duration:\s*\d/);
    const reduced = css.slice(css.indexOf('prefers-reduced-motion: reduce'));
    expect(reduced).toContain('animation: none');
  });
});

describe('legacy duration aliases drain onto the canonical cadence', () => {
  const css = read('foundation/animations/transitions.css');

  it('keeps the unscoped and legacy fast step at the same 120ms authority', () => {
    expect(css).toContain('--ds-motion-instant: 120ms');
    expect(css).toContain(
      '--duration-fastest: var(--ds-motion-instant, 120ms)',
    );
    expect(css).toContain('--duration-faster: var(--ds-motion-fast, 120ms)');
  });

  it('forces both canonical and compatibility duration families to zero when reduced', () => {
    const reduced = css.slice(
      css.indexOf('@media (prefers-reduced-motion: reduce)'),
    );
    expect(reduced).toContain('--ds-motion-instant: 0s !important');
    expect(reduced).toContain('--ds-duration-fast: 0s');
  });
});

describe('modern skin micro-interactions honor reduced motion', () => {
  const checkbox = read('runtime/engines/modern/skin/checkbox.css');
  const select = read('runtime/engines/modern/skin/select.css');
  const switchCss = read('runtime/engines/modern/skin/switch.css');

  it('checkbox settle is a compositor-only keyframe with a reduced-motion guard', () => {
    expect(checkbox).toContain('@keyframes ds-checkbox-settle');
    expect(checkbox).toContain('animation: ds-checkbox-settle');
    for (const body of keyframeBodies(checkbox)) {
      expect(declaresLayoutProperty(body)).toBe(false);
    }
    const reduced = checkbox.slice(checkbox.indexOf('prefers-reduced-motion: reduce'));
    expect(reduced).toContain('animation: none');
  });

  it('press-scale extends the shared interaction-state token, not a literal', () => {
    expect(checkbox).toContain(':active:not([data-disabled=\'true\'])');
    expect(checkbox).toContain('scale(var(--ds-state-press-scale))');
    expect(switchCss).toContain('scale(var(--ds-state-press-scale))');
  });

  it('select open-tick transitions ride the motion canon and never animate `all`', () => {
    // arrow rotation + trigger state shifts use --ds-motion-fast, no raw times
    expect(select).toMatch(/transition:[\s\S]*?transform var\(--ds-motion-fast/);
    expect(select).toMatch(/transition:[\s\S]*?var\(--ds-motion-fast(?:,[^)]+)?\)/);
    expect(select).not.toMatch(/transition:[^;]*\ball\b/);
    // no raw ms/s literal inside any transition value
    expect(select.replace(/var\(--ds-motion-[^)]+\)/g, '')).not.toMatch(/transition:[^;]*\d+m?s\b/);
  });
});

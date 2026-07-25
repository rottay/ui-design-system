/**
 * Result modern skin -- slot-confinement guard (K1 sighted-review regression).
 *
 * The modern Button wraps its label in `<span data-part="content">`. A bare
 * DESCENDANT part selector in skin/result.css (`.rottay-result--modern ...
 * [data-part='content']`) repainted that span with Result body styling
 * (text-secondary + body typography) -- dark text on the primary-filled
 * button, illegible (~1:1 contrast) under The Management DB appearance.
 *
 * Every part selector in the skin must therefore be a DIRECT CHILD (`>`) of
 * the Result root, so paint can never leak into components slotted into
 * `extra`/`children`. This file reads the skin source and rejects any
 * descendant-shaped selector. The DOM-level companion assertion (the Button
 * really does stamp the colliding part) lives in Result.modern-engine.test.tsx.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/result.css'),
  'utf8',
);

function stripBlockComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Every selector line in the skin (left of the opening brace). */
function selectorLines(css: string): string[] {
  return stripBlockComments(css)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('{') || line.endsWith(','))
    .map((line) => line.replace(/[{,]\s*$/, '').trim())
    .filter((line) => line.length > 0 && !line.startsWith('@'));
}

describe('Result modern skin slot confinement', () => {
  it('has no bare descendant part selectors (every part match is a direct child)', () => {
    const selectors = selectorLines(skin);
    expect(selectors.length).toBeGreaterThan(0);

    for (const selector of selectors) {
      // A descendant combinator (whitespace not part of a `>` relationship)
      // between the Result scope and a [data-part=...] target is the leak
      // shape that repainted slotted Buttons.
      const descendantLeak = /\.rottay-result--modern(?:\[[^\]]*\])*\s+\[data-part=/;
      expect(descendantLeak.test(selector), `descendant leak in selector: ${selector}`).toBe(false);
    }
  });

  it('paints the engine-owned parts as direct children of the root', () => {
    // The engine renders icon/title/description/extra/content as direct
    // children of the root, so child scoping loses no intended paint.
    for (const part of ['icon', 'title', 'description', 'extra', 'content']) {
      expect(skin).toContain(`[data-part='root'] > [data-part='${part}']`);
    }
  });
});

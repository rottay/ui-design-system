/**
 * Result Modern skin source guards for slot confinement and title role weight.
 *
 * The modern Button wraps its label in `<span data-part="content">`. A bare
 * DESCENDANT part selector in skin/result/index.css (`.rottay-result--modern ...
 * [data-part='content']`) repainted that span with Result body styling
 * (text-secondary + body typography) -- dark text on the primary-filled
 * button, illegible (~1:1 contrast) under The Management DB appearance.
 *
 * Every part selector in the skin must therefore be a DIRECT CHILD (`>`) of
 * the Result root, so paint can never leak into components slotted into
 * `extra`/`children`. This file reads the skin source and rejects any
 * descendant-shaped selector. These are source checks, not computed-style proof.
 * The DOM-level companion assertion (the Button
 * really does stamp the colliding part) lives in Result.modern-engine.test.tsx.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/result/index.css'),
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
    const parts = ['icon', 'title', 'description', 'extra', 'content'];
    for (const part of parts) {
      expect(skin).toContain(`[data-part='root'] > [data-part='${part}']`);
    }
  });
});

describe('Result modern skin title role weight', () => {
  it('reads the section-title weight with the existing semibold fallback', () => {
    const title = stripBlockComments(skin).match(
      /\.rottay-result--modern\.rottay-result--modern\[data-part='root'\] > \[data-part='title'\]\[data-part='title'\]\s*\{([^}]*)\}/,
    );
    expect(title, 'the engine-owned title rule must exist').not.toBeNull();
    const declarations = title?.at(1) ?? '';
    const weights = Array.from(declarations.matchAll(/(?:^|;)\s*font-weight\s*:\s*([^;]+);/g), (match) => match.at(1)?.trim());
    expect(weights).toEqual([
      'var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold))',
    ]);
  });

  it('keeps the HTTP status-code weight bold and independent of the title role', () => {
    const statusCode = stripBlockComments(skin).match(
      /\.rottay-result--modern\.rottay-result--modern\[data-part='root'\] > \[data-part='icon'\] > \[data-part='status-code'\]\[data-part='status-code'\]\s*\{([^}]*)\}/,
    );
    expect(statusCode, 'the built-in status-code rule must exist').not.toBeNull();
    const declarations = statusCode?.at(1) ?? '';
    const weights = Array.from(declarations.matchAll(/(?:^|;)\s*font-weight\s*:\s*([^;]+);/g), (match) => match.at(1)?.trim());
    expect(weights).toEqual(['var(--ds-font-weight-bold)']);
    expect(declarations).not.toContain('--ds-type-section-title-font-weight');
  });
});

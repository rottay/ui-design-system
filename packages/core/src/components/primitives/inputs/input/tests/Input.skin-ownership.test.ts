/**
 * Input modern — single paint owner contract (R2+R3, BATCH C).
 *
 * `input-residual.css` used to re-paint parts `input.css` already owns and,
 * being imported later in the same cascade layer at equal or higher
 * specificity, silently won — most critically overriding the W8 contrast-law
 * inks of `count` / `error-message` with raw muted/error hues. The residual
 * file is drained: these pins keep it that way.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const SKIN_DIR = join(
  here,
  '../../../../../foundation/tokens/css/runtime/engines/modern/skin'
);
const inputSkin = readFileSync(join(SKIN_DIR, 'input.css'), 'utf8');
const residual = readFileSync(join(SKIN_DIR, 'input-residual.css'), 'utf8');

/** Rules (selector + body) of a stylesheet, comments stripped. */
function cssRules(css: string): Array<{ selector: string; body: string }> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noComments)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2].trim() });
  }
  return rules;
}

describe('Input modern skin — single paint owner', () => {
  it('the drained residual file declares no modern Input rule', () => {
    expect(cssRules(residual)).toEqual([]);
  });

  it('input.css is the sole owner of the parts the residual file re-painted', () => {
    // Contrast-law inks (W8): mixed muted→primary counter, darkened state hues.
    expect(inputSkin).toMatch(
      /\[data-part='count'\][^{]*\{[^}]*color-mix\(in srgb, var\(--ds-input-count-color/
    );
    expect(inputSkin).toMatch(/\[data-part='error-message'\]/);
    // Framed ghost action: border + radius + hover + focus ring + active scale.
    expect(inputSkin).toMatch(/\[data-part='clear-button'\][^{]*\{[^}]*border-radius/);
    expect(inputSkin).toMatch(/\[data-part='clear-button'\]:focus-visible/);
    // Affixes and the chrome-free inner control.
    expect(inputSkin).toMatch(/\[data-part='affix-prefix'\]/);
    expect(inputSkin).toMatch(/> \.rottay-input__control/);
  });

  it('no dead state attributes survive in the ownership story', () => {
    // The engine stamps data-invalid / data-count-state — never data-error.
    expect(inputSkin).not.toContain("[data-error='true']");
  });
});

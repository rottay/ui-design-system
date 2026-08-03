/**
 * ListToolbar modern — toolbar search ownership contract (R2+R3, BATCH C).
 *
 * The toolbar search used to receive an inline `searchInputStyle(...)` object
 * from the engine: the last inline paint in the pattern (background, border
 * colour, ink, shadow and radius on the field wrapper, plus the W10 control
 * geometry). Pass 1 moves all of it into the modern skin: the `--ds-input-*`
 * channels cascade from the search section, the wrapper surface channels are
 * painted by a skin rule, and the control height/type law lives next to the
 * other toolbar controls. The shared `foundation/tokens` helper stays for the
 * frozen classic engine, untouched.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const MODERN_ENGINE = readFileSync(
  resolve(process.cwd(), 'src/ui/patterns/data/list-toolbar/engines/modern/index.tsx'),
  'utf8'
);
const MODERN_SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar.css'
  ),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('ListToolbar modern — toolbar search is skin-owned', () => {
  it('the engine no longer injects the inline search style object', () => {
    expect(MODERN_ENGINE).not.toContain('searchInputStyle');
    expect(MODERN_ENGINE).not.toContain('CONTROL_SIZE');
  });

  it('the skin cascades the search --ds-input-* channels from the section', () => {
    const sectionRules = MODERN_SKIN.match(
      /\.ds-list-toolbar__search-section\[data-part=['"]search-section['"]\][^{]*\{[^}]*\}/g
    ) ?? [];
    const channels = sectionRules.join('\n');
    for (const channel of [
      '--ds-input-bg',
      '--ds-input-border',
      '--ds-input-color-placeholder',
      '--ds-input-addon-color',
      '--ds-input-clear-color',
    ]) {
      expect(channels).toContain(`${channel}:`);
    }
  });

  it('the skin owns the W10 control geometry law for the toolbar search', () => {
    expect(MODERN_SKIN).toMatch(
      /\.rottay-input\.rottay-input--modern\[data-part=['"]root['"]\]\s*\{[^}]*block-size:\s*var\(--ds-toolbar-search-height/
    );
    expect(MODERN_SKIN).toContain('--ds-toolbar-search-font-size');
  });

  it('the field wrapper surface channels are painted by the skin, not inline', () => {
    expect(MODERN_SKIN).toMatch(
      /\.rottay-input-field\[data-part=['"]field['"]\]\s*\{[^}]*--ds-search-bg/
    );
  });
});

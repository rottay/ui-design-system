/**
 * Flagship craft invariants for the Modern engine.
 *
 * Token-count fidelity prevents a component from becoming visually untethered;
 * these checks protect the interaction and geometry rules that must remain
 * true regardless of the tenant personality selected above them.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');

const FLAGSHIP_SKINS = [
  ['Button', 'foundation/tokens/css/runtime/engines/modern/skin/button.css'],
  ['Card', 'foundation/tokens/css/runtime/engines/modern/skin/card.css'],
  ['Typography', 'foundation/tokens/css/runtime/engines/modern/skin/typography.css'],
  ['Tabs', 'foundation/tokens/css/runtime/engines/modern/skin/tabs.css'],
  ['Tooltip', 'foundation/tokens/css/runtime/engines/modern/skin/tooltip.css'],
  ['Popover', 'foundation/tokens/css/runtime/engines/modern/skin/popover.css'],
  ['DataTable', 'foundation/tokens/css/runtime/engines/modern/skin/data-table.css'],
  [
    'DecisionComparison',
    'foundation/tokens/css/presentation/components/skin/decision-comparison.css',
  ],
] as const;

function read(relativePath: string): string {
  return readFileSync(join(SRC_ROOT, relativePath), 'utf8');
}

describe('Modern flagship craft invariants', () => {
  it.each(FLAGSHIP_SKINS)('%s never animates every property', (_name, path) => {
    const css = read(path);
    expect(css).not.toMatch(/transition(?:-property)?\s*:\s*all(?:\s|;|,)/i);
  });

  it.each(FLAGSHIP_SKINS)(
    '%s routes authored corner geometry through the radius system',
    (_name, path) => {
      const css = read(path);
      expect(css).not.toMatch(/border-radius\s*:\s*[1-9][\d.]*px\s*;/i);
    },
  );

  it.each(FLAGSHIP_SKINS)(
    '%s protects any choreography with reduced-motion behavior',
    (_name, path) => {
      const css = read(path);
      const choreographs = /(?:transition|animation(?:-name)?)\s*:/.test(css);
      if (choreographs) {
        expect(css).toContain('prefers-reduced-motion: reduce');
      }
    },
  );

  it.each(FLAGSHIP_SKINS)(
    '%s never reintroduces a colored or wide start-side accent rail',
    (_name, path) => {
      const css = read(path);
      expect(css).not.toMatch(
        /border-(?:inline-start|left)\s*:\s*(?:[2-9][\d.]*px|[^;]*(?:primary|accent|success|warning|error|info))/i,
      );
    },
  );
});

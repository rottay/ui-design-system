/**
 * Contract for the depth axis reaching eight engine-agnostic skins: each rule
 * below painted its border width as a bare `1px`, so the tenant's edge profile
 * (`--ds-edge-hairline-width` / `--ds-edge-standard-width`) moved every other
 * container while these stayed put. Each now reads its edge ROLE with the old
 * literal as the fallback, so an unset profile paints the same 1px.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = 'src/foundation/tokens/css/presentation/components/skin';

interface EdgeRule {
  readonly family: string;
  readonly selector: string;
  readonly role: 'hairline' | 'standard';
}

const RULES: readonly EdgeRule[] = [
  { family: 'activity-cards', selector: ".ds-activity-cards.ds-activity-cards[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'activity-compact', selector: ".ds-activity-compact.ds-activity-compact[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'activity-ticker', selector: ".ds-activity-ticker.ds-activity-ticker[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'activity-timeline', selector: ".ds-activity-timeline.ds-activity-timeline[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'ascii-frame', selector: '.rt-ascii-frame', role: 'hairline' },
  { family: 'terminal-block', selector: '.rt-terminal-block', role: 'hairline' },
  { family: 'code-block', selector: ".ds-code-block[data-part='root'] [data-part='copy-button']", role: 'standard' },
  { family: 'radio-group', selector: ".ds-radio-group.ds-radio-group--button [data-part='option'][data-part='option']", role: 'standard' },
];

/** The `border` declaration of the first top-level rule written with exactly this selector. */
function borderOf(family: string, selector: string): string | undefined {
  const css = readFileSync(resolve(process.cwd(), SKIN, family, 'index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  return /(?:^|;)\s*border\s*:\s*([^;]+);/.exec(body ?? '')?.[1]?.trim();
}

describe('engine-agnostic skins -- depth reach through the edge roles', () => {
  it.each(RULES)('$family paints its border width from the $role edge role', ({ family, selector, role }) => {
    const border = borderOf(family, selector);
    expect(border, `${family}: no border on ${selector}`).toBeDefined();
    expect(border?.startsWith(`var(--ds-edge-${role}-width, 1px) solid `)).toBe(true);
  });
});

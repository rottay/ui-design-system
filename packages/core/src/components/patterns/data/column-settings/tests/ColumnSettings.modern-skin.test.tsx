import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css',
  ),
  'utf8',
);

describe('ColumnSettings modern skin — the grip cursor tells the truth', () => {
  it('offers a pointer, never a drag hand, on controls that cannot be dragged', () => {
    // The grip became two explicit move-up/move-down Buttons; there is no
    // pointer-drag handler anywhere in the engine, so `grab`/`grabbing`
    // promised a gesture that does not exist.
    expect(SKIN).not.toContain('cursor: grab');
    expect(SKIN).not.toContain('cursor: grabbing');

    const grip = SKIN.slice(SKIN.indexOf("[data-part='grip'] {"));
    expect(grip.slice(0, grip.indexOf('}'))).toContain('cursor: pointer');
  });
});

describe('ColumnSettings modern skin — narrow container posture', () => {
  it('gives the column name its own line when the panel is too narrow', () => {
    // Under a coarse pointer each of the three small controls holds a 44px
    // floor; in a narrow panel that left the name ellipsed to a couple of
    // characters, and nothing in the skin reacted to the panel's own width.
    expect(SKIN).toContain('container: ds-column-settings / inline-size');

    const narrow = SKIN.slice(SKIN.indexOf('@container ds-column-settings'));
    expect(narrow).toContain('flex-wrap: wrap');
    expect(narrow).toContain('flex-basis: 100%');
  });
});

describe('ColumnSettings modern skin — the move buttons wear the Button focus signature', () => {
  const CSS = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');
  const gripRules = [...CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((match) => ({ selector: match[1].trim(), body: match[2] }))
    .filter((rule) => rule.selector.includes("[data-part='grip']"));

  it('paints no focus indicator of its own on the composed Buttons', () => {
    // A family outline tied the Button ring rule and drew a solid contour over
    // the `underline` and `glow` signatures.
    expect(gripRules.length).toBeGreaterThan(0);
    for (const rule of gripRules) {
      expect(rule.body, rule.selector).not.toMatch(/(^|[\s;])outline(-[a-z]+)?\s*:/);
      expect(rule.body, rule.selector).not.toMatch(/--ds-(button-)?focus-ring/);
    }
  });

  it('still lifts the dimmed grip to full strength under keyboard focus', () => {
    const focus = gripRules.filter((rule) => /focus-visible/.test(rule.selector));
    expect(focus.map((rule) => rule.body.trim())).toEqual(['opacity: 1;']);
  });
});

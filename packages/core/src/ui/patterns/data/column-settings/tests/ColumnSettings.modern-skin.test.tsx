import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/column-settings.css',
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

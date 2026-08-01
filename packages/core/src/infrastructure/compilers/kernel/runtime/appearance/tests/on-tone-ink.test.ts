/**
 * AUT-1 propagation contract, DB path: the on-tone inks derive AFTER the
 * Advanced merge, from the FINAL value of each `--ds-color-<tone>` channel —
 * exactly the ramp derivation's lifecycle — so a tenant that overrides a tone
 * through `tokenOverrides` drags its ink along, and a document that never
 * authors a tone emits nothing (the DS root floor decides). Same shared math
 * as the static path; drift between the two is structurally impossible.
 */
import { describe, expect, it } from 'vitest';

import { appearanceToVariables } from '..';
import {
  READABLE_INK_DARK,
  READABLE_INK_LIGHT,
} from '@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink';

describe('appearance on-tone ink emission (AUT-1, DB path)', () => {
  it('emits nothing for a document without status tones', () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: '#3A6FB0' } },
    });
    for (const role of ['success', 'warning', 'error', 'info']) {
      expect(vars[`--ds-color-on-${role}`], role).toBeUndefined();
    }
  });

  it('derives from the FINAL merged tone, so an Advanced override drags its ink', () => {
    const darkRed = appearanceToVariables({
      general: { palette: { primary: '#3A6FB0' } },
      advanced: { tokenOverrides: { '--ds-color-error': '#7f1d1d' } },
    });
    expect(darkRed['--ds-color-on-error']).toBe(READABLE_INK_LIGHT);

    const lightRed = appearanceToVariables({
      general: { palette: { primary: '#3A6FB0' } },
      advanced: { tokenOverrides: { '--ds-color-error': '#f87171' } },
    });
    expect(lightRed['--ds-color-on-error']).toBe(READABLE_INK_DARK);
  });

  it('drill: a non-hex tone value stays silent instead of guessing', () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: '#3A6FB0' } },
      advanced: {
        tokenOverrides: { '--ds-color-warning': 'var(--customer-warning)' },
      },
    });
    expect(vars['--ds-color-on-warning']).toBeUndefined();
  });

  it('emits only the overridden tone, never the whole quartet', () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: '#3A6FB0' } },
      advanced: { tokenOverrides: { '--ds-color-success': '#14532d' } },
    });
    expect(vars['--ds-color-on-success']).toBe(READABLE_INK_LIGHT);
    expect(vars['--ds-color-on-warning']).toBeUndefined();
    expect(vars['--ds-color-on-error']).toBeUndefined();
    expect(vars['--ds-color-on-info']).toBeUndefined();
  });
});

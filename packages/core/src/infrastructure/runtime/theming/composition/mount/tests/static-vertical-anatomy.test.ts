import { describe, expect, it } from 'vitest';
import { FIRST_PARTY_VERTICAL_SLUGS } from '@/foundation/contracts/kernel/verticals';
import { baselineFor } from '@/infrastructure/compilers/runtime/theme';
import * as serverDoor from '@/entrypoints/server';
import { flatThemeAnatomyAttributes, staticVerticalAnatomyAttributes } from '..';

describe('staticVerticalAnatomyAttributes', () => {
  it('is published on the server door', () => {
    expect(serverDoor.staticVerticalAnatomyAttributes).toBe(staticVerticalAnatomyAttributes);
  });

  it("projects bithire's technical-dense style selections", () => {
    expect(staticVerticalAnatomyAttributes('bithire')).toEqual({
      'data-anatomy-card': 'framed',
      'data-anatomy-table': 'zebra',
      'data-anatomy-sidebar': 'rail',
    });
  });

  it.each(['rottay', 'evnto'] as const)('stamps nothing for %s, which selects no anatomy', (vertical) => {
    expect(staticVerticalAnatomyAttributes(vertical)).toEqual({});
  });

  it.each(FIRST_PARTY_VERTICAL_SLUGS)('equals the projection of the %s baseline', (vertical) => {
    expect(staticVerticalAnatomyAttributes(vertical)).toEqual(
      flatThemeAnatomyAttributes(baselineFor(vertical, vertical)),
    );
  });
});

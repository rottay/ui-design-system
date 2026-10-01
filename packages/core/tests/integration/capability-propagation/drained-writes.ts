/**
 * @fileoverview The four static writes CAP-2 (WO-EVI-02) drained out of
 * STATIC_UNCOVERED, shared by the channel gate (`index.test.ts`) and its
 * Chromium leg (`computed-style.test.tsx`) so the two can never measure
 * different writes. Each writes under its row's catalog `keypath.brandTheme`;
 * the gate's keypath guard holds that.
 */
import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';

export const CAP2_STATIC_WRITES = {
  // CAP-2: the catalog's `keypath.brandTheme` is `modes.dark.palette.*`, and
  // the write lands in the dark MODE BLOCK, never the root -- which is why
  // this row read 0 while `compileStatic` discarded the mode blocks.
  'palette.dark-mode': (b: FlatTheme): FlatTheme => {
    const modes = { ...(b.modes ?? {}) } as Record<string, Record<string, unknown>>;
    modes.dark = {
      ...(modes.dark ?? {}),
      palette: { ...((modes.dark?.palette as Record<string, unknown>) ?? {}), primaryColor: '#C2610A' },
    };
    b.modes = modes as FlatTheme['modes'];
    return b;
  },
  // CAP-2: `pill`, not `sharp` -- bithire already states `sharp`, so a sharp
  // write writes no leaf. Since WO-DER-03 the silhouette derives at the
  // tenant rank, and `pill` moves the six button radii on all three verticals.
  'shape.button-style': (b: FlatTheme): FlatTheme => {
    b.surfaces = { ...(b.surfaces ?? {}), buttonStyle: 'pill' } as FlatTheme['surfaces'];
    return b;
  },
  // CAP-2: the `surfaces.elevation-posture` move, applied to the profile.
  // bithire states all six `expressive.profiles` keys, and an explicit axis
  // outranks the profile that would compose it, so setting the profile alone
  // moves 0 there. The explicit axes are CLEARED, the profile is written.
  'experience.profile': (b: FlatTheme): FlatTheme => {
    const expressive = { ...(b.expressive ?? {}) } as Record<string, unknown>;
    delete expressive.profiles;
    expressive.experienceProfile = 'rottay/management-editorial@1';
    b.expressive = expressive as unknown as FlatTheme['expressive'];
    return b;
  },
  // CAP-2: `inset-double`, not `hairline`: the value decides. `hairline`
  // moves 0 on every vertical; `inset-double` moves the divider pair and the
  // standard edge style on all three.
  'profiles.expressive': (b: FlatTheme): FlatTheme => {
    const expressive = { ...(b.expressive ?? {}) } as Record<string, unknown>;
    expressive.profiles = { ...((expressive.profiles as Record<string, unknown>) ?? {}), edge: 'inset-double' };
    b.expressive = expressive as unknown as FlatTheme['expressive'];
    return b;
  },
} as const satisfies Readonly<Record<string, (theme: FlatTheme) => FlatTheme>>;

/**
 * BitHire ground segment — Arabic locale (RTL).
 *
 * Sibling of `bithire/layout.tsx`, not a `[locale]` branch under it — see
 * `bithire-es/layout.tsx` and `ground/index.tsx` (`LabLocale`) for why locale
 * is a static per-segment axis in this lab, same as tenant.
 *
 * This is the harness's one COMPLETE right-to-left document: `LabGround`
 * passes `locale="ar"` into `resolveDocumentRootAttributes`, which derives
 * `dir="rtl"` from the locale itself, and the root-stamp script inside
 * `LabGround` writes it to `documentElement` first-in-body, before hydration.
 * The whole document mirrors — not a local `dir="rtl"` div wrapped around one
 * Arabic string inside an otherwise-LTR page, which is what the per-scene
 * content-torture rows exercise instead (a narrower, deliberately different
 * case: one out-of-context RTL fragment, not a full RTL reading order).
 */

import type { ReactNode } from 'react';

import { LabGround } from '../ground';

export default function BitHireArabicGroundLayout({ children }: { children: ReactNode }) {
  return (
    <LabGround tenant="bithire" locale="ar">
      {children}
    </LabGround>
  );
}

/**
 * BitHire ground segment — Spanish locale.
 *
 * Sibling of `bithire/layout.tsx`, not a `[locale]` branch under it: locale is
 * STATIC per segment for the identical reason tenant is (see `ground/index.tsx`
 * — `LabLocale`), so "no locale conditional TSX" stays visible in review. The
 * tenant (BrandTheme, artifact CSS, engine) is byte-identical to `bithire/`;
 * only the ground's `locale` input differs, which is what makes this a clean
 * test of the DS's OWN locale/translation channel rather than a second tenant
 * fixture in disguise.
 */

import type { ReactNode } from 'react';

import { LabGround } from '../ground';

export default function BitHireSpanishGroundLayout({ children }: { children: ReactNode }) {
  return (
    <LabGround tenant="bithire" locale="es">
      {children}
    </LabGround>
  );
}

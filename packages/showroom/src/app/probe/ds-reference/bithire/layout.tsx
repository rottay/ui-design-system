/**
 * BitHire ground segment — static BrandTheme.
 *
 * A layout may own the ground because the tenant is STATIC for this whole
 * segment: no searchParams are read, so there is no client-side plumbing and
 * no tenant conditional anywhere below. This file and its sibling under
 * `the-management/` are deliberately two explicit ~20-line layouts rather than
 * one `[tenant]` segment with a branch, so "no tenant conditional TSX" is
 * visible in review instead of argued.
 *
 * BitHire's artifact CSS is bundled and selects on the stamped root scope, so
 * this ground emits attributes only and never a competing visual layer.
 */

import type { ReactNode } from 'react';

import { LabGround } from '../ground';

export default function BitHireGroundLayout({ children }: { children: ReactNode }) {
  return (
    <LabGround tenant="bithire">{children}</LabGround>
  );
}

/**
 * The Management ground segment — published DB TenantThemeDocument.
 *
 * Same shape as the BitHire layout beside it, and deliberately so: the two
 * differ only in which ground they mount, which is the honest analog of two
 * deployments of one product. Every node below this point is the same shared
 * DS tree.
 *
 * This ground compiles the canonical published document server-side and
 * inlines the artifact first-in-body, which is the same path the production
 * SSR embed takes.
 */

import type { ReactNode } from 'react';

import { LabGround } from '../ground';

export default function TheManagementGroundLayout({ children }: { children: ReactNode }) {
  return (
    <LabGround tenant="themanagement">{children}</LabGround>
  );
}

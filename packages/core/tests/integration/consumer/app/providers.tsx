/**
 * The client half of the contract, and the whole of it.
 *
 * `DesignSystemProvider` carries the tenant identity and nothing else: no
 * `brandTheme`, no `tokenOverrides`, no `personality`, no `appearance`, no
 * `engine`. A code-owned vertical has no runtime visual payload, so it needs no
 * visual-authority declaration either -- omitting the prop is the honest
 * default, not a skipped proof. A custom tenant passes the typed declaration
 * `{ authority: 'compiled-artifact', artifact }`; the bare string form is
 * refused because a string carries neither coverage nor bytes.
 */
'use client';

import type { ReactNode } from 'react';
import { DesignSystemProvider } from '@rottay/design-system';

export default function Providers({ children }: { children: ReactNode }) {
  return <DesignSystemProvider tenantSlug="bithire">{children}</DesignSystemProvider>;
}

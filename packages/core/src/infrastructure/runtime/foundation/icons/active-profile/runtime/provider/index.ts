import type { ExpressiveIconProfile } from '@/foundation/tokens/ts/presentation/expressive-profiles';

import { setServerIconExpressiveProfile } from '../../foundation/read';

export function provideServerIconExpressiveProfile(
  profile: ExpressiveIconProfile | undefined,
): void {
  if (typeof window !== 'undefined') return;
  try {
    setServerIconExpressiveProfile(profile);
  } catch {
    // React has no request cache outside a Server Component render.
  }
}

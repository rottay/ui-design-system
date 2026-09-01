import * as React from 'react';
import { cache } from 'react';

import type { ExpressiveIconProfile } from '@/foundation/tokens/ts/presentation/expressive-profiles';

interface ActiveIconProfileBox {
  profile: ExpressiveIconProfile | undefined;
}

type ReactWithContext = Partial<Pick<typeof React, 'createContext' | 'useContext'>>;

const maybeCreateContext = (React as ReactWithContext).createContext;
const maybeUseContext = (React as ReactWithContext).useContext;
const serverBox = cache((): ActiveIconProfileBox => ({ profile: undefined }));

export const IconExpressiveProfileContext = maybeCreateContext
  ? maybeCreateContext<ExpressiveIconProfile | undefined>(undefined)
  : null;

export function setServerIconExpressiveProfile(
  profile: ExpressiveIconProfile | undefined,
): void {
  serverBox().profile = profile;
}

export function useActiveIconExpressiveProfile(): ExpressiveIconProfile | undefined {
  if (!IconExpressiveProfileContext || !maybeUseContext) {
    try {
      return serverBox().profile;
    } catch {
      return undefined;
    }
  }
  return maybeUseContext(IconExpressiveProfileContext);
}

/**
 * Active icon expressive profile — the RSC/SSR-safe seam (C2c).
 *
 * The generated semantic icons render in four worlds: React Server
 * Components, SSR prerender of client trees, hydration, and the live
 * client. The C2b revision used a module singleton for the client worlds;
 * that design cannot host two providers with different tenants (admin
 * preview-in-shell), leaks across sibling roots, and a concurrent
 * prerender of an uncommitted tree could clobber it. This revision removes
 * ALL module state:
 *
 * - CLIENT + SSR-OF-CLIENT-TREES: a React context. Each provider subtree
 *   carries its own profile, so nested providers (preview of tenant B
 *   inside tenant A's shell), sibling roots and concurrent SSR requests
 *   are isolated by construction, and the SSR pass reads exactly what the
 *   hydration pass reads — no mismatch source.
 * - RSC: the react-server React build does not export `createContext`, so
 *   no context can exist there. Icons rendered by Server Components read a
 *   per-request box obtained through `React.cache()`, which React scopes
 *   to the current server request — concurrent requests for different
 *   tenants each get their own box. The application fills it where it
 *   already resolves the tenant artifact for the page (the same seam that
 *   mounts the compiled CSS), via `provideServerIconExpressiveProfile`
 *   from the `/server` entrypoint.
 *
 * World selection is by CAPABILITY, not guessing: the module reads
 * `createContext`/`useContext` off the React namespace object (a namespace
 * property access cannot produce an ESM link error when the export is
 * absent, unlike a named import). In the react-server flavor they are
 * absent → the box branch is taken; in the default flavor they exist → the
 * context branch is taken. Within any single React world the branch is a
 * module-load constant, so the hook order of every component that calls
 * `useActiveIconExpressiveProfile` is invariant.
 *
 * Absent value in any world → the pre-profile role/state weight tables
 * apply unchanged, and semantic STATE weights stay supreme over any
 * posture (feedback beats decoration).
 */
import * as React from 'react';
import { cache } from 'react';

import type { ExpressiveIconProfile } from '@/foundation/tokens/ts/presentation/expressive-profiles';
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from '@/foundation/tokens/ts/presentation/expressive-profiles';

interface ActiveIconProfileBox {
  profile: ExpressiveIconProfile | undefined;
}

type ReactWithContext = Partial<
  Pick<typeof React, 'createContext' | 'useContext'>
>;

const maybeCreateContext = (React as ReactWithContext).createContext;
const maybeUseContext = (React as ReactWithContext).useContext;

/**
 * The client/SSR carrier. `null` exactly in the react-server world, where
 * the export does not exist and the per-request box is the authority.
 */
export const IconExpressiveProfileContext = maybeCreateContext
  ? maybeCreateContext<ExpressiveIconProfile | undefined>(undefined)
  : null;

/**
 * Per-request server box. `React.cache` memoizes per server request in the
 * react-server world; in the default build it is a passthrough, which is
 * harmless because that world never reads the box (context wins there).
 */
const serverBox = cache((): ActiveIconProfileBox => ({ profile: undefined }));

/**
 * Server-side assignment for Server Component trees. Call once per request
 * from the application's tenant-resolution seam. Writes outside a React
 * request scope (plain node tooling) are swallowed: there is no request to
 * leak into.
 */
export function provideServerIconExpressiveProfile(
  profile: ExpressiveIconProfile | undefined
): void {
  if (typeof window !== 'undefined') return;
  try {
    serverBox().profile = profile;
  } catch {
    /* outside a React request scope: nothing to provide to */
  }
}

/**
 * The one environment-correct read. In client/SSR worlds this IS a React
 * hook (context read) and generated icons call it unconditionally at the
 * top of their render; in the RSC world it is a plain per-request box read
 * and no hook dispatcher is involved. The branch is a module-load constant
 * per world, so hook ordering is stable by construction.
 */
export function useActiveIconExpressiveProfile():
  | ExpressiveIconProfile
  | undefined {
  if (!IconExpressiveProfileContext || !maybeUseContext) {
    try {
      return serverBox().profile;
    } catch {
      return undefined;
    }
  }
  return maybeUseContext(IconExpressiveProfileContext);
}

/**
 * PURE derivation of the active icon posture from a tenant configuration —
 * the single source both integration points share: the DS provider (client
 * context value) and application server layouts (`/server` re-export, fed
 * into `provideServerIconExpressiveProfile`). Precedence is the canon:
 * DB appearance (general.experienceProfile + advanced.profiles) beats the
 * static BrandTheme expressive selection.
 */
export function resolveActiveIconExpressiveProfile(
  config: { appearance?: unknown; brandTheme?: unknown } | null | undefined
): ExpressiveIconProfile | undefined {
  const appearance = config?.appearance as
    | {
        general?: { experienceProfile?: string };
        advanced?: { profiles?: Record<string, unknown> };
      }
    | undefined;
  const dbAxes = resolveExpressiveAxes(
    appearance?.general?.experienceProfile,
    sanitizeExpressiveOverrides(appearance?.advanced?.profiles)
  );
  if (dbAxes.icon) return dbAxes.icon;
  const selection = (
    config?.brandTheme as
      | {
          expressive?: {
            experienceProfile?: string;
            profiles?: Record<string, unknown>;
            schemaVersion?: number;
          };
        }
      | undefined
  )?.expressive;
  if (!selection) return undefined;
  return resolveExpressiveAxes(
    selection.experienceProfile,
    sanitizeExpressiveOverrides(selection.profiles),
    selection.schemaVersion
  ).icon;
}

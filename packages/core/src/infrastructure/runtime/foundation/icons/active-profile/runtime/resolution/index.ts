import type { ExpressiveIconProfile } from '@/foundation/tokens/ts/presentation/expressive-profiles';
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from '@/foundation/tokens/ts/presentation/expressive-profiles';

/**
 * The active icon posture, from the two places a selection can now come from:
 * the mounted artifact's normalized appearance, and the governed expressive
 * selection a code-owned vertical's theme authored. A tenant config carries
 * neither, so neither is read from one.
 */
export function resolveActiveIconExpressiveProfile(
  source: { appearance?: unknown; expressive?: unknown } | null | undefined,
): ExpressiveIconProfile | undefined {
  const appearance = source?.appearance as
    | {
        general?: { experienceProfile?: string };
        advanced?: { profiles?: Record<string, unknown> };
      }
    | undefined;
  const dbAxes = resolveExpressiveAxes(
    appearance?.general?.experienceProfile,
    sanitizeExpressiveOverrides(appearance?.advanced?.profiles),
  );
  if (dbAxes.icon) return dbAxes.icon;

  const selection = source?.expressive as
    | {
        experienceProfile?: string;
        profiles?: Record<string, unknown>;
        schemaVersion?: number;
      }
    | undefined;
  if (!selection) return undefined;

  return resolveExpressiveAxes(
    selection.experienceProfile,
    sanitizeExpressiveOverrides(selection.profiles),
    selection.schemaVersion,
  ).icon;
}

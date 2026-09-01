import type { ExpressiveIconProfile } from '@/foundation/tokens/ts/presentation/expressive-profiles';
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from '@/foundation/tokens/ts/presentation/expressive-profiles';

export function resolveActiveIconExpressiveProfile(
  config: { appearance?: unknown; brandTheme?: unknown } | null | undefined,
): ExpressiveIconProfile | undefined {
  const appearance = config?.appearance as
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
    selection.schemaVersion,
  ).icon;
}

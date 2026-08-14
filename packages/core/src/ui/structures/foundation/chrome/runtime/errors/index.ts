/**
 * @fileoverview The `error?: unknown` contract for surface and page chrome.
 * @description Two functions that answer "was an error caught?" and "what does
 * a human read?" from an `unknown` value alone. They carry no surface
 * vocabulary -- no `SurfaceColumn`, no `SurfaceFieldDef`, no adapter -- which
 * is why they live here rather than in `ui/surfaces/runtime/helpers`.
 *
 * They moved down for the same reason the nine access functions did:
 * `SurfaceErrorState` is page chrome and now lives in
 * `ui/structures/feedback/surface-lifecycle`, and the structures tier may not
 * import from surfaces. The surfaces helpers barrel re-exports both by name,
 * so every existing caller and the published API are unchanged.
 *
 * The pair stays together deliberately. `hasSurfaceError` decides presence and
 * `normalizeSurfaceError` decides the message; splitting them across tiers
 * would leave a reader with two halves of one contract and no principle that
 * explains the seam.
 */

/** Presence for the `error?: unknown` contract: 0 and '' are caught values, not absence. */
export function hasSurfaceError(error: unknown): boolean {
  return error !== undefined && error !== null;
}

/** Normalize arbitrary surface errors into user-facing message + description pairs. */
export function normalizeSurfaceError(
  error: unknown,
  fallbackMessage = 'Something went wrong while rendering this surface.'
): { message: string; description?: string } {
  if (error instanceof Error) {
    return {
      message: error.message || fallbackMessage,
      description: error.stack,
    };
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return {
      message: error,
    };
  }

  // A numeric code is a renderable value callers already pass; without this it
  // would be swallowed into the generic fallback. NaN/Infinity carry no meaning.
  if (typeof error === 'number' && Number.isFinite(error)) {
    return {
      message: String(error),
    };
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return {
      message: (error as { message: string }).message,
    };
  }

  return {
    message: fallbackMessage,
  };
}

/**
 * @fileoverview Where the DS places the ancestor `<Suspense>` boundaries that
 * contain a server render failure inside page content.
 *
 * A server-rendered engine component carries no boundary of its own, so a
 * suspension or render error during SSR reaches the nearest ancestor
 * boundary. Without one, the whole response fails. These placements are the
 * DS-owned ancestors, and each one is a closed set of regions:
 *
 * - `content-slot`: the page-content slot of each DS page shell: `AppShell`
 *   (`main`), `PageShellSurface` (`body`) and the `WorkspaceShell` content
 *   box. The boundary wraps the slot element and never the chrome around it;
 *   the workspace particle field keeps its own decorative `<Suspense>`, which
 *   is not a placement region.
 * - `structure-regions`: every `content-slot` region plus the structure
 *   regions under them, `SurfaceSectionCard` section content. The slot
 *   boundaries stay in this set on purpose: a throw at a content position
 *   outside every finer region must still land in a boundary, never in the
 *   page.
 *
 * The placement is not public: which one ships is decided by the joint
 * validation matrix, never by a consumer, so no entrypoint re-exports it.
 *
 * @module Components/Structures/Foundation/ContentBoundary/Policy
 */

export type ContentBoundaryPlacement = 'off' | 'content-slot' | 'structure-regions';

export type ContentBoundaryRegion = 'content-slot' | 'section-content' | 'workspace-content';

export const CONTENT_BOUNDARY_PLACEMENTS: Readonly<
  Record<ContentBoundaryPlacement, readonly ContentBoundaryRegion[]>
> = {
  off: [],
  'content-slot': ['content-slot', 'workspace-content'],
  'structure-regions': ['content-slot', 'section-content', 'workspace-content'],
};

/** Ships `off` (dark) until the joint validation matrix admits a placement;
 *  only that ruling changes this value. */
export const CONTENT_BOUNDARY_PLACEMENT: ContentBoundaryPlacement = 'off';

/** Fails closed: anything other than an exact placement name is `off`. */
export function resolveContentBoundaryPlacement(value: unknown): ContentBoundaryPlacement {
  return value === 'content-slot' || value === 'structure-regions' ? value : 'off';
}

export function activeContentBoundaryRegions(): readonly ContentBoundaryRegion[] {
  return CONTENT_BOUNDARY_PLACEMENTS[resolveContentBoundaryPlacement(CONTENT_BOUNDARY_PLACEMENT)];
}

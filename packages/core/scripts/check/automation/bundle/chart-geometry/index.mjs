/**
 * The chart geometry family as the bundle gate reads it: every rendered
 * module under the geometry folder, never one file. A builder counts as
 * retained when any member of the family renders it, so the isolation proof
 * follows the builders wherever the folder keeps them.
 */

export const CHART_GEOMETRY_DIRECTORY = '/components/patterns/visualization/charts/runtime/chart-engine/foundation/renderers/geometry/';

/** @param {Map<string, { renderedExports: string[] }>} modules */
export function chartGeometryRenderedExports(modules) {
  const rendered = new Set();
  for (const [moduleId, details] of modules) {
    if (!moduleId.includes(CHART_GEOMETRY_DIRECTORY)) continue;
    for (const name of details.renderedExports) rendered.add(name);
  }
  return rendered;
}

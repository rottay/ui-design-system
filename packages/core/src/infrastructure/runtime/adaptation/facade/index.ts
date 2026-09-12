/**
 * @fileoverview Adaptation runtime -- postures in force and `adapt` resolution
 * for layout-sensitive families.
 *
 * @category Runtime
 */

export {
  resolveActiveResponsivePosture,
  useActiveResponsivePosture,
  useContainerPosture,
} from '../runtime/container-posture';
export { useAdaptation } from '../composition/react';
export type { AdaptationResult, UseAdaptationOptions } from '../composition/react';

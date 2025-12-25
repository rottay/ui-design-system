/**
 * Space Component Types
 *
 * Re-exports unified types from the centralized types module.
 */

export type {
  SpaceBaseProps,
  SpaceProps,
  SpaceSize,
  SpaceDirection,
  SpaceAlign,
} from '../../../types/components/space';

export {
  getSizeValue,
  parseSpaceSize,
  getSpaceAlignClass,
} from '../../../types/components/space';

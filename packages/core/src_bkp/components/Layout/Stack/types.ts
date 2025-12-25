/**
 * Stack Component Types
 *
 * Re-exports unified types from the centralized types module.
 */

export type {
  StackBaseProps,
  StackProps,
  StackJustify,
  StackAlign,
  StackGap,
} from '../../../types/components/stack';

export {
  getStackGapValue,
  getStackJustifyClass,
  getStackAlignClass,
} from '../../../types/components/stack';

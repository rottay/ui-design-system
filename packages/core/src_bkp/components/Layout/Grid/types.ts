/**
 * Grid (Row/Col) Component Types
 *
 * Re-exports unified types from the centralized types module.
 */

export type {
  Gutter,
  Breakpoint,
  ResponsiveGutter,
  RowJustify,
  RowAlign,
  RowBaseProps,
  RowProps,
  ColSpanConfig,
  ColBaseProps,
  ColProps,
} from '../../../types/components/grid';

export {
  parseGutter,
  getColWidth,
  getResponsiveSpan,
} from '../../../types/components/grid';

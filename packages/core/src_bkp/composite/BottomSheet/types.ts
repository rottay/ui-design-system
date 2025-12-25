import { ReactNode } from 'react';

export interface BottomSheetProps {
  /**
   * Whether the bottom sheet is visible
   */
  open: boolean;

  /**
   * Callback when the bottom sheet is closed
   */
  onClose: () => void;

  /**
   * Content to render inside the bottom sheet
   */
  children: ReactNode;

  /**
   * Snap points as fractions of viewport height (0-1)
   * @default [0.3, 0.6, 0.9]
   */
  snapPoints?: number[];

  /**
   * Initial snap point index
   * @default 0
   */
  initialSnapPointIndex?: number;

  /**
   * Title to display in the header
   */
  title?: string;

  /**
   * Whether to show the drag handle
   * @default true
   */
  showDragHandle?: boolean;

  /**
   * Whether to show the backdrop
   * @default true
   */
  showBackdrop?: boolean;

  /**
   * Whether clicking the backdrop closes the sheet
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether dragging down dismisses the sheet
   * @default true
   */
  dismissOnDrag?: boolean;

  /**
   * Custom header content (replaces title and drag handle)
   */
  header?: ReactNode;

  /**
   * Footer content
   */
  footer?: ReactNode;

  /**
   * Custom className for the sheet container
   */
  className?: string;

  /**
   * Custom styles for the sheet container
   */
  style?: React.CSSProperties;

  /**
   * Z-index of the bottom sheet
   * @default 1000
   */
  zIndex?: number;

  /**
   * Callback when snap point changes
   */
  onSnapPointChange?: (index: number) => void;
}

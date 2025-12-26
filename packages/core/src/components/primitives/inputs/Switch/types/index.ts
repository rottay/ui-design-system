/**
 * Switch Types
 */
import type { ReactNode, CSSProperties } from 'react';
import type { SizeType } from '../../../../../types/common';

export type SwitchSize = SizeType;

export interface SwitchProps {
  /** Whether the switch is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Whether the switch is in loading state */
  loading?: boolean;
  /** Size of the switch */
  size?: SwitchSize;
  /** Content when checked */
  checkedChildren?: ReactNode;
  /** Content when unchecked */
  unCheckedChildren?: ReactNode;
  /** Callback when the switch is toggled */
  onChange?: (checked: boolean) => void;
  /** Callback when clicked */
  onClick?: (checked: boolean, event: React.MouseEvent) => void;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Tab index */
  tabIndex?: number;
  /** ID attribute */
  id?: string;
  /** Name attribute for forms */
  name?: string;
}

export const SWITCH_DEFAULTS: Partial<SwitchProps> = {
  size: 'default',
  disabled: false,
  loading: false,
  defaultChecked: false,
};

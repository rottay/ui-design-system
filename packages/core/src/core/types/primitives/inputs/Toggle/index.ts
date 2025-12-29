import type { ReactNode, ChangeEvent } from 'react';
import type { BaseComponentProps, Size, DisableableProps, LoadableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * specific sizes for Toggle (Switch).
 */
export type ToggleSize = Size;

/**
 * component props Toggle (Switch).
 */
export interface ToggleProps extends BaseComponentProps, EngineAwareProps, DisableableProps, LoadableProps {
  /**
   * size toggle.
   * @default 'md'
   */
  size?: ToggleSize;

  /**
   * Toggle label.
   */
  label?: ReactNode;

  /**
   * whether the toggle está checked en modo controlado.
   */
  checked?: boolean;

  /**
   * whether the toggle está checked por defecto en modo no controlado.
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Value change callback.
   */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;

  /**
   * Text when checked.
   */
  checkedText?: ReactNode;

  /**
   * Text when unchecked.
   */
  uncheckedText?: ReactNode;

  /**
   * Icon when checked.
   */
  checkedIcon?: ReactNode;

  /**
   * Icon when unchecked.
   */
  uncheckedIcon?: ReactNode;

  /**
   * Toggle name (for forms).
   */
  name?: string;

  /**
   * Toggle value (for forms).
   */
  value?: string;

  /**
   * whether the toggle es requerido.
   */
  required?: boolean;

  /**
   * Toggle color when checked.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  /**
   * whether the label está a la izquierda del toggle.
   * @default false
   */
  labelPlacement?: 'start' | 'end';

  /**
   * Additional description del toggle.
   */
  description?: ReactNode;

  /**
   * whether the toggle debería tener autoFocus.
   */
  autoFocus?: boolean;
}

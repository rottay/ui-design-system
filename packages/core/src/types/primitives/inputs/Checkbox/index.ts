import type { ReactNode, ChangeEvent } from 'react';
import type { BaseComponentProps, Size, ControlledProps, DisableableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * specific sizes for Checkbox.
 */
export type CheckboxSize = Size;

/**
 * component props Checkbox.
 */
export interface CheckboxProps extends BaseComponentProps, EngineAwareProps, DisableableProps {
  /**
   * size checkbox.
   * @default 'md'
   */
  size?: CheckboxSize;

  /**
   * Checkbox label.
   */
  label?: ReactNode;

  /**
   * whether the checkbox está checked en modo controlado.
   */
  checked?: boolean;

  /**
   * whether the checkbox está checked por defecto en modo no controlado.
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * whether the checkbox está en estado indeterminado.
   */
  indeterminate?: boolean;

  /**
   * Value change callback.
   */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;

  /**
   * content checkbox (alternativa a label).
   */
  children?: ReactNode;

  /**
   * Checkbox name (for forms).
   */
  name?: string;

  /**
   * Checkbox value (for forms).
   */
  value?: string;

  /**
   * whether the checkbox es requerido.
   */
  required?: boolean;

  /**
   * whether the checkbox tiene error.
   */
  error?: boolean;

  /**
   * Checkbox color when checked.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  /**
   * border radius checkbox.
   * @default 'sm'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * whether the label está a la izquierda del checkbox.
   * @default false
   */
  labelPlacement?: 'start' | 'end';
}

/**
 * component props Checkbox.Group.
 */
export interface CheckboxGroupProps extends BaseComponentProps, ControlledProps<any[]>, DisableableProps {
  /**
   * Checkbox group size.
   */
  size?: CheckboxSize;

  /**
   * Group options.
   */
  options?: CheckboxGroupOption[];

  /**
   * Selected values in controlled mode.
   */
  value?: any[];

  /**
   * Default selected values in uncontrolled mode.
   */
  defaultValue?: any[];

  /**
   * Values change callback.
   */
  onChange?: (checkedValues: any[]) => void;

  /**
   * Nombre del grupo (para formularios).
   */
  name?: string;

  /**
   * Checkbox group children.
   */
  children?: ReactNode;

  /**
   * Group direction.
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Spacing between checkboxes.
   * @default 'md'
   */
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * CheckboxGroup option.
 */
export interface CheckboxGroupOption {
  /** Option label */
  label: ReactNode;
  /** Option value */
  value: any;
  /** Whether the option is disabled */
  disabled?: boolean;
}

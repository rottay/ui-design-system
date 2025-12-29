import type { ReactNode, ChangeEvent } from 'react';
import type { BaseComponentProps, Size, ControlledProps, DisableableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * specific sizes for Radio.
 */
export type RadioSize = Size;

/**
 * component props Radio.
 */
export interface RadioProps extends BaseComponentProps, EngineAwareProps, DisableableProps {
  /**
   * size radio.
   * @default 'md'
   */
  size?: RadioSize;

  /**
   * Label del radio.
   */
  label?: ReactNode;

  /**
   * Radio value.
   */
  value: any;

  /**
   * whether the radio está checked.
   */
  checked?: boolean;

  /**
   * whether the radio está checked por defecto.
   */
  defaultChecked?: boolean;

  /**
   * Value change callback.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;

  /**
   * content radio (alternativa a label).
   */
  children?: ReactNode;

  /**
   * Radio name (for forms).
   */
  name?: string;

  /**
   * whether the radio es requerido.
   */
  required?: boolean;

  /**
   * whether the radio tiene error.
   */
  error?: boolean;

  /**
   * Radio color when checked.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  /**
   * whether the label está a la izquierda del radio.
   * @default false
   */
  labelPlacement?: 'start' | 'end';

  /**
   * Additional description del radio.
   */
  description?: ReactNode;
}

/**
 * component props Radio.Group.
 */
export interface RadioGroupProps extends BaseComponentProps, EngineAwareProps, ControlledProps<any>, DisableableProps {
  /**
   * Radio group size.
   */
  size?: RadioSize;

  /**
   * Group options.
   */
  options?: RadioGroupOption[];

  /**
   * Selected value in controlled mode.
   */
  value?: any;

  /**
   * Default selected value in uncontrolled mode.
   */
  defaultValue?: any;

  /**
   * Value change callback.
   */
  onChange?: (value: any) => void;

  /**
   * Nombre del grupo (para formularios).
   */
  name?: string;

  /**
   * Radio group children.
   */
  children?: ReactNode;

  /**
   * Group direction.
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Spacing between radios.
   * @default 'md'
   */
  spacing?: 'sm' | 'md' | 'lg';

  /**
   * Radio color when checked.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  /**
   * Whether to show radios as buttons.
   */
  buttonStyle?: 'outline' | 'solid';
}

/**
 * RadioGroup option.
 */
export interface RadioGroupOption {
  /** Option label */
  label: ReactNode;
  /** Option value */
  value: any;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Additional description */
  description?: ReactNode;
}

/**
 * component props Radio.Button.
 */
export interface RadioButtonProps extends Omit<RadioProps, 'buttonStyle'> {
  /**
   * Button style.
   * @default 'outline'
   */
  buttonStyle?: 'outline' | 'solid';
}

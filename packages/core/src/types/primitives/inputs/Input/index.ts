import type { ReactNode, InputHTMLAttributes, ChangeEvent, FocusEvent } from 'react';
import type { BaseComponentProps, Size, Variant, ControlledProps, DisableableProps, ErrorableProps, LabeledProps, PlaceholderProps, ClearableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * specific sizes for Input.
 */
export type InputSize = Size;

/**
 * variants for Input.
 */
export type InputVariant = Variant;

/**
 * Input HTML types.
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';

/**
 * component props Input.
 */
export interface InputProps extends BaseComponentProps, EngineAwareProps, DisableableProps, ErrorableProps, LabeledProps, PlaceholderProps, ClearableProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'type' | 'onChange' | 'value' | 'defaultValue'> {
  /**
   * size input.
   * @default 'md'
   */
  size?: InputSize;

  /**
   * color variant input.
   * @default 'default'
   */
  variant?: InputVariant;

  /**
   * Input HTML type.
   * @default 'text'
   */
  type?: InputType;

  /**
   * Prefix before input (icon, text, etc).
   */
  prefix?: ReactNode;

  /**
   * Suffix after input (icon, text, etc).
   */
  suffix?: ReactNode;

  /**
   * Addon before input (típicamente texto o botón).
   */
  addonBefore?: ReactNode;

  /**
   * Addon after input (típicamente texto o botón).
   */
  addonAfter?: ReactNode;

  /**
   * whether the input takes full available width.
   */
  fullWidth?: boolean;

  /**
   * Maximum number of characters allowed.
   */
  maxLength?: number;

  /**
   * Whether to show character counter.
   */
  showCount?: boolean;

  /**
   * whether the input puede ser autocompletado.
   */
  allowClear?: boolean;

  /**
   * Value change callback.
   */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;

  /**
   * Input focus callback.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;

  /**
   * Input blur callback.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;

  /**
   * Enter key press callback.
   */
  onPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;

  /**
   * whether the input está en modo de solo lectura.
   */
  readOnly?: boolean;

  /**
   * border radius input.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * whether the input has a border.
   * @default true
   */
  bordered?: boolean;

  /**
   * Whether to show validation state with icon.
   */
  showValidationIcon?: boolean;

  /**
   * Input value in controlled mode.
   */
  value?: string;

  /**
   * Default value in uncontrolled mode.
   */
  defaultValue?: string;

  /**
   * Input name (for forms).
   */
  name?: string;

  /**
   * Input ID.
   */
  id?: string;

  /**
   * whether the input debería tener autoFocus.
   */
  autoFocus?: boolean;
}

/**
 * component props Input.Password.
 */
export interface InputPasswordProps extends Omit<InputProps, 'type'> {
  /**
   * Whether to show visibility toggle button.
   * @default true
   */
  visibilityToggle?: boolean;

  /**
   * Custom icon to show password.
   */
  visibleIcon?: ReactNode;

  /**
   * Custom icon to hide password.
   */
  hiddenIcon?: ReactNode;
}

/**
 * component props Input.TextArea.
 */
export interface InputTextAreaProps extends Omit<InputProps, 'type' | 'prefix' | 'suffix' | 'addonBefore' | 'addonAfter'> {
  /**
   * Number of textarea rows.
   * @default 4
   */
  rows?: number;

  /**
   * whether the textarea puede auto-resize según contenido.
   */
  autoSize?: boolean | { minRows?: number; maxRows?: number };

  /**
   * Whether to allow manual textarea resize.
   * @default true
   */
  resize?: boolean;
}

/**
 * component props Input.Search.
 */
export interface InputSearchProps extends InputProps {
  /**
   * Search button text.
   */
  searchButtonText?: string;

  /**
   * Whether to show search button.
   * @default true
   */
  showSearchButton?: boolean;

  /**
   * Callback cuando se hace búsqueda (click en botón o Enter).
   */
  onSearch?: (value: string) => void;

  /**
   * whether the botón de búsqueda está en loading.
   */
  loading?: boolean;
}

/**
 * component props Input.Group.
 */
export interface InputGroupProps extends BaseComponentProps {
  /**
   * Input group size.
   */
  size?: InputSize;

  /**
   * Whether inputs are compact (joined without space).
   * @default true
   */
  compact?: boolean;

  /**
   * Input group children.
   */
  children: ReactNode;
}

/**
 * Input validation state.
 */
export interface InputValidationState {
  /** whether the input es válido */
  valid: boolean;
  /** Error or validation message */
  message?: string;
  /** Tipo de validación */
  type?: 'error' | 'warning' | 'success';
}

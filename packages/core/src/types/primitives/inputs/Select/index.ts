import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, Variant, DisableableProps, ErrorableProps, LabeledProps, PlaceholderProps, ClearableProps, LoadableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * specific sizes for Select.
 */
export type SelectSize = Size;

/**
 * variants for Select.
 */
export type SelectVariant = Variant;

/**
 * Select option.
 */
export interface SelectOption<T = any> {
  /** Option value */
  value: T;
  /** Label to show */
  label: ReactNode;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Option icon */
  icon?: ReactNode;
  /** Additional description */
  description?: ReactNode;
  /** Additional metadata */
  meta?: Record<string, any>;
}

/**
 * Select option group.
 */
export interface SelectOptionGroup<T = any> {
  /** Group label */
  label: ReactNode;
  /** Group options */
  options: SelectOption<T>[];
  /** whether the grupo está deshabilitado */
  disabled?: boolean;
}

/**
 * component props Select.
 */
export interface SelectProps<T = any> extends BaseComponentProps, EngineAwareProps, DisableableProps, ErrorableProps, LabeledProps, PlaceholderProps, ClearableProps, LoadableProps {
  /**
   * size select.
   * @default 'md'
   */
  size?: SelectSize;

  /**
   * color variant select.
   * @default 'default'
   */
  variant?: SelectVariant;

  /**
   * Select options.
   */
  options?: SelectOption<T>[] | SelectOptionGroup<T>[];

  /**
   * whether the select permite múltiple selección.
   */
  multiple?: boolean;

  /**
   * whether the select permite búsqueda/filtrado.
   */
  searchable?: boolean;

  /**
   * Search placeholder text.
   */
  searchPlaceholder?: string;

  /**
   * Custom search/filter function.
   */
  filterOption?: (inputValue: string, option: SelectOption<T>) => boolean;

  /**
   * whether the select takes full available width.
   */
  fullWidth?: boolean;

  /**
   * Value change callback.
   */
  onChange?: (value: T | T[], option?: SelectOption<T> | SelectOption<T>[]) => void;

  /**
   * Callback cuando se hace búsqueda.
   */
  onSearch?: (searchValue: string) => void;

  /**
   * Callback cuando se abre el dropdown.
   */
  onDropdownOpen?: () => void;

  /**
   * Callback cuando se cierra el dropdown.
   */
  onDropdownClose?: () => void;

  /**
   * Prefijo antes del select (icono, texto, etc).
   */
  prefix?: ReactNode;

  /**
   * Sufijo después del select (icono, texto, etc).
   */
  suffix?: ReactNode;

  /**
   * Whether to show dropdown icon.
   * @default true
   */
  showArrow?: boolean;

  /**
   * Maximum tags to show in multiple mode.
   * El resto se muestra como "+N".
   */
  maxTagCount?: number;

  /**
   * Placeholder when tags are selected.
   */
  maxTagPlaceholder?: ReactNode | ((omittedValues: T[]) => ReactNode);

  /**
   * border radius select.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * whether the select has a border.
   * @default true
   */
  bordered?: boolean;

  /**
   * Dropdown mode.
   * @default 'default'
   */
  dropdownMode?: 'default' | 'tags' | 'combobox';

  /**
   * Dropdown position.
   * @default 'bottom-start'
   */
  dropdownPosition?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

  /**
   * Whether to allow creating new options (tags mode).
   */
  allowCreate?: boolean;

  /**
   * New option creation callback.
   */
  onCreate?: (value: string) => void;

  /**
   * Message when no options.
   */
  notFoundContent?: ReactNode;

  /**
   * whether the select está en modo de solo lectura.
   */
  readOnly?: boolean;

  /**
   * Selected value in controlled mode.
   */
  value?: T | T[];

  /**
   * Default value in uncontrolled mode.
   */
  defaultValue?: T | T[];

  /**
   * Nombre del select (para formularios).
   */
  name?: string;

  /**
   * ID del select.
   */
  id?: string;

  /**
   * whether the select debería tener autoFocus.
   */
  autoFocus?: boolean;
}

/**
 * component props Select.OptGroup.
 */
export interface SelectOptGroupProps extends BaseComponentProps {
  /**
   * Group label.
   */
  label: ReactNode;

  /**
   * whether the grupo está deshabilitado.
   */
  disabled?: boolean;

  /**
   * Group options.
   */
  children: ReactNode;
}

/**
 * component props Select.Option.
 */
export interface SelectOptionProps<T = any> extends BaseComponentProps {
  /**
   * Option value.
   */
  value: T;

  /**
   * Option label.
   */
  label?: ReactNode;

  /**
   * Whether the option is disabled.
   */
  disabled?: boolean;

  /**
   * Contenido de la opción.
   */
  children?: ReactNode;
}

/**
 * Select search state.
 */
export interface SelectSearchState {
  /** Current search text */
  searchValue: string;
  /** Whether searching */
  searching: boolean;
  /** Filtered options */
  filteredOptions: SelectOption[];
}

/**
 * Select dropdown state.
 */
export interface SelectDropdownState {
  /** whether the dropdown está abierto */
  open: boolean;
  /** Focused option index */
  focusedIndex: number;
}

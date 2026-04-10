/**
 * Usage examples demonstrating how to consume the DS contract types when
 * building engine-aware components. NOT production code -- reference only.
 */

import React from 'react';
import type {
  // Common types
  BaseComponentProps,
  Size,
  Variant,

  // Engine types
  EngineName,
  EngineAwareProps,

  // Display component types
  AvatarProps,
  AvatarGroupProps,
  BadgeProps,
  CardProps,
  ImageProps,
  TagProps,
  TooltipProps,

  // Input component types
  ButtonProps,
  InputProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  ToggleProps,

  // Feedback component types
  ModalProps,
  ToastProps,
  AlertProps,

  // Navigation component types
  MenuProps,
  StepperProps,
} from './index';

/* ===========================
   EJEMPLO 1: Avatar Component
   =========================== */

const ExampleAvatar: React.FC<AvatarProps> = ({
  size = 'md',
  variant = 'default',
  shape = 'circle',
  src,
  alt,
  name,
  status,
  clickable,
  onClick,
  engine = 'classic',
  className,
  style,
  ...rest
}) => {
  // Implementación del componente Avatar
  // Este es solo un ejemplo de cómo usar los tipos

  return (
    <div
      className={className}
      style={style}
      onClick={clickable ? onClick : undefined}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} />
      ) : (
        <span>{name?.[0]?.toUpperCase()}</span>
      )}
      {status && <span className="status-indicator" data-status={status} />}
    </div>
  );
};

/* ===========================
   EJEMPLO 2: Button Component
   =========================== */

const ExampleButton: React.FC<ButtonProps> = ({
  size = 'md',
  variant = 'default',
  shape = 'default',
  htmlType = 'button',
  disabled,
  loading,
  icon,
  iconPosition = 'start',
  children,
  onClick,
  engine = 'classic',
  className,
  style,
  ...rest
}) => {
  // Implementación del componente Button

  return (
    <button
      type={htmlType}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
      style={style}
      data-size={size}
      data-variant={variant}
      data-engine={engine}
      {...rest}
    >
      {loading && <span className="loading-spinner" />}
      {icon && iconPosition === 'start' && <span className="icon">{icon}</span>}
      {children}
      {icon && iconPosition === 'end' && <span className="icon">{icon}</span>}
    </button>
  );
};

/* ===========================
   EJEMPLO 3: Input Component
   =========================== */

const ExampleInput: React.FC<InputProps> = ({
  size = 'md',
  variant = 'default',
  type = 'text',
  value,
  defaultValue,
  placeholder,
  disabled,
  error,
  label,
  helperText,
  prefix,
  suffix,
  onChange,
  engine = 'classic',
  className,
  style,
  ...rest
}) => {
  // Implementación del componente Input

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  };

  return (
    <div className={className} style={style}>
      {label && <label>{label}</label>}
      <div className="input-wrapper">
        {prefix && <span className="prefix">{prefix}</span>}
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          data-size={size}
          data-variant={variant}
          data-error={error}
          data-engine={engine}
          {...rest}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {helperText && <span className="helper-text">{helperText}</span>}
    </div>
  );
};

/* ===========================
   EJEMPLO 4: Select Component
   =========================== */

const ExampleSelect: React.FC<SelectProps<string>> = ({
  size = 'md',
  variant = 'default',
  options = [],
  value,
  defaultValue,
  placeholder,
  disabled,
  searchable,
  multiple,
  onChange,
  engine = 'classic',
  className,
  style,
  ...rest
}) => {
  // Implementación del componente Select

  const handleChange = (selectedValue: string | string[]) => {
    const selectedOption = options.find(opt =>
      'value' in opt && opt.value === selectedValue
    );
    if (selectedOption && 'value' in selectedOption) {
      onChange?.(selectedValue, selectedOption);
    }
  };

  return (
    <div className={className} style={style}>
      <select
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        multiple={multiple}
        data-size={size}
        data-variant={variant}
        data-engine={engine}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => {
          if ('options' in option) {
            // Option group
            return (
              <optgroup key={index} label={option.label as string}>
                {option.options.map((opt, i) => (
                  <option key={i} value={opt.value as string}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            );
          } else {
            // Regular option
            return (
              <option key={index} value={option.value as string}>
                {option.label}
              </option>
            );
          }
        })}
      </select>
    </div>
  );
};

/* ===========================
   EJEMPLO 5: Modal Component
   =========================== */

const ExampleModal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  title,
  children,
  footer,
  closable = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  engine = 'classic',
  className,
  style,
  ...rest
}) => {
  // Implementación del componente Modal

  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={closeOnBackdropClick ? onClose : undefined}>
      <div
        className={className}
        style={style}
        data-size={size}
        data-engine={engine}
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            {closable && <button onClick={onClose}>×</button>}
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ===========================
   EJEMPLO 6: Toast Hook
   =========================== */

import type { ToastMethods, ToastOptions } from '../components/primitives/feedback/Toast/Toast.types';

// Ejemplo de implementación del hook useToast
const useToastExample = (): ToastMethods => {
  const show = (options: ToastOptions): string => {
    const id = Math.random().toString(36).substr(2, 9);
    // Implementación para mostrar el toast
    console.log('Showing toast:', id, options);
    return id;
  };

  const success = (title: React.ReactNode, description?: React.ReactNode, options?: Partial<ToastOptions>): string => {
    return show({ ...options, variant: 'success', title, description });
  };

  const error = (title: React.ReactNode, description?: React.ReactNode, options?: Partial<ToastOptions>): string => {
    return show({ ...options, variant: 'error', title, description });
  };

  const warning = (title: React.ReactNode, description?: React.ReactNode, options?: Partial<ToastOptions>): string => {
    return show({ ...options, variant: 'warning', title, description });
  };

  const info = (title: React.ReactNode, description?: React.ReactNode, options?: Partial<ToastOptions>): string => {
    return show({ ...options, variant: 'info', title, description });
  };

  const dismiss = (id: string): void => {
    console.log('Dismissing toast:', id);
  };

  const dismissAll = (): void => {
    console.log('Dismissing all toasts');
  };

  const update = (id: string, options: Partial<ToastOptions>): void => {
    console.log('Updating toast:', id, options);
  };

  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    update,
  };
};

/* ===========================
   EJEMPLO 7: Engine-Aware Component
   =========================== */

interface MyComponentProps extends BaseComponentProps, EngineAwareProps {
  title: string;
  description?: string;
}

const ExampleEngineAwareComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  engine = 'classic',
  className,
  style,
  ...rest
}) => {
  // Componente que se adapta según el engine seleccionado

  const renderByEngine = () => {
    switch (engine) {
      case 'classic':
        return <div className="ant-design-style">{title}</div>;
      case 'modern':
        return <div className="daisyui-style">{title}</div>;
      case 'rustic':
        return <div className="vanilla-style">{title}</div>;
      default:
        return <div>{title}</div>;
    }
  };

  return (
    <div className={className} style={style} data-engine={engine} {...rest}>
      {renderByEngine()}
      {description && <p>{description}</p>}
    </div>
  );
};

/* ===========================
   EJEMPLO 8: Uso de Props Mixins
   =========================== */

import type { LoadableProps, DisableableProps, ClickableProps } from './common';

interface ActionButtonProps extends BaseComponentProps, LoadableProps, DisableableProps, ClickableProps {
  label: string;
}

const ExampleActionButton: React.FC<ActionButtonProps> = ({
  label,
  loading,
  loadingText = 'Cargando...',
  disabled,
  clickable = true,
  onClick,
  className,
  style,
}) => {
  return (
    <button
      className={className}
      style={style}
      disabled={disabled || loading}
      onClick={clickable ? onClick : undefined}
    >
      {loading ? loadingText : label}
    </button>
  );
};

/* ===========================
   EXPORTS (Para Testing)
   =========================== */

export {
  ExampleAvatar,
  ExampleButton,
  ExampleInput,
  ExampleSelect,
  ExampleModal,
  useToastExample,
  ExampleEngineAwareComponent,
  ExampleActionButton,
};

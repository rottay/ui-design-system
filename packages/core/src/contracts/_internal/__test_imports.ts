/**
 * Compile-time verification that all contract types can be imported correctly.
 * This file should compile without errors; it is not executed as a runtime test.
 */

// Common types
import type {
  BaseComponentProps,
  Size,
  Variant,
  Shape,
  InteractionState,
  Direction,
  Alignment,
  LoadableProps,
  DisableableProps,
  WithChildren,
  ClickableProps,
  ErrorableProps,
  LabeledProps,
  PlaceholderProps,
  ControlledProps,
  ClearableProps,
  IconProps,
  BorderedProps,
  ShadowedProps,
  Position,
  Density,
  ColorToken,
} from './common';

// Engine types
import type {
  EngineName,
  EngineAwareProps,
  EngineConfig,
  EngineCapabilities,
  EngineMetadata,
  EngineContextValue,
  EngineProviderProps,
  EngineRegistry,
  EngineFallbackConfig,
} from './engine';

// Display component types
import type {
  AvatarSize,
  AvatarVariant,
  AvatarShape,
  AvatarStatus,
  AvatarProps,
  AvatarGroupProps,
  AvatarBadgeProps,
  AvatarFallbackProps,
  AvatarStatusConfig,
  BadgeSize,
  BadgeVariant,
  BadgeStyle,
  BadgeProps,
  BadgeRibbonProps,
  BadgeCountProps,
  CardSize,
  CardVariant,
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardCoverProps,
  CardMetaProps,
  ImageFit,
  ImageProps,
  ImageGroupProps,
  ImageLoadState,
  TagSize,
  TagVariant,
  TagProps,
  TooltipPlacement,
  TooltipTrigger,
  TooltipProps,
  TooltipState,
} from './primitives/display';

// Input component types
import type {
  ButtonSize,
  ButtonVariant,
  ButtonShape,
  ButtonHtmlType,
  ButtonProps,
  ButtonGroupProps,
  IconButtonProps,
  ButtonLoadingConfig,
  InputSize,
  InputVariant,
  InputType,
  InputProps,
  InputPasswordProps,
  InputTextAreaProps,
  InputSearchProps,
  InputGroupProps,
  InputValidationState,
  SelectSize,
  SelectVariant,
  SelectOption,
  SelectOptionGroup,
  SelectProps,
  SelectOptGroupProps,
  SelectOptionProps,
  SelectSearchState,
  SelectDropdownState,
  CheckboxSize,
  CheckboxProps,
  CheckboxGroupProps,
  CheckboxGroupOption,
  RadioSize,
  RadioProps,
  RadioGroupProps,
  RadioGroupOption,
  RadioButtonProps,
  ToggleSize,
  ToggleProps,
} from './primitives/inputs';

// Feedback component types
import type {
  ModalSize,
  ModalPlacement,
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalButtonConfig,
  ModalConfirmProps,
  ToastVariant,
  ToastPosition,
  ToastProps,
  ToastAction,
  ToastProviderConfig,
  ToastOptions,
  ToastMethods,
  ToastState,
  AlertVariant,
  AlertType,
  AlertProps,
  AlertTitleProps,
  AlertDescriptionProps,
  AlertIconConfig,
} from './primitives/feedback';

// Navigation component types
import type {
  MenuMode,
  MenuTheme,
  MenuItem,
  MenuProps,
  MenuItemProps,
  MenuSubMenuProps,
  MenuItemGroupProps,
  MenuDividerProps,
  MenuState,
  StepperOrientation,
  StepStatus,
  StepItem,
  StepperProps,
  StepperStepProps,
  StepperActionsProps,
  StepperState,
} from './primitives/navigation';

// Test that types can be used in declarations
const testEngine: EngineName = 'classic';
const testSize: Size = 'md';
const testVariant: Variant = 'primary';

// Test engine-aware props
const testEngineAwareProps: EngineAwareProps = {
  engine: 'modern',
};

// Test base component props
const testBaseProps: BaseComponentProps = {
  className: 'test',
  style: { color: 'red' },
  id: 'test-id',
  'data-testid': 'test',
};

// Test button props
const testButtonProps: ButtonProps = {
  size: 'lg',
  variant: 'primary',
  loading: true,
  disabled: false,
  onClick: () => console.log('clicked'),
};

// Test avatar props
const testAvatarProps: AvatarProps = {
  size: 'md',
  shape: 'circle',
  src: '/avatar.jpg',
  alt: 'User Avatar',
  status: 'online',
};

// Test input props
const testInputProps: InputProps = {
  type: 'text',
  placeholder: 'Enter text',
  value: 'test',
  onChange: (value) => console.log(value),
};

// Test select props
const testSelectProps: SelectProps<string> = {
  options: [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ],
  placeholder: 'Select option',
  onChange: (value) => console.log(value),
};

// Test modal props
const testModalProps: ModalProps = {
  open: true,
  onClose: () => console.log('closed'),
  title: 'Modal Title',
  size: 'lg',
};

// Test toast methods
const testToastMethods: ToastMethods = {
  show: () => 'id',
  success: () => 'id',
  error: () => 'id',
  warning: () => 'id',
  info: () => 'id',
  dismiss: () => {},
  dismissAll: () => {},
  update: () => {},
};

// Test menu props
const testMenuProps: MenuProps = {
  mode: 'vertical',
  theme: 'light',
  items: [
    { key: '1', label: 'Item 1' },
    { key: '2', label: 'Item 2' },
  ],
};

// Export to verify file compiles
export const typeTestsPassed = true;

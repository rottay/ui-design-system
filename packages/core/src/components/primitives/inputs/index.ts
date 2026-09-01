/**
 * @fileoverview Input primitives barrel export.
 * Re-exports all input-category primitive components.
 */

export { Button } from './button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './button';

export { Input, InputGroup, InputAddon } from './input';
export type {
  InputProps,
  InputVariant,
  InputSize,
  InputStatus,
  InputType,
  InputGroupProps,
  InputAddonProps,
} from './input';

export { Select } from './select';
export type {
  SelectProps,
  SelectVariant,
  SelectSize,
  SelectStatus,
  SelectOption,
} from './select';

export { Checkbox, CheckboxGroup } from './checkbox';
export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxVariant,
  CheckboxRadius,
  CheckboxGroupProps,
  CheckboxOption,
} from './checkbox';

export { Radio, RadioGroup } from './radio';
export type {
  RadioProps,
  RadioSize,
  RadioVariant,
  RadioLabelPlacement,
  RadioOption,
  RadioGroupProps,
} from './radio';

export { Toggle } from './toggle';
export type {
  ToggleProps,
  ToggleSize,
  ToggleVariant,
  ToggleLabelPlacement,
} from './toggle';

export { Textarea } from './textarea';
export type { TextareaProps, TextareaVariant, TextareaSize, TextareaStatus } from './textarea';

export { Switch } from './switch';
export type { SwitchProps, SwitchSize } from './switch';

export { InputNumber } from './input-number';
export type { InputNumberProps, InputNumberSize, InputNumberStatus } from './input-number';

export { Form, useForm } from './form';
export type {
  FormProps,
  FormItemProps,
  FormListProps,
  FormErrorListProps,
  FormInstance,
  FormLayout,
  FormSize,
  FormLabelAlign,
  FormRequiredMark,
  FormRule,
  FieldData,
  FormListFieldData,
  FormListOperation,
} from './form';

export { DatePicker } from './date-picker';
export type {
  DatePickerProps,
  RangePickerProps,
  DatePickerSize,
  DatePickerStatus,
  DatePickerPlacement,
  DatePickerMode,
} from './date-picker';

export { TimePicker } from './time-picker';
export type {
  TimePickerProps,
  TimeRangePickerProps,
  TimePickerSize,
  TimePickerStatus,
  TimePickerPlacement,
} from './time-picker';

// AutoComplete
export { AutoComplete } from './auto-complete';
export type {
  AutoCompleteProps,
  AutoCompleteOption,
  AutoCompleteSize,
  LegacyAutoCompleteSize,
} from './auto-complete';
export { AUTOCOMPLETE_DEFAULTS } from './auto-complete';

// Cascader
export { Cascader } from './cascader';
export type {
  CascaderProps,
  CascaderOption,
  CascaderValue,
  CascaderSize,
  LegacyCascaderSize,
  CascaderExpandTrigger,
} from './cascader';
export { CASCADER_DEFAULTS } from './cascader';

// TreeSelect
export { TreeSelect } from './tree-select';
export type {
  TreeSelectProps,
  TreeSelectNode,
  TreeSelectValue,
  TreeSelectSize,
  LegacyTreeSelectSize,
} from './tree-select';
export { TREESELECT_DEFAULTS } from './tree-select';

// Mentions
export { Mentions } from './mentions';
export type {
  MentionsProps,
  MentionsOption,
  MentionsPlacement,
  MentionsStatus,
} from './mentions';
export { MENTIONS_DEFAULTS } from './mentions';

// Transfer
export { Transfer } from './transfer';
export type {
  TransferProps,
  TransferItem,
} from './transfer';
export { TRANSFER_DEFAULTS } from './transfer';

// ColorPicker
export { ColorPicker } from './color-picker';
export type {
  ColorPickerProps,
  ColorPreset,
  Color,
  ColorFormat,
  ColorPickerSize,
  LegacyColorPickerSize,
  ColorPickerTrigger,
} from './color-picker';
export { COLORPICKER_DEFAULTS } from './color-picker';

// Slider
export { Slider } from './slider';
export type {
  SliderProps,
  SliderMarks,
} from './slider';
export { SLIDER_DEFAULTS } from './slider';

// Upload
export { Upload } from './upload';
export type {
  UploadProps,
  DraggerProps,
  UploadFile,
  UploadChangeInfo,
  UploadListType,
  UploadRequestOption,
} from './upload';
export { UPLOAD_DEFAULTS } from './upload';

// PasswordInput
export { PasswordInput } from './password-input';
export type {
  PasswordInputProps,
  PasswordInputSize,
  PasswordInputVariant,
  PasswordStrengthLevel,
} from './password-input';
export { PASSWORD_INPUT_DEFAULTS, STRENGTH_COLORS, STRENGTH_WIDTHS } from './password-input';

// TagInput
export { TagInput } from './tag-input';
export type {
  TagInputProps,
  TagInputSize,
} from './tag-input';
export { TAGINPUT_DEFAULTS } from './tag-input';

// OTPInput
export { OTPInput } from './otp-input';
export type {
  OTPInputProps,
  OTPInputType,
  OTPInputSize,
} from './otp-input';
export { OTPINPUT_DEFAULTS } from './otp-input';

// FormField
export { FormField } from './form-field';
export type {
  FormFieldProps,
  FormFieldLayout,
  FormFieldSize,
} from './form-field';
export { FORMFIELD_DEFAULTS } from './form-field';

// VoiceInputButton
export { VoiceInputButton } from './voice-input-button';
export type { VoiceInputButtonProps } from './voice-input-button';

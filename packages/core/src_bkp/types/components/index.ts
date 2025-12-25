/**
 * Component Types
 *
 * Unified type definitions for all design system components.
 * These types are engine-agnostic and work with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 *
 * @module types/components
 */

// AutoComplete types
export type {
  AutoCompleteOption,
  AutoCompleteOptionGroup,
  AutoCompleteSize,
  AutoCompleteStatus,
  AutoCompletePlacement,
  AutoCompleteBaseProps,
  AutoCompleteProps,
} from './autocomplete';
export {
  isOptionGroup as isAutoCompleteOptionGroup,
  isStringOption as isAutoCompleteStringOption,
  normalizeOptions as normalizeAutoCompleteOptions,
  flattenOptions as flattenAutoCompleteOptions,
  defaultFilterOption as defaultAutoCompleteFilter,
} from './autocomplete';

// Avatar types
export type {
  AvatarBaseProps,
  AvatarProps,
  AvatarSize,
  AvatarShape,
} from './avatar';
export {
  isNumericSize,
  isPresetSize,
} from './avatar';

// Button types
export type {
  ButtonBaseProps,
  ButtonProps,
} from './button';
export {
  isLoadingWithDelay,
  getLoadingState,
} from './button';

// DatePicker types
export type {
  DateValue,
  DatePickerSize,
  DatePickerStatus,
  DatePickerMode,
  DatePickerPlacement,
  DatePickerPreset,
  DateRangePreset,
  DatePickerBaseProps,
  DatePickerProps,
  RangePickerProps,
} from './datepicker';
export {
  formatDate,
  parseDate,
  toDate,
  isSameDay,
  isInRange,
  getDaysInMonth,
  getFirstDayOfMonth,
} from './datepicker';

// Input types
export type {
  InputBaseProps,
  InputProps,
  TextAreaProps,
  PasswordProps,
} from './input';

// Select types
export type {
  SelectOption,
  SelectOptionGroup,
  SelectBaseProps,
  SelectProps,
} from './select';
export {
  isOptionGroups,
  flattenOptionGroups,
} from './select';

// Checkbox types
export type {
  CheckboxBaseProps,
  CheckboxProps,
  CheckboxGroupOption,
  CheckboxGroupProps,
} from './checkbox';
export {
  isCheckboxGroupOption,
  normalizeCheckboxOptions,
  toggleValueInArray,
} from './checkbox';

// Tag types
export type {
  TagBaseProps,
  TagProps,
} from './tag';

// Alert types
export type {
  AlertType,
  AlertBaseProps,
  AlertProps,
} from './alert';
export {
  isClosableAlert,
  getAlertTypeIcon,
  getAlertTypeColor,
} from './alert';

// Spin types
export type {
  SpinIndicator,
  SpinBaseProps,
  SpinProps,
} from './spin';
export {
  isSpinning,
  isWrappingContent,
} from './spin';

// Empty types
export type {
  EmptyBaseProps,
  EmptyProps,
} from './empty';

// Progress types
export type {
  ProgressBaseProps,
  ProgressProps,
  ProgressType,
  ProgressStatus,
  ProgressSize,
} from './progress';
export {
  isGradientColor,
} from './progress';

// Badge types
export type {
  BadgeBaseProps,
  BadgeProps,
  BadgeStatus,
  BadgeSize,
} from './badge';
export {
  isBadgeCountMode,
  isBadgeDotMode,
  getDisplayCount,
  STATUS_COLORS,
} from './badge';

// Breadcrumb types
export type {
  BreadcrumbBaseProps,
  BreadcrumbProps,
  BreadcrumbItem,
  BreadcrumbMenuItem,
} from './breadcrumb';

// Pagination types
export type {
  PaginationBaseProps,
  PaginationProps,
} from './pagination';
export {
  isControlledPagination,
  isUncontrolledPagination,
} from './pagination';

// TimePicker types
export type {
  TimeValue,
  TimePickerSize,
  TimePickerStatus,
  TimePickerPlacement,
  TimePickerBaseProps,
  TimePickerProps,
  TimeRangePickerProps,
} from './timepicker';
export {
  formatTime,
  parseTime,
  toTime,
  generateHours,
  generateMinutesOrSeconds,
} from './timepicker';

// Affix types
export type {
  AffixBaseProps,
  AffixProps,
} from './affix';

// Anchor types
export type {
  AnchorBaseProps,
  AnchorProps,
  AnchorLinkItem,
  AnchorDirection,
} from './anchor';
export {
  getAnchorElement,
  scrollToAnchor,
  getActiveAnchor,
  flattenItems as flattenAnchorItems,
} from './anchor';

// BackTop types
export type {
  BackTopBaseProps,
  BackTopProps,
} from './backtop';
export {
  DEFAULT_BACKTOP_ICON,
  scrollToTop,
  getScrollTop,
} from './backtop';

// FloatButton types
export type {
  FloatButtonBaseProps,
  FloatButtonProps,
  FloatButtonType,
  FloatButtonShape,
  FloatButtonBadge,
  FloatButtonGroupProps,
  FloatButtonGroupTrigger,
  FloatButtonBackTopProps,
} from './floatbutton';

// Segmented types
export type {
  SegmentedBaseProps,
  SegmentedProps,
  SegmentedValue,
  SegmentedOption,
  SegmentedSize,
} from './segmented';
export {
  normalizeOption as normalizeSegmentedOption,
  normalizeOptions as normalizeSegmentedOptions,
  getSizeClasses as getSegmentedSizeClasses,
} from './segmented';

// Typography types
export type {
  BaseTypographyProps,
  TypographyProps,
  TitleProps,
  TextProps,
  ParagraphProps,
  LinkProps,
  TypographyType,
  CopyableConfig,
  EditableConfig,
  EllipsisConfig,
} from './typography';
export {
  getTypeColorClass,
  buildTypographyClasses,
  copyToClipboard,
  truncateText,
  getTextContent,
} from './typography';

// Message types
export type {
  MessageType,
  MessagePlacement,
  MessageConfigOptions,
  MessageContentOptions,
  MessageInstance,
  MessageAPI,
} from './message';
export {
  normalizeMessageConfig,
  getMessageTypeIcon,
  getMessageTypeColor,
} from './message';

// Container types
export type {
  ContainerBaseProps,
  ContainerProps,
} from './container';
export { getMaxWidth } from './container';

// Flex types
export type {
  FlexBaseProps,
  FlexProps,
  FlexJustify,
  FlexAlign,
  FlexWrap,
  FlexGap,
} from './flex';
export {
  getGapValue,
  getJustifyClass,
  getAlignClass,
  getWrapClass,
} from './flex';

// Grid (Row/Col) types
export type {
  Gutter,
  Breakpoint,
  ResponsiveGutter,
  RowJustify,
  RowAlign,
  RowBaseProps,
  RowProps,
  ColSpanConfig,
  ColBaseProps,
  ColProps,
} from './grid';
export {
  parseGutter,
  getColWidth,
  getResponsiveSpan,
} from './grid';

// Space types
export type {
  SpaceBaseProps,
  SpaceProps,
  SpaceSize,
  SpaceDirection,
  SpaceAlign,
} from './space';
export {
  getSizeValue,
  parseSpaceSize,
  getSpaceAlignClass,
} from './space';

// Stack types
export type {
  StackBaseProps,
  StackProps,
  StackJustify,
  StackAlign,
  StackGap,
} from './stack';
export {
  getStackGapValue,
  getStackJustifyClass,
  getStackAlignClass,
} from './stack';

// Notification types
export type {
  NotificationType,
  NotificationPlacement,
  NotificationConfig,
  NotificationGlobalConfig,
  NotificationInstance,
} from './notification';
export {
  getNotificationTypeStyles,
  getPlacementClasses,
} from './notification';

// List types
export type {
  ListGridConfig,
  ListPaginationConfig,
  ListSpinConfig,
  ListBaseProps,
  ListProps,
  ListItemProps,
  ListItemMetaProps,
} from './list';

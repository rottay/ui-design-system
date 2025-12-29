/**
 * Navigation primitives
 */

export { Tabs } from './Tabs';
export type { TabsProps, TabItem, TabsType, TabsSize } from './Tabs';

export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';

export { Pagination } from './Pagination';
export type { PaginationProps, PaginationSize } from './Pagination';

// Menu
export { Menu, MenuItem, MenuGroup, MenuSubMenu, MenuDivider } from './Menu';
export type {
  MenuProps,
  MenuItemType as MenuItemInterface,
  MenuMode,
  MenuItemType as MenuItemTypeEnum,
  MenuSelectInfo,
  MenuClickInfo,
  MenuItemProps,
  MenuGroupProps,
  MenuSubMenuProps,
  MenuDividerProps,
} from './Menu';
export { MENU_DEFAULTS } from './Menu';

// Stepper
export { Stepper, StepperStep, StepperContent } from './Stepper';
export type {
  StepperProps,
  StepItem as StepperStepItem,
  StepperDirection,
  StepperSize,
  StepperVariant,
  StepStatus as StepperStepStatus,
  LabelPlacement,
  StepProps,
  StepContentProps,
} from './Stepper';
export { STEPPER_DEFAULTS, SIZE_MAP as STEPPER_SIZE_MAP, FONT_SIZE_MAP as STEPPER_FONT_SIZE_MAP } from './Stepper';

// Wave 4 - New Navigation Components
export { Steps } from './Steps';
export type { StepsProps, StepItem, StepStatus, ProgressDotInfo } from './Steps';
export { STEPS_DEFAULTS } from './Steps';

export { Affix } from './Affix';
export type { AffixProps } from './Affix';
export { AFFIX_DEFAULTS } from './Affix';

export { Segmented } from './Segmented';
export type { SegmentedProps, SegmentedOption } from './Segmented';
export { SEGMENTED_DEFAULTS } from './Segmented';

export { BackTop } from './BackTop';
export type { BackTopProps } from './BackTop';
export { BACKTOP_DEFAULTS } from './BackTop';

export { Anchor } from './Anchor';
export type { AnchorProps, AnchorLinkProps } from './Anchor';
export { ANCHOR_DEFAULTS } from './Anchor';

export { FloatButton } from './FloatButton';
export type {
  FloatButtonProps,
  FloatButtonGroupProps,
  FloatButtonBackTopProps,
} from './FloatButton';
export { FLOAT_BUTTON_DEFAULTS } from './FloatButton';

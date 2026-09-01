/**
 * @fileoverview Navigation primitives barrel export.
 * Re-exports all navigation-category primitive components.
 */

export { Tabs } from './tabs';
export type { TabsProps, TabItem, TabsType, TabsSize } from './tabs';

export { Breadcrumb } from './breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './breadcrumb';

export { Pagination } from './pagination';
export type { PaginationProps, PaginationSize } from './pagination';

// Menu
export { Menu, MenuItem, MenuGroup, MenuSubMenu, MenuDivider } from './menu';
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
} from './menu';
export { MENU_DEFAULTS } from './menu';

// Stepper
export { Stepper, StepperStep, StepperContent } from './stepper';
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
} from './stepper';
export { STEPPER_DEFAULTS, SIZE_MAP as STEPPER_SIZE_MAP, FONT_SIZE_MAP as STEPPER_FONT_SIZE_MAP } from './stepper';

// Wave 4 - New Navigation Components
export { Steps } from './steps';
export type { StepsProps, StepItem, StepStatus, ProgressDotInfo } from './steps';
export { STEPS_DEFAULTS } from './steps';

export { Affix } from './affix';
export type { AffixProps } from './affix';
export { AFFIX_DEFAULTS } from './affix';

export { Segmented } from './segmented';
export type { SegmentedProps, SegmentedOption } from './segmented';
export { SEGMENTED_DEFAULTS } from './segmented';

export { BackTop } from './back-top';
export type { BackTopProps } from './back-top';
export { BACKTOP_DEFAULTS } from './back-top';

export { Anchor } from './anchor';
export type { AnchorProps, AnchorLinkProps } from './anchor';
export { ANCHOR_DEFAULTS } from './anchor';

// NavLink is the canonical navigation-primitive name. Typography.Link is a
// separate compound owned by the Typography primitive; this module declares
// `NavLink` directly (no rename-on-export alias) so nothing here ever
// competes with or blurs into that name.
export { NavLink } from './link';
export type { LinkProps as NavLinkProps, LinkType as NavLinkType } from './link';
export { LINK_DEFAULTS as NAV_LINK_DEFAULTS, LINK_TYPE_COLORS as NAV_LINK_TYPE_COLORS } from './link';

export { FloatButton } from './float-button';
export type {
  FloatButtonProps,
  FloatButtonGroupProps,
  FloatButtonBackTopProps,
} from './float-button';
export { FLOAT_BUTTON_DEFAULTS } from './float-button';

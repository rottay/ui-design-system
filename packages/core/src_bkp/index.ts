// ============================================
// COMPONENTS
// ============================================
export * from './components';

// ============================================
// PROVIDERS
// ============================================
export * from './providers';

// Main provider (recommended)
export { UIProvider, DesignSystemProvider } from './providers/DesignSystemProvider';
export type { UIProviderProps, DesignSystemProviderProps } from './providers/DesignSystemProvider';

// Separated providers (advanced)
export { ThemeProvider, ThemeContext } from './providers/ThemeProvider';
export type { ThemeProviderProps, ThemeContextType } from './providers/ThemeProvider';

export { EngineProvider, useEngineContext } from './providers/EngineProvider';
export type { EngineProviderProps } from './providers/EngineProvider';

// ============================================
// HOOKS
// ============================================
export * from './hooks';

// DS Core Hooks
export { useTheme } from './hooks/useTheme';
export { useEngine, useIsEngine } from './hooks/useEngine';
export { useTenant } from './hooks/useTenant';
export { useBranding } from './hooks/useBranding';
export { useDefaults, useDefaultVariant } from './hooks/useDefaults';

// ============================================
// THEMES
// ============================================
export * from './themes';
export { templates } from './themes';
export type { TemplateName, TemplateConfig } from './themes/types';

// ============================================
// TYPES - ENGINE
// ============================================
export type { Engine, EngineFeatures } from './types/engine';
export { ENGINE_LIBRARY_MAP, ENGINE_FEATURES, DEFAULT_ENGINE, ENGINES } from './types/engine';

// ============================================
// TYPES - COMPONENTS (Unified)
// ============================================
// Note: SelectOption is also exported from FormBuilder for backward compatibility
export type {
  ButtonBaseProps,
  ButtonProps,
  InputBaseProps,
  InputProps,
  TextAreaProps,
  PasswordProps,
  SelectOption as UnifiedSelectOption,
  SelectOptionGroup,
  SelectBaseProps,
  SelectProps,
  CheckboxBaseProps,
  CheckboxProps,
  CheckboxGroupOption,
  CheckboxGroupProps,
} from './types/components';

export {
  isLoadingWithDelay,
  getLoadingState,
  isOptionGroups,
  flattenOptionGroups,
  isCheckboxGroupOption,
  normalizeCheckboxOptions,
  toggleValueInArray,
} from './types/components';

// Types - Config
export type {
  BrandingConfig,
  DefaultsConfig,
  DSConfig,
  LoginFormVariant,
  RegisterFormVariant,
  DashboardVariant,
  UserProfileVariant,
} from './providers/DesignSystemProvider';

// Design Tokens
export * from './tokens';

// Icons (Icon component only, icons imported from /icons subpath)
export { Icon } from './icons/Icon';
export type { IconProps, IconSize } from './icons/Icon';

// Layout Patterns (export only the new components to avoid conflicts)
export { HStack } from './layout-patterns/HStack';
export { Center } from './layout-patterns/Center';
export { Spacer } from './layout-patterns/Spacer';
export { Wrap } from './layout-patterns/Wrap';
export { Grid as LayoutGrid } from './layout-patterns/Grid';
export { Section } from './layout-patterns/Section';
export { AspectRatio } from './layout-patterns/AspectRatio';
export type { HStackProps, HStackGap } from './layout-patterns/HStack';
export type { CenterProps } from './layout-patterns/Center';
export type { SpacerProps } from './layout-patterns/Spacer';
export type { WrapProps, WrapGap } from './layout-patterns/Wrap';
export type { GridProps, GridGap, ResponsiveColumns } from './layout-patterns/Grid';
export type { SectionProps, SectionSize } from './layout-patterns/Section';
export type { AspectRatioProps, AspectRatioPreset } from './layout-patterns/AspectRatio';

// Composite Components (Level 2 - Compositions of primitives)
export { EmptyState } from './composite/EmptyState';
export { PageHeader } from './composite/PageHeader';
export { DashboardCard } from './composite/DashboardCard';
export { AuthLayout } from './composite/AuthLayout';
export { SearchableSelect } from './composite/SearchableSelect';
export { DashboardLayout } from './composite/DashboardLayout';
export { DataTable } from './composite/DataTable';
export { FormBuilder } from './composite/FormBuilder';
export { UserMenu } from './composite/UserMenu';
export { SearchBar } from './composite/SearchBar';
export { NotificationCenter } from './composite/NotificationCenter';
export { Sidebar } from './composite/Sidebar';
export { FileUploader } from './composite/FileUploader';
export { Toast, ToastProvider, useToast } from './composite/Toast';
export { ErrorBoundary, DefaultErrorFallback } from './composite/ErrorBoundary';
export { SkeletonLoader } from './composite/SkeletonLoader';
export { BottomSheet } from './composite/BottomSheet';
export type {
  EmptyStateProps,
  EmptyStateVariant,
  EmptyStateSize,
  EmptyStateAction,
} from './composite/EmptyState';
export type { PageHeaderProps } from './composite/PageHeader';
export type {
  DashboardCardProps,
  DashboardCardColor,
  DashboardCardTrend,
} from './composite/DashboardCard';
export type {
  AuthLayoutProps,
  AuthBackgroundVariant,
  AuthLayoutPosition,
} from './composite/AuthLayout';
export type {
  SearchableSelectProps,
  SearchableSelectOption,
} from './composite/SearchableSelect';
export type { DashboardLayoutProps, MenuItem } from './composite/DashboardLayout';
export type { DataTableProps, DataTableColumn } from './composite/DataTable';
export type {
  FormBuilderProps,
  FormField,
  FieldType,
  SelectOption,
  FieldDependency,
  CustomValidator,
} from './composite/FormBuilder';
export type { UserMenuProps, UserInfo, UserMenuItem } from './composite/UserMenu';
export type { SearchBarProps, SearchResult } from './composite/SearchBar';
export type { NotificationCenterProps, Notification } from './composite/NotificationCenter';
export type { SidebarProps, SidebarItem, SidebarGroup } from './composite/Sidebar';
export type { FileUploaderProps, UploadedFile } from './composite/FileUploader';
export type {
  ToastType,
  ToastPosition,
  ToastAction,
  ToastOptions,
  ToastData,
  ToastContextValue,
  ToastProviderProps,
  ToastComponentProps,
} from './composite/Toast';
export type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  DefaultErrorFallbackProps,
} from './composite/ErrorBoundary';
export type {
  SkeletonLoaderProps,
  SkeletonVariant,
  SkeletonSize,
} from './composite/SkeletonLoader';
export type { BottomSheetProps } from './composite/BottomSheet';

// ============================================
// ENGINE ROUTING SYSTEM
// ============================================
export {
  createEngineComponent,
  lazyEngine,
  type EngineImplementations,
} from './engine/createEngineComponent';
export { withEngineRouting, withEngineRoutingRef } from './engine/withEngineRouting';
export { EngineSwitch, EngineOnly, EngineExcept } from './engine/EngineSwitch';

// ============================================
// ENGINE IMPLEMENTATIONS
// ============================================
// Note: Individual engine implementations (Hermes/DaisyUI, Apollo/Tailwind)
// are now internal. Use the unified components (Button, Input, etc.) which
// automatically route to the correct engine based on UIProvider configuration.
// Example: <Button> will use HermesButton, ApolloButton, or TitanButton
// depending on the current engine context.

// ============================================
// ATHENA ENGINE (Extensible/Custom)
// ============================================
export {
  registerAthenaComponent,
  registerAthenaComponents,
  getAthenaComponent,
  clearAthenaRegistry,
  getAthenaRegistry,
  AthenaPlaceholder,
  ATHENA_PROPOSED_LIBRARIES,
} from './athena';
export type {
  AthenaComponentName,
  AthenaRegistry,
  AthenaConfig,
  AthenaButtonProps,
  AthenaInputProps,
  AthenaSelectProps,
  AthenaCardProps,
  AthenaModalProps,
} from './athena';

// HeroUI Components - UX-enhanced components from HeroUI
export { Kbd } from './components/HeroUI/Kbd';
export { Chip } from './components/HeroUI/Chip';
export { ScrollShadow } from './components/HeroUI/ScrollShadow';
export type { KbdProps } from './components/HeroUI/Kbd';
export type {
  ChipProps,
  ChipVariant,
  ChipColor,
  ChipSize,
  ChipRadius,
} from './components/HeroUI/Chip';
export type {
  ScrollShadowProps,
  ScrollShadowOrientation,
  ScrollShadowSize,
  ScrollShadowVisibility,
} from './components/HeroUI/ScrollShadow';

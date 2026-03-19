/**
 * @fileoverview Surface type definitions -- the contract layer above patterns.
 * @description Defines config interfaces for every surface (ListSurface, DashboardSurface,
 * ChatSurface, etc.). Each config follows a three-section structure:
 * - `presentation` -- what the user sees (titles, renderers, custom slots)
 * - `behavior` -- what the surface does (data, actions, callbacks)
 * - `visual` -- how it looks (layout variants, responsive hints, maxWidth)
 * Plus optional `permissions` for field/action/tab gating.
 */

import type { ReactNode } from 'react';
import type {
  CalendarEvent,
  ColumnDef,
  FieldDef,
  FeedItem,
  FilterDef,
  PaginationConfig,
  SortConfig,
  StatDef,
  FormBuilderProps,
  DetailPanelProps,
  StepWizardProps,
  AssistantMessagePart,
  AssistantMessageRole,
  AssistantDeliveryStatus,
} from '../patterns';
import type { GridColumns } from '../primitives/layout/Grid';
import type { TabsProps } from '../primitives/navigation/Tabs';

/**
 * Canonical field metadata published by an adapter.
 *
 * `fieldId` is the important part. It is the stable identifier that lets
 * adapters, permissions, and surface configs talk about the same field.
 */
export interface EntityFieldMeta<TView> {
  key: keyof TView & string;
  fieldId: string;
  label?: string;
  description?: string;
}

/**
 * Adapter boundary between raw domain data and the shape a surface consumes.
 */
export interface EntityAdapter<TRaw, TView> {
  entity: string;
  version: string;
  map: (raw: TRaw) => TView;
  fields: EntityFieldMeta<TView>[];
}

/**
 * Shared page chrome used by surfaces that render a page-level shell.
 *
 * Every surface that wraps a full page (List, Dashboard, Form, etc.) accepts
 * a `SurfacePageChrome` in its `presentation` section. This keeps page-level
 * navigation (breadcrumbs, back button, title) consistent across the entire
 * surface catalog without requiring each surface to re-define these props.
 */

/** A single breadcrumb segment. Provide `href` for link navigation or `onClick` for SPA routing. */
export interface SurfaceBreadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Page-level chrome shared across all page surfaces.
 *
 * Surfaces pass this to `PageShellSurface` which delegates to `PatternPageShell`.
 * Keeping chrome separate from content lets apps swap page titles without
 * rebuilding the surface config.
 */
export interface SurfacePageChrome {
  /** Primary page heading rendered in the shell header. */
  title: string;
  /** Secondary text or node shown below the title. */
  subtitle?: ReactNode;
  /** Breadcrumb trail for hierarchical navigation. */
  breadcrumbs?: SurfaceBreadcrumb[];
  /** Optional badge rendered inline with the title (e.g., status pill, count). */
  badge?: ReactNode;
  /** Constrains the shell content width. Accepts CSS values or pixel numbers. */
  maxWidth?: number | string;
  /** Back navigation. When provided, the shell renders a back arrow/link. */
  back?: {
    label?: string;
    onClick: () => void;
  };
}

/**
 * Declarative action descriptor used across all surfaces.
 *
 * Apps own the actual handlers; surfaces own placement, permissions gating,
 * and rendering. The generic `TView` parameter lets row-level actions (e.g.,
 * in ListSurface) receive the item they act on, while page-level actions
 * use `void`.
 *
 * @typeParam TView - The data type the action operates on. `void` for global
 *   actions (e.g., "Create New"), an entity view type for row/item actions.
 *
 * @example
 * ```ts
 * const deleteAction: SurfaceAction<UserView> = {
 *   id: 'delete-user',
 *   label: 'Delete',
 *   variant: 'danger',
 *   onClick: (user) => confirmDelete(user.id),
 *   visible: (user) => user.status !== 'deleted',
 * };
 * ```
 */
export interface SurfaceAction<TView = void> {
  /** Stable identifier used for permission gating and test selectors. */
  id: string;
  /** Human-readable label shown in buttons/menus. */
  label: string;
  /** Optional leading icon rendered beside the label. */
  icon?: ReactNode;
  /** Visual variant controlling button emphasis and color. */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Handler invoked when the action is triggered. Receives the item for row actions. */
  onClick?: (item: TView) => void | Promise<void>;
  /** Predicate controlling whether the action is rendered for a given item. */
  visible?: (item: TView) => boolean;
  /** When true, the action renders in a disabled state. */
  disabled?: boolean;
  /** When true, the action shows a loading spinner. */
  loading?: boolean;
}

/**
 * Permissions are intentionally lightweight.
 *
 * The surface only needs to know whether a field or action is allowed. Apps can
 * provide explicit grants or their own callback if permission logic is more
 * dynamic than a simple string list.
 *
 * The design avoids coupling to any specific RBAC implementation. The `granted`
 * array and per-element rules are the simple path; the `isAllowed` callback is
 * the escape hatch for apps with complex runtime permission logic.
 */

/** A single permission requirement attached to a field, action, or tab. */
export interface SurfacePermissionRule {
  /** Permission string that must be present in `granted` or pass `isAllowed`. */
  permission: string;
  /** Human-readable reason shown when access is denied (e.g., tooltip text). */
  reason?: string;
}

/**
 * Permission configuration accepted by every surface config's `permissions` field.
 *
 * Surfaces check this config before rendering fields, actions, or tabs. If
 * neither `granted` nor `isAllowed` is provided, everything is allowed by
 * default (open access).
 */
export interface SurfacePermissionsConfig {
  /** Flat list of granted permission strings. Surfaces match these against rules. */
  granted?: string[];
  /** Per-field permission rules, keyed by `fieldId`. */
  fields?: Record<string, SurfacePermissionRule | undefined>;
  /** Per-action permission rules, keyed by action `id`. */
  actions?: Record<string, SurfacePermissionRule | undefined>;
  /** Per-tab permission rules, keyed by tab `key`. */
  tabs?: Record<string, SurfacePermissionRule | undefined>;
  /** Dynamic callback for apps needing runtime permission evaluation. */
  isAllowed?: (input: {
    kind: 'field' | 'action' | 'tab';
    id: string;
    permission?: string;
  }) => boolean;
}

/**
 * Shared tabbed view descriptor used by several page-level surfaces.
 *
 * Settings, visualization pages, and sectioned headers all need the same
 * "named view with optional icon and content" contract. Keeping one shared
 * shape reduces the chance that every surface drifts into its own flavor.
 */
export interface SurfaceTabbedView {
  key: string;
  label: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
  permissionId?: string;
}

// ---------------------------------------------------------------------------
// List surface contracts
// ---------------------------------------------------------------------------

/**
 * The two view modes a ListSurface can render.
 * Table is the default for data-dense operator screens; cards suit
 * media-heavy or consumer-facing lists.
 */
export type ListSurfaceView = 'table' | 'cards';

/**
 * Extended column definition that adds surface-level metadata on top of the
 * pattern-level `ColumnDef`. The `fieldId` ties the column to the adapter's
 * `EntityFieldMeta` and to permission rules, enabling per-field gating.
 *
 * @typeParam TView - The row data shape the column renders against.
 */
export interface SurfaceColumn<TView> extends ColumnDef<TView> {
  /** Stable field identifier matching `EntityFieldMeta.fieldId` and permission keys. */
  fieldId: string;
  /** When true, this column is omitted in card view but shown in table view. */
  hideInCards?: boolean;
  /** When true, this column is omitted in table view but shown in card view. */
  hideInTable?: boolean;
}

/** Visual configuration controlling layout density and view mode for lists. */
export interface ListSurfaceVisualConfig {
  /** Initial view mode. Defaults to product profile's `listView` preference. */
  defaultView?: ListSurfaceView;
  /** View mode used on mobile by default. Defaults to `'cards'` for dense lists. */
  mobileDefaultView?: ListSurfaceView;
  /** Show a toggle letting users switch between table and card views. */
  allowViewSwitch?: boolean;
  /** Hide the list/cards toggle on mobile when the surface already chooses the best presentation. */
  hideViewSwitchOnMobile?: boolean;
  /** Minimum card width in card view. Overrides the profile-driven default. */
  cardMinWidth?: number;
  /** Render the list in compact density regardless of profile settings. */
  compact?: boolean;
  /** Pin the table header while scrolling the body. */
  stickyHeader?: boolean;
  /** Constrain list height and enable vertical scrolling. */
  maxHeight?: number | string;
  /** Filter layout used on mobile; defaults to the more legible stacked layout. */
  mobileFiltersLayout?: 'inline' | 'stacked' | 'sidebar';
}

/** Presentation slots for list chrome, empty states, and custom renderers. */
export interface ListSurfacePresentationConfig<TView> {
  chrome: SurfacePageChrome;
  /** Rendered when the data set is empty. */
  emptyState?: ReactNode;
  /** Extra toolbar content on the leading side (e.g., filter chips). */
  toolbarStart?: ReactNode;
  /** Extra toolbar content on the trailing side (e.g., export button). */
  toolbarEnd?: ReactNode;
  /** Custom card renderer used in card view. Falls back to an auto-generated card. */
  renderCard?: (item: TView, index: number) => ReactNode;
  /** Per-column cell overrides, keyed by column `fieldId`. */
  renderCell?: Partial<Record<string, (value: unknown, item: TView, index: number) => ReactNode>>;
}

/** Behavioral config: data, filtering, pagination, sorting, and actions for lists. */
export interface ListSurfaceBehaviorConfig<TView> {
  /** Column definitions for the table/card views. Order determines display order. */
  columns: SurfaceColumn<TView>[];
  /** Filter definitions rendered in the filter bar. */
  filters?: FilterDef[];
  /** Current filter values (controlled). */
  filterValues?: Record<string, unknown>;
  /** Called when any filter value changes. */
  onFilterChange?: (values: Record<string, unknown>) => void;
  /** Called when the user resets all filters. */
  onFilterReset?: () => void;
  /** Called when the user explicitly applies pending filter changes. */
  onFilterApply?: (values: Record<string, unknown>) => void;
  /** Pagination config. Pass `false` to disable pagination entirely. */
  pagination?: PaginationConfig | false;
  /** How to derive a stable key per row. Defaults to `id` if present. */
  rowKey?: keyof TView | ((row: TView) => string);
  /** Current sort state. `null` means no active sort. */
  sorting?: SortConfig | null;
  /** Called when the user changes the sort column or direction. */
  onSortChange?: (sort: SortConfig) => void;
  /** Page-level primary action (e.g., "Create New"). */
  primaryAction?: SurfaceAction<void>;
  /** Per-row contextual actions rendered in a dropdown or action column. */
  rowActions?: SurfaceAction<TView>[];
  /** Called when a row is clicked (outside of action buttons). */
  onRowClick?: (item: TView, index: number) => void;
}

/**
 * Complete list surface configuration following the standard three-section
 * layout: visual, presentation, behavior, plus optional permissions.
 *
 * @typeParam TView - The view-model type for each row/card item.
 */
export interface ListSurfaceConfig<TView> {
  visual: ListSurfaceVisualConfig;
  presentation: ListSurfacePresentationConfig<TView>;
  behavior: ListSurfaceBehaviorConfig<TView>;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Dashboard surface contracts
// ---------------------------------------------------------------------------

/**
 * A named section within a dashboard grid.
 *
 * Sections are placed in a CSS grid controlled by `DashboardSurfaceVisualConfig.sectionsColumns`.
 * Each section can optionally span multiple columns and choose between a card
 * wrapper or a plain container.
 */
export interface DashboardSurfaceSection {
  /** Unique key used for React reconciliation and permission gating. */
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  /** The section body. Typically a chart, table, or custom widget. */
  content: ReactNode;
  /** Number of grid columns this section spans. */
  span?: number;
  /** Wrapping style: `card` adds elevation/border, `plain` renders inline. */
  chrome?: 'card' | 'plain';
  /** Optional action nodes rendered in the section header. */
  actions?: ReactNode;
  /** Lower values render earlier on mobile, letting key sections rise to the top. */
  mobilePriority?: number;
  /** Hide the section completely on mobile when it is secondary context. */
  hideOnMobile?: boolean;
  /** Optional span override used only on mobile when sections do not fully stack. */
  mobileSpan?: number;
}

/** Visual layout hints for the dashboard grid and KPI row. */
export interface DashboardSurfaceVisualConfig {
  /** Number of columns in the KPI stat row at desktop width. */
  statsColumns?: number;
  /** Limit the number of KPI cards shown on mobile to the most important few. */
  mobileStatsLimit?: number;
  /** Grid column configuration for the sections area. */
  sectionsColumns?: GridColumns;
  /** Mobile grid column configuration for the sections area. Defaults to a single column. */
  mobileSectionsColumns?: GridColumns;
  /** Stack sections into a single column on mobile. Defaults to `true`. */
  stackSectionsOnMobile?: boolean;
}

/** Presentation slots for dashboard page chrome and content sections. */
export interface DashboardSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Additional content rendered between the page title and the stats row. */
  headerContent?: ReactNode;
  /** Grid sections making up the dashboard body. */
  sections?: DashboardSurfaceSection[];
}

/** Behavioral config: KPI stats, header actions, and stat interaction. */
export interface DashboardSurfaceBehaviorConfig {
  /** KPI cards rendered in the top stats row. */
  stats?: StatDef[];
  /** Actions rendered in the page header area (e.g., "Export", "Refresh"). */
  headerActions?: SurfaceAction<void>[];
  /** Called when a KPI stat card is clicked. */
  onStatClick?: (stat: StatDef) => void;
}

/**
 * Complete dashboard surface configuration.
 * Dashboards combine KPI stats with a flexible grid of content sections.
 */
export interface DashboardSurfaceConfig {
  visual: DashboardSurfaceVisualConfig;
  presentation: DashboardSurfacePresentationConfig;
  behavior: DashboardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Detail surface contracts
// ---------------------------------------------------------------------------

/**
 * A tab within a detail surface. Each tab lazily renders its content based on
 * the current entity item, allowing tabbed sub-views on entity detail pages.
 *
 * @typeParam TView - The entity view-model providing data to the tab content.
 */
export interface DetailSurfaceTab<TView> {
  /** Stable tab key used for routing and permission gating. */
  key: string;
  label: string;
  icon?: ReactNode;
  /** Badge count or label. Can be static or derived from the item. */
  badge?: number | string | ((item: TView) => number | string | undefined);
  disabled?: boolean;
  /** Controls tab visibility. Can be static or item-dependent. */
  visible?: boolean | ((item: TView) => boolean);
  /** Permission key checked against `SurfacePermissionsConfig.tabs`. */
  permissionId?: string;
  /** Render function receiving the entity item. Called only when the tab is active. */
  content: (item: TView) => ReactNode;
}

/**
 * Presentation slots for detail pages: title derivation, avatar, status badge,
 * sidebar, and tab definitions. All render functions receive the entity item
 * so the UI stays reactive to data changes.
 */
export interface DetailSurfacePresentationConfig<TView> {
  /** Partial page chrome. Detail surfaces derive their title from the entity, so only breadcrumbs/back are needed. */
  chrome?: Pick<SurfacePageChrome, 'breadcrumbs' | 'maxWidth' | 'back'>;
  /** Derives the page title from the current entity. */
  title: (item: TView) => ReactNode;
  subtitle?: (item: TView) => ReactNode;
  avatar?: (item: TView) => ReactNode;
  /** Derives a status badge (e.g., "Active", "Archived") from the entity. */
  status?: (item: TView) => { label: string; color?: string } | undefined;
  /** Tab definitions for tabbed sub-views within the detail page. */
  tabs?: DetailSurfaceTab<TView>[];
  /** Sidebar content rendered alongside the main detail body. */
  sidebar?: (item: TView) => ReactNode;
  /** Extra content rendered in the header area after the title/status. */
  headerExtra?: (item: TView) => ReactNode;
  footer?: (item: TView) => ReactNode;
}

/** Behavioral config: entity-level actions and tab navigation state. */
export interface DetailSurfaceBehaviorConfig<TView> {
  /** Actions rendered in the detail header (e.g., Edit, Delete, Archive). */
  actions?: SurfaceAction<TView>[];
  /** Currently active tab key (controlled). */
  activeTab?: string;
  /** Called when the user switches tabs. */
  onTabChange?: (key: string) => void;
}

/** Visual hints for the detail page sidebar layout. */
export interface DetailSurfaceVisualConfig {
  /** Which side the sidebar renders on ('start' or 'end'). */
  sidebarPosition?: DetailPanelProps<unknown>['sidebarPosition'];
  /** Fixed sidebar width. Accepts CSS values or pixel numbers. */
  sidebarWidth?: number | string;
  /** Move the sidebar content below the main detail content on mobile. Defaults to `true`. */
  collapseSidebarOnMobile?: boolean;
}

/**
 * Complete detail surface configuration for entity detail/show pages.
 *
 * @typeParam TView - The entity view-model type displayed on this page.
 */
export interface DetailSurfaceConfig<TView> {
  visual: DetailSurfaceVisualConfig;
  presentation: DetailSurfacePresentationConfig<TView>;
  behavior: DetailSurfaceBehaviorConfig<TView>;
  permissions?: SurfacePermissionsConfig;
  /** Fallback content when no entity is loaded. */
  emptyState?: ReactNode;
}

// ---------------------------------------------------------------------------
// Form surface contracts
// ---------------------------------------------------------------------------

/**
 * Extended field definition that adds surface-level `fieldId` for permission
 * gating on top of the pattern-level `FieldDef`.
 */
export interface SurfaceFieldDef extends FieldDef {
  /** Stable field identifier used for permission checks and adapter mapping. */
  fieldId?: string;
}

/** Visual layout configuration for form surfaces. */
export interface FormSurfaceVisualConfig {
  /** Form layout mode: vertical, horizontal, inline, or steps. */
  layout?: FormBuilderProps['layout'];
  /** Number of columns in multi-column form layouts. */
  columns?: number;
  /** Maximum form width. */
  maxWidth?: number | string;
  /** Stack form fields vertically on mobile. Defaults to true. */
  stackOnMobile?: boolean;
  /** Stack form fields vertically on tablet. Defaults to false. */
  stackOnTablet?: boolean;
  /** Hide the aside rail on mobile so forms stay focused. Defaults to `true`. */
  hideAsideOnMobile?: boolean;
  /** Keep the submit/cancel action cluster visible near the bottom on mobile. */
  mobileActionsSticky?: boolean;
}

/** Presentation slots for form page chrome, descriptions, and field rendering. */
export interface FormSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Instructional text rendered below the page title. */
  description?: ReactNode;
  /** Global error banner rendered above the form fields. */
  error?: ReactNode;
  /** Side panel content rendered alongside the form (e.g., help text, preview). */
  aside?: ReactNode;
  /** Custom field renderer overriding the default FormBuilder field rendering. */
  renderField?: FormBuilderProps['renderField'];
}

/** Behavioral config: fields, values, validation, and submit/cancel actions. */
export interface FormSurfaceBehaviorConfig {
  /** Field definitions driving the form layout. Order determines render order. */
  fields: SurfaceFieldDef[];
  /** Values used to initialize the form on first render. */
  initialValues?: Record<string, unknown>;
  /** Current form values (controlled mode). */
  values?: Record<string, unknown>;
  /** Called on every field change with the full values map. */
  onChange?: (values: Record<string, unknown>) => void;
  /** Called when validation state changes with field-level error messages. */
  onValidationChange?: (errors: Record<string, string>) => void;
  /** Primary submit action. Its `onClick` receives the current form values. */
  submitAction: SurfaceAction<Record<string, unknown>>;
  /** Optional cancel action rendered alongside submit. */
  cancelAction?: SurfaceAction<void>;
  /** Disable all form fields globally. */
  disabled?: boolean;
  /** Render all fields as read-only (view mode). */
  readOnly?: boolean;
  /** Show field labels. Defaults to true. */
  showLabels?: boolean;
  /** Show required field indicators. Defaults to true. */
  showRequired?: boolean;
  /** Step labels for multi-step form layout. */
  stepLabels?: string[];
  /** Current step index (controlled, for step layout). */
  currentStep?: number;
  /** Called when the user navigates between form steps. */
  onStepChange?: (step: number) => void;
}

/** Complete form surface configuration for create/edit pages. */
export interface FormSurfaceConfig {
  visual: FormSurfaceVisualConfig;
  presentation: FormSurfacePresentationConfig;
  behavior: FormSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Wizard surface contracts
// ---------------------------------------------------------------------------

/**
 * Context object passed to wizard step render functions.
 *
 * Gives each step access to shared wizard state so custom step content can
 * read/write values and navigate between steps programmatically.
 */
export interface WizardSurfaceStepRenderContext {
  /** Accumulated form values across all wizard steps. */
  values: Record<string, unknown>;
  /** Zero-based index of the currently visible step. */
  currentStep: number;
  /** Zero-based index of the step being rendered (may differ during transitions). */
  stepIndex: number;
  /** True when this step is the final step before submission. */
  isLastStep: boolean;
  /** Merge new values into the shared wizard state. */
  setValues: (values: Record<string, unknown>) => void;
  /** Navigate to a specific step by zero-based index. */
  goToStep: (step: number) => void;
}

/**
 * Configuration for a single wizard step.
 *
 * Each step can be field-driven (via `fields`) or fully custom (via `content`).
 * The optional `validate` function runs before advancing to the next step,
 * returning `true` to allow, `false` to block, or a string error message.
 */
export interface WizardSurfaceStepConfig {
  /** Stable step key used for routing and tracking completion. */
  key: string;
  /** Step title shown in the step indicator. */
  title: string;
  description?: string;
  /** Icon displayed in the step indicator. */
  icon?: ReactNode;
  /** When true, the user can skip this step without completing it. */
  optional?: boolean;
  /** Field definitions for auto-generated form content within the step. */
  fields?: SurfaceFieldDef[];
  /** Custom step content. Overrides `fields` when provided. */
  content?: ReactNode | ((context: WizardSurfaceStepRenderContext) => ReactNode);
  /** Async validation function called before advancing. Return string for error message. */
  validate?: () => boolean | string | Promise<boolean | string>;
  /** Form layout for this step's fields. 'steps' is excluded since the wizard IS the steps. */
  layout?: Exclude<FormBuilderProps['layout'], 'steps'>;
  /** Column count for this step's form grid. */
  columns?: number;
}

/** Visual layout hints for wizard step indicators and responsive stacking. */
export interface WizardSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Step indicator orientation: horizontal or vertical. */
  orientation?: StepWizardProps['orientation'];
  /** Show a progress bar reflecting completion percentage. */
  showProgress?: boolean;
  /** Allow users to skip optional steps via a skip button. */
  allowSkip?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Use a compact step indicator on mobile (numbers only, no labels). */
  compactStepsOnMobile?: boolean;
}

/** Presentation slots for wizard chrome, step-aware aside/footer, and error display. */
export interface WizardSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  /** Global error banner shown above the current step. */
  error?: ReactNode;
  /** Side panel that can adapt its content based on the current step context. */
  aside?: ReactNode | ((context: WizardSurfaceStepRenderContext) => ReactNode);
  emptyState?: ReactNode;
  /** Footer area that can adapt its content based on the current step context. */
  footer?: ReactNode | ((context: WizardSurfaceStepRenderContext) => ReactNode);
  renderField?: FormBuilderProps['renderField'];
}

/**
 * Behavioral config for wizard surfaces: step definitions, navigation,
 * value accumulation, and submit/cancel/draft actions.
 */
export interface WizardSurfaceBehaviorConfig {
  /** Ordered step definitions making up the wizard flow. */
  steps: WizardSurfaceStepConfig[];
  initialValues?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
  /** Final submit action. Receives accumulated values from all steps. */
  submitAction: SurfaceAction<Record<string, unknown>>;
  /** Current step index (controlled). */
  currentStep?: number;
  onStepChange?: (step: number) => void;
  /** Custom label for the "Next" navigation button. */
  nextLabel?: string;
  /** Custom label for the "Previous" navigation button. */
  prevLabel?: string;
  /** Custom label for the "Skip" button on optional steps. */
  skipLabel?: string;
  cancelAction?: SurfaceAction<void>;
  /** Allows users to save incomplete wizard progress as a draft. */
  saveDraftAction?: SurfaceAction<Record<string, unknown>>;
  disabled?: boolean;
  readOnly?: boolean;
  showLabels?: boolean;
  showRequired?: boolean;
}

/** Complete wizard surface configuration for multi-step flows. */
export interface WizardSurfaceConfig {
  visual: WizardSurfaceVisualConfig;
  presentation: WizardSurfacePresentationConfig;
  behavior: WizardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Header surface contracts
// ---------------------------------------------------------------------------

/** Visual configuration for header surfaces including tab styling. */
export interface HeaderSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Tab rendering style (line, card, etc.). Defaults to profile density preference. */
  tabsType?: TabsProps['type'];
  /** Center-align tabs within the header. Useful for marketing or focused layouts. */
  centeredTabs?: boolean;
  /** Reduce header padding and font sizes on mobile viewports. */
  compactOnMobile?: boolean;
  /** Hide secondary (non-primary) actions on mobile to reduce clutter. */
  hideSecondaryActionsOnMobile?: boolean;
}

/** Presentation slots for header page chrome, description, metadata, and tab content. */
export interface HeaderSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  /** Metadata line rendered below the description (e.g., "Created 3 days ago"). */
  metadata?: ReactNode;
  /** Leading action nodes rendered before the primary actions. */
  actionsStart?: ReactNode;
  /** Extra content rendered in the header body between chrome and tabs. */
  headerContent?: ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: page-level actions and tabbed navigation. */
export interface HeaderSurfaceBehaviorConfig {
  actions?: SurfaceAction<void>[];
  /** Tabbed views rendered below the header chrome. Uses shared `SurfaceTabbedView`. */
  tabs?: SurfaceTabbedView[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

/**
 * Complete header surface configuration.
 * Header surfaces provide the top-of-page chrome with optional tabbed navigation.
 */
export interface HeaderSurfaceConfig {
  visual: HeaderSurfaceVisualConfig;
  presentation: HeaderSurfacePresentationConfig;
  behavior: HeaderSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Sidebar surface contracts
// ---------------------------------------------------------------------------

/**
 * Visual configuration for sidebar layouts.
 *
 * Sidebar surfaces provide a three-column potential layout:
 * sidebar | main content | optional aside. The sidebar can collapse to
 * save horizontal space on constrained viewports.
 */
export interface SidebarSurfaceVisualConfig {
  /** Expanded sidebar width. */
  sidebarWidth?: number | string;
  /** Width when the sidebar is collapsed (icon-only mode). */
  collapsedWidth?: number | string;
  /** Width of the optional right-side aside panel. */
  asideWidth?: number | string;
  /** Whether the sidebar supports collapsing. */
  collapsible?: boolean;
  /** Draw a border between the sidebar and content areas. */
  bordered?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Automatically collapse the sidebar on mobile viewports. */
  collapseOnMobile?: boolean;
}

/** Presentation slots for the sidebar, content area, header, footer, and aside. */
export interface SidebarSurfacePresentationConfig {
  /** Primary sidebar content (navigation, filters, etc.). */
  sidebar: ReactNode;
  /** Main content area. */
  content: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  /** Optional right-side panel for contextual info. */
  aside?: ReactNode;
}

/** Behavioral config for sidebar collapse state and actions. */
export interface SidebarSurfaceBehaviorConfig {
  /** Current collapsed state (controlled). */
  collapsed?: boolean;
  /** Called when the user toggles the sidebar collapse state. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Accessible label for the collapse toggle button. */
  toggleLabel?: string;
  actions?: SurfaceAction<void>[];
}

/**
 * Complete sidebar surface configuration for sidebar-driven layouts
 * (e.g., settings pages, admin panels, documentation browsers).
 */
export interface SidebarSurfaceConfig {
  visual: SidebarSurfaceVisualConfig;
  presentation: SidebarSurfacePresentationConfig;
  behavior: SidebarSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Detail-form surface contracts
// ---------------------------------------------------------------------------

/**
 * Visual layout for detail-form surfaces.
 *
 * Detail-form combines a form with a read-only summary panel. In 'split'
 * layout the form and summary sit side-by-side; in 'stacked' the summary
 * renders above or below the form. `formSpan` and `summarySpan` control
 * the column ratio in split mode.
 */
export interface DetailFormSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Grid span for the form area in split layout. */
  formSpan?: number;
  /** Grid span for the summary panel in split layout. */
  summarySpan?: number;
  /** Layout mode: side-by-side or vertically stacked. */
  layout?: 'split' | 'stacked';
  /** Number of columns within the form grid. */
  columns?: number;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Hide the aside/summary panel on mobile to focus on the form. */
  hideAsideOnMobile?: boolean;
}

/** Presentation slots for detail-form chrome, summary panel, and error display. */
export interface DetailFormSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  /** Global form error banner. */
  error?: ReactNode;
  /** Read-only summary panel content (e.g., order summary, preview). */
  summary?: ReactNode;
  /** Title rendered above the summary panel. */
  summaryTitle?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  renderField?: FormBuilderProps['renderField'];
}

/** Behavioral config combining form field management with secondary actions. */
export interface DetailFormSurfaceBehaviorConfig {
  fields: SurfaceFieldDef[];
  initialValues?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
  submitAction: SurfaceAction<Record<string, unknown>>;
  cancelAction?: SurfaceAction<void>;
  /** Additional actions beyond submit/cancel (e.g., "Save as Draft", "Preview"). */
  secondaryActions?: SurfaceAction<void>[];
  disabled?: boolean;
  readOnly?: boolean;
  showLabels?: boolean;
  showRequired?: boolean;
}

/**
 * Complete detail-form surface configuration.
 * Combines a form with a read-only summary panel for checkout-style or
 * edit-with-preview workflows.
 */
export interface DetailFormSurfaceConfig {
  visual: DetailFormSurfaceVisualConfig;
  presentation: DetailFormSurfacePresentationConfig;
  behavior: DetailFormSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Visualization surface contracts
// ---------------------------------------------------------------------------

/** Visual configuration for visualization pages with tabbed chart views. */
export interface VisualizationSurfaceVisualConfig {
  maxWidth?: number | string;
  tabsType?: TabsProps['type'];
  centeredTabs?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Use compact chart rendering on mobile (reduced padding, smaller labels). */
  compactChartsOnMobile?: boolean;
}

/** Presentation slots for visualization chrome and introductory content. */
export interface VisualizationSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Introductory text/content rendered above the chart views. */
  intro?: ReactNode;
  emptyState?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: tabbed chart views, KPI stats, and page actions. */
export interface VisualizationSurfaceBehaviorConfig {
  actions?: SurfaceAction<void>[];
  /** KPI stats rendered in a summary row above the views. */
  stats?: StatDef[];
  /** Tabbed chart/graph views. Each tab contains a different visualization. */
  views: SurfaceTabbedView[];
  /** Currently active view tab key (controlled). */
  activeView?: string;
  onViewChange?: (key: string) => void;
}

/**
 * Complete visualization surface configuration for analytics/reporting pages
 * with tabbed chart views and optional KPI stats.
 */
export interface VisualizationSurfaceConfig {
  visual: VisualizationSurfaceVisualConfig;
  presentation: VisualizationSurfacePresentationConfig;
  behavior: VisualizationSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Search surface contracts
// ---------------------------------------------------------------------------

/**
 * A single search result item.
 *
 * The `data` field carries opaque domain data so result actions and preview
 * panels can operate on the underlying entity without a second fetch.
 */
export interface SearchSurfaceResult {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Secondary metadata shown alongside the result (e.g., date, category). */
  meta?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  /** Thumbnail or avatar image for the result. */
  image?: ReactNode;
  /** Search keywords used for client-side filtering/highlighting. */
  keywords?: string[];
  /** Opaque domain data attached to the result for downstream consumers. */
  data?: unknown;
}

/** Visual configuration for search surfaces including result layout and query thresholds. */
export interface SearchSurfaceVisualConfig {
  /** 'stack' lists results vertically; 'split' shows results with a side preview panel. */
  layout?: 'stack' | 'split';
  maxWidth?: number | string;
  /** Minimum width for individual result cards/rows. */
  resultMinWidth?: number;
  /** Minimum characters required before search fires. Prevents empty queries. */
  minQueryLength?: number;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Keep the search input sticky at the top on mobile. */
  stickySearchOnMobile?: boolean;
}

/** Presentation slots for search input, result rendering, and empty states. */
export interface SearchSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** Shown when no query has been entered yet (e.g., "Type to search..."). */
  emptyQueryState?: ReactNode;
  /** Shown when a query returns no results. */
  emptyResultsState?: ReactNode;
  /** Preview panel content for the currently selected result (split layout). */
  resultPreview?: (result: SearchSurfaceResult) => ReactNode;
  /** Custom result row/card renderer. Receives selection state for highlighting. */
  renderResult?: (
    result: SearchSurfaceResult,
    context: { index: number; selected: boolean }
  ) => ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: query state, results, filtering, and per-result actions. */
export interface SearchSurfaceBehaviorConfig {
  /** Current search query string (controlled). */
  query: string;
  /** Called on every keystroke in the search input. */
  onQueryChange: (query: string) => void;
  /** Called when the user submits the search (e.g., pressing Enter). */
  onQuerySubmit?: (query: string) => void;
  /** Search results to display. */
  results: SearchSurfaceResult[];
  /** Currently selected/highlighted result ID (for keyboard navigation or split preview). */
  selectedResultId?: string;
  /** Called when the user selects/clicks a result. */
  onSelectResult?: (result: SearchSurfaceResult) => void;
  filters?: FilterDef[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (values: Record<string, unknown>) => void;
  onFilterReset?: () => void;
  onFilterApply?: (values: Record<string, unknown>) => void;
  /** Page-level search actions (e.g., "Save Search", "Export Results"). */
  actions?: SurfaceAction<void>[];
  /** Per-result contextual actions (e.g., "Open", "Copy Link"). */
  resultActions?: SurfaceAction<SearchSurfaceResult>[];
}

/** Complete search surface configuration for search pages with optional filtering and preview. */
export interface SearchSurfaceConfig {
  visual: SearchSurfaceVisualConfig;
  presentation: SearchSurfacePresentationConfig;
  behavior: SearchSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Editor surface contracts
// ---------------------------------------------------------------------------

/**
 * Visual configuration for editor surfaces (code editors, markdown editors,
 * rich-text editors with live preview).
 */
export interface EditorSurfaceVisualConfig {
  maxWidth?: number | string;
  /** 'stack' shows editor and preview vertically; 'split' shows them side-by-side. */
  layout?: 'stack' | 'split';
  /** Minimum height for the editor textarea/component. */
  editorMinHeight?: number | string;
  /** Width of the preview panel in split layout. */
  previewWidth?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Completely hide the toolbar on mobile. */
  hideToolbarOnMobile?: boolean;
  /** Use a compact single-row toolbar on mobile. */
  compactToolbarOnMobile?: boolean;
}

/** Presentation slots for editor chrome, toolbar, preview panel, and status bar. */
export interface EditorSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  /** Toolbar rendered above the editor (e.g., formatting buttons). */
  toolbar?: ReactNode;
  /** Live preview panel rendered alongside or below the editor. */
  preview?: ReactNode;
  /** Helper text rendered below the editor (e.g., markdown syntax tips). */
  helperText?: ReactNode;
  /** Status bar at the bottom (e.g., word count, save status). */
  statusBar?: ReactNode;
  /** Custom editor component renderer. Falls back to a plain textarea. */
  renderEditor?: (
    value: string,
    onChange: (value: string) => void
  ) => ReactNode;
}

/** Behavioral config: content value, save/publish lifecycle, and disabled state. */
export interface EditorSurfaceBehaviorConfig {
  /** Current editor content (controlled). */
  value?: string;
  /** Initial content loaded when the editor mounts. */
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Save action. Receives the current editor content string. */
  saveAction?: SurfaceAction<string>;
  /** Publish action (e.g., "Publish Article"). Receives the content string. */
  publishAction?: SurfaceAction<string>;
  cancelAction?: SurfaceAction<void>;
  disabled?: boolean;
  readOnly?: boolean;
  /** When true, indicates a save operation is in progress. */
  saving?: boolean;
}

/** Complete editor surface configuration for content authoring pages. */
export interface EditorSurfaceConfig {
  visual: EditorSurfaceVisualConfig;
  presentation: EditorSurfacePresentationConfig;
  behavior: EditorSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Operational surface contracts
// ---------------------------------------------------------------------------

/**
 * Live feed configuration for operational surfaces.
 *
 * Operational surfaces (e.g., control rooms, support queues) often include
 * a real-time feed of events. This config supports auto-refresh polling,
 * "N new items" banners, and infinite scroll via `onLoadMore`.
 *
 * @typeParam TFeed - Feed item type extending the base `FeedItem`.
 */
export interface OperationalSurfaceFeedConfig<TFeed extends FeedItem = FeedItem> {
  /** Feed items to render, newest first. */
  items: TFeed[];
  /** Custom renderer for each feed item. */
  renderItem: (item: TFeed, index: number) => ReactNode;
  /** Manual refresh callback. */
  onRefresh?: () => void;
  /** Auto-refresh interval in milliseconds. */
  autoRefresh?: number;
  emptyState?: ReactNode;
  /** Number of new items available (renders a "Show N new" banner). */
  newItemsCount?: number;
  /** Called when the user clicks the "Show new items" banner. */
  onShowNewItems?: () => void;
  /** Infinite scroll callback. Called when the user scrolls near the bottom. */
  onLoadMore?: () => void;
  /** Whether more items are available for infinite scroll. */
  hasMore?: boolean;
  /** Maximum number of items to keep in the DOM. Older items are pruned. */
  maxItems?: number;
  maxHeight?: number | string;
  header?: ReactNode;
}

/** Visual layout hints for operational dashboards with feed panels. */
export interface OperationalSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Grid columns for the dashboard-style sections area. */
  sectionsColumns?: GridColumns;
  /** Grid columns for sections on mobile. Defaults to a single column. */
  mobileSectionsColumns?: GridColumns;
  /** Fixed height for the live feed panel. */
  feedHeight?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Limit the number of KPI cards shown on mobile. */
  mobileStatsLimit?: number;
  /** Where to place the queue module on mobile. Defaults to `'bottom'`. */
  mobileQueuePosition?: 'top' | 'bottom' | 'hidden';
  /** Where to place the live feed on mobile. Defaults to `'bottom'`. */
  mobileFeedPosition?: 'top' | 'bottom' | 'hidden';
  /** Hide the secondary panel on mobile to reduce parallel information density. */
  hideSecondaryPanelOnMobile?: boolean;
  /** Stack the dashboard-style sections into a single column on mobile. Defaults to `true`. */
  stackSectionsOnMobile?: boolean;
}

/** Presentation slots for operational chrome, panels, and dashboard sections. */
export interface OperationalSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  intro?: ReactNode;
  /** Queue panel content (e.g., ticket queue, support inbox). */
  queue?: ReactNode;
  /** Primary content panel (e.g., main workspace area). */
  primaryPanel?: ReactNode;
  /** Secondary content panel (e.g., details sidebar). */
  secondaryPanel?: ReactNode;
  /** Dashboard-style grid sections reused from DashboardSurfaceSection. */
  sections?: DashboardSurfaceSection[];
  emptyState?: ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: KPI stats, feed, and operational actions. */
export interface OperationalSurfaceBehaviorConfig<TFeed extends FeedItem = FeedItem> {
  /** KPI stats for the operational overview. */
  stats?: StatDef[];
  actions?: SurfaceAction<void>[];
  /** Dedicated refresh action for the entire operational view. */
  refreshAction?: SurfaceAction<void>;
  /** Live feed configuration. See OperationalSurfaceFeedConfig. */
  feed?: OperationalSurfaceFeedConfig<TFeed>;
}

/**
 * Complete operational surface configuration for control rooms, support
 * dashboards, and real-time monitoring pages.
 *
 * @typeParam TFeed - Feed item type for the live activity feed.
 */
export interface OperationalSurfaceConfig<TFeed extends FeedItem = FeedItem> {
  visual: OperationalSurfaceVisualConfig;
  presentation: OperationalSurfacePresentationConfig;
  behavior: OperationalSurfaceBehaviorConfig<TFeed>;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Media surface contracts
// ---------------------------------------------------------------------------

/**
 * A single media item in a gallery or detail view.
 *
 * The `type` field drives rendering decisions: images get lightboxes, videos
 * get players, audio gets waveforms, and documents get download links.
 */
export interface MediaSurfaceItem {
  id: string;
  /** Source URL for the full-resolution media asset. */
  src: string;
  /** Alt text for accessibility (images) or title fallback. */
  alt?: string;
  /** Lower-resolution thumbnail URL for grid previews. */
  thumbnailSrc?: string;
  title?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  /** Media type hint driving the appropriate player/viewer. */
  type?: 'image' | 'video' | 'audio' | 'document';
  /** Opaque domain data (e.g., EXIF metadata, upload info). */
  data?: unknown;
}

/** Visual layout for media surfaces (gallery grid vs. detail view). */
export interface MediaSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Number of columns in the gallery grid. */
  columns?: number;
  /** 'gallery' shows a thumbnail grid; 'detail' shows a single item with info panel. */
  layout?: 'gallery' | 'detail';
  /** Height of the preview area in detail mode. */
  previewHeight?: number | string;
  /** Width of the details/info panel in detail mode. */
  detailsWidth?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Maximum number of gallery columns on mobile. */
  mobileColumnsLimit?: number;
}

/** Presentation slots for media rendering: grid items, preview, and details panel. */
export interface MediaSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
  /** Custom grid item renderer with selection state for highlighting. */
  renderGridItem?: (
    item: MediaSurfaceItem,
    context: { index: number; selected: boolean }
  ) => ReactNode;
  /** Custom preview renderer for the selected media item (detail layout). */
  renderPreview?: (item: MediaSurfaceItem) => ReactNode;
  /** Custom details panel renderer for the selected media item. */
  renderDetails?: (item: MediaSurfaceItem) => ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: media items, selection, and per-item actions. */
export interface MediaSurfaceBehaviorConfig {
  items: MediaSurfaceItem[];
  /** Currently selected/highlighted item ID. */
  selectedItemId?: string;
  onSelectItem?: (item: MediaSurfaceItem) => void;
  /** Page-level actions (e.g., "Upload", "Create Album"). */
  actions?: SurfaceAction<void>[];
  /** Per-item actions (e.g., "Download", "Delete", "Share"). */
  itemActions?: SurfaceAction<MediaSurfaceItem>[];
}

/** Complete media surface configuration for gallery and media detail pages. */
export interface MediaSurfaceConfig {
  visual: MediaSurfaceVisualConfig;
  presentation: MediaSurfacePresentationConfig;
  behavior: MediaSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Chat surface contracts
// ---------------------------------------------------------------------------

/**
 * A single message in a chat transcript.
 *
 * Supports both human-to-human messaging and AI assistant conversations.
 * The `parts` field enables structured AI responses (text, code, tool calls),
 * while `body` serves simple plain-text messages.
 */
export interface ChatSurfaceMessage {
  id: string;
  /** Display name or component for the message author. */
  author: ReactNode;
  /** Simple message body. For AI messages, prefer `parts` for structured content. */
  body?: ReactNode;
  /** Structured message parts for AI assistant responses (text, code, tool results). */
  parts?: AssistantMessagePart[];
  timestamp?: ReactNode;
  avatar?: ReactNode;
  /** Additional metadata rendered alongside the message (e.g., "edited", "via API"). */
  meta?: ReactNode;
  /** Attachments (files, images) rendered below the message body. */
  attachments?: ReactNode;
  /** Custom status indicator (e.g., "read", "delivered"). */
  status?: ReactNode;
  /** Alignment: 'start' for incoming messages, 'end' for outgoing/own messages. */
  align?: 'start' | 'end';
  /** Message role for AI conversations: 'user', 'assistant', 'system', or 'tool'. */
  role?: AssistantMessageRole;
  /** Delivery status for real-time messaging (sent, delivered, read, failed). */
  deliveryStatus?: AssistantDeliveryStatus;
  /** When true, indicates the message is still being streamed (AI typing). */
  streaming?: boolean;
}

/** Visual configuration for chat surfaces: transcript area, sidebar, and composer. */
export interface ChatSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Width of the optional sidebar (e.g., conversation list, user info). */
  sidebarWidth?: number | string;
  /** Number of visible rows in the composer textarea. */
  composerRows?: number;
  /** Fixed height for the transcript scroll area. */
  transcriptHeight?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Hide the conversation list sidebar on mobile. */
  hideListOnMobile?: boolean;
  /** Keep the message composer input sticky at the bottom on mobile. */
  stickyInputOnMobile?: boolean;
}

/** Presentation slots for chat chrome, message rendering, and composer placeholder. */
export interface ChatSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Extra header content (e.g., participant list, call controls). */
  headerContent?: ReactNode;
  /** Sidebar content (e.g., conversation list, contact info). */
  sidebar?: ReactNode;
  /** Shown when the transcript is empty (no messages yet). */
  emptyState?: ReactNode;
  /** Placeholder text for the message composer input. */
  composerPlaceholder?: string;
  /** Custom message renderer overriding the default chat bubble. */
  renderMessage?: (message: ChatSurfaceMessage, index: number) => ReactNode;
  /** Custom renderer for individual AI message parts (e.g., code blocks, tool calls). */
  renderPart?: (part: AssistantMessagePart, context: { message: ChatSurfaceMessage; index: number }) => ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: message list, composer state, sending lifecycle, and typing indicators. */
export interface ChatSurfaceBehaviorConfig {
  /** Ordered message list (oldest first). */
  messages: ChatSurfaceMessage[];
  /** Current composer draft text (controlled). */
  draft?: string;
  /** Called on every keystroke in the composer. */
  onDraftChange?: (value: string) => void;
  /** Called when the user sends a message. May be async for optimistic updates. */
  onSend?: (value: string) => void | Promise<void>;
  /** Label for the send button (defaults to "Send"). */
  sendLabel?: string;
  /** When true, the send button shows a loading state. */
  sending?: boolean;
  /** When true, displays a typing indicator for the AI assistant. */
  assistantTyping?: boolean;
  /** Label shown in the typing indicator (e.g., "Assistant is thinking..."). */
  typingLabel?: string;
  actions?: SurfaceAction<void>[];
}

/** Complete chat surface configuration for messaging and AI conversation pages. */
export interface ChatSurfaceConfig {
  visual: ChatSurfaceVisualConfig;
  presentation: ChatSurfacePresentationConfig;
  behavior: ChatSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Scheduler surface contracts
// ---------------------------------------------------------------------------

/** Visual configuration for calendar/scheduler surfaces. */
export interface SchedulerSurfaceVisualConfig {
  maxWidth?: number | string;
  height?: number | string;
  sidebarWidth?: number | string;
  defaultView?: 'month' | 'week' | 'day';
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Override the default calendar view on mobile (e.g., 'list' for a simpler layout). */
  mobileView?: 'list' | 'day' | 'week' | 'month';
  /** Hide the timeline sidebar on mobile. */
  hideTimelineOnMobile?: boolean;
}

/** Presentation slots for scheduler chrome, event rendering, and sidebar. */
export interface SchedulerSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Leading toolbar content (e.g., date navigation arrows). */
  toolbarStart?: ReactNode;
  /** Trailing toolbar content (e.g., view mode switcher). */
  toolbarEnd?: ReactNode;
  /** Sidebar content (e.g., mini calendar, upcoming events list). */
  sidebar?: ReactNode;
  emptyState?: ReactNode;
  /** Custom event renderer for calendar cells. */
  renderEvent?: (event: CalendarEvent) => ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: calendar events, date navigation, and view switching. */
export interface SchedulerSurfaceBehaviorConfig {
  /** Calendar events to display. */
  events: CalendarEvent[];
  /** Currently focused date (controlled). */
  currentDate?: Date;
  /** Active calendar view (controlled). */
  activeView?: 'month' | 'week' | 'day';
  /** Called when the focused date changes (e.g., month navigation). */
  onDateChange?: (date: Date) => void;
  /** Called when the user switches between month/week/day views. */
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  /** Called when the user clicks an existing event. */
  onEventClick?: (event: CalendarEvent) => void;
  /** Called when the user clicks an empty date cell (to create a new event). */
  onDateClick?: (date: Date) => void;
  actions?: SurfaceAction<void>[];
}

/** Complete scheduler surface configuration for calendar/booking pages. */
export interface SchedulerSurfaceConfig {
  visual: SchedulerSurfaceVisualConfig;
  presentation: SchedulerSurfacePresentationConfig;
  behavior: SchedulerSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Compare surface contracts
// ---------------------------------------------------------------------------

/**
 * A subject (column) in a comparison table.
 * Each subject represents one entity being compared (e.g., a pricing plan,
 * a product variant, a candidate).
 */
export interface CompareSurfaceSubject {
  /** Unique key matching the keys in `CompareSurfaceRow.values`. */
  key: string;
  label: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
}

/**
 * A single comparison row showing one attribute across all subjects.
 * The `values` record is keyed by `CompareSurfaceSubject.key`.
 */
export interface CompareSurfaceRow {
  key: string;
  label: ReactNode;
  description?: ReactNode;
  /** Per-subject values. Keys must match subject keys. */
  values: Record<string, ReactNode>;
}

/** A named group of comparison rows, used to organize attributes by category. */
export interface CompareSurfaceSection {
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  rows: CompareSurfaceRow[];
}

/** Visual hints for comparison table density. */
export interface CompareSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Render the comparison in compact mode (smaller cells, tighter spacing). */
  compact?: boolean;
  /** Stack comparison columns vertically on mobile. */
  stackOnMobile?: boolean;
  /** Maximum number of items to compare side-by-side on mobile. */
  mobileCompareLimit?: number;
}

/** Presentation slots for comparison page chrome, intro text, and footer. */
export interface CompareSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Introductory content rendered above the comparison table. */
  intro?: ReactNode;
  /** Shown when no subjects are provided. */
  emptyState?: ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: comparison subjects, rows grouped by section, and actions. */
export interface CompareSurfaceBehaviorConfig {
  /** Column subjects (entities being compared). */
  subjects: CompareSurfaceSubject[];
  /** Comparison sections containing grouped attribute rows. */
  sections: CompareSurfaceSection[];
  actions?: SurfaceAction<void>[];
}

/** Complete compare surface configuration for side-by-side comparison pages. */
export interface CompareSurfaceConfig {
  visual: CompareSurfaceVisualConfig;
  presentation: CompareSurfacePresentationConfig;
  behavior: CompareSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Auth surface contracts
// ---------------------------------------------------------------------------

/**
 * Visual configuration for auth surfaces (login, register, forgot password).
 *
 * Auth surfaces intentionally omit `SurfacePageChrome` because they render
 * outside the normal app shell (no sidebar, no breadcrumbs).
 */
export interface AuthSurfaceVisualConfig {
  maxWidth?: number | string;
  /** 'split' shows a form beside a hero image; 'centered' centers the form. */
  layout?: 'split' | 'centered';
  /** Which side the hero image appears on in split layout. */
  heroPosition?: 'start' | 'end';
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Use a compact form layout on mobile (reduce spacing and padding). */
  compactFormOnMobile?: boolean;
}

/** Presentation slots for auth pages: form, hero image, legal text, and top bar. */
export interface AuthSurfacePresentationConfig {
  /** Small label shown above the auth title (e.g., "Sign in", "Password recovery"). */
  eyebrow?: ReactNode;
  /** Auth page title (e.g., "Sign In", "Create Account"). */
  title: ReactNode;
  subtitle?: ReactNode;
  /** The authentication form component (login form, register form, etc.). */
  form: ReactNode;
  /** Hero image or illustration for split layout. */
  hero?: ReactNode;
  /** Simplified hero content rendered on mobile instead of squeezing the desktop hero. */
  mobileHero?: ReactNode;
  /** Footer content (e.g., "Don't have an account? Sign up"). */
  footer?: ReactNode;
  /** Legal text rendered at the bottom (e.g., terms of service, privacy policy). */
  legal?: ReactNode;
  /** Top bar content (e.g., logo, language switcher). */
  topBar?: ReactNode;
}

/** Behavioral config for auth surfaces. Minimal because auth logic lives in the form. */
export interface AuthSurfaceBehaviorConfig {
  /** Optional surface-level actions (e.g., SSO buttons rendered outside the form). */
  actions?: SurfaceAction<void>[];
}

/** Complete auth surface configuration for login/register/password-reset pages. */
export interface AuthSurfaceConfig {
  visual: AuthSurfaceVisualConfig;
  presentation: AuthSurfacePresentationConfig;
  behavior: AuthSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Marketing surface contracts
// ---------------------------------------------------------------------------

/**
 * Visual configuration for public marketing and pre-auth surfaces.
 *
 * Unlike app-authenticated shells, these surfaces need to support editorial
 * hero layouts, denser desktop previews, and deliberately simplified mobile
 * summaries. The layout system owns stacking and width decisions; apps only
 * provide content.
 */
export interface MarketingSurfaceVisualConfig {
  maxWidth?: number | string;
  heroPosition?: 'start' | 'end';
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

/**
 * Presentation slots for public marketing pages.
 *
 * `hero` is the default rich preview. `mobileHero` lets apps provide a smaller
 * summary card instead of squeezing the desktop preview into a narrow viewport.
 */
export interface MarketingSurfacePresentationConfig {
  topBar?: ReactNode;
  eyebrow?: ReactNode;
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  supporting?: ReactNode;
  mobileSupporting?: ReactNode;
  hero?: ReactNode;
  mobileHero?: ReactNode;
  sections?: ReactNode[];
  footer?: ReactNode;
}

/** Behavioral config for public marketing surfaces. */
export interface MarketingSurfaceBehaviorConfig {
  actions?: SurfaceAction<void>[];
}

/** Complete marketing surface configuration for public landing/pre-auth pages. */
export interface MarketingSurfaceConfig {
  visual: MarketingSurfaceVisualConfig;
  presentation: MarketingSurfacePresentationConfig;
  behavior: MarketingSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Onboarding surface contracts
// ---------------------------------------------------------------------------

/** Visual configuration for onboarding wizard surfaces. */
export interface OnboardingSurfaceVisualConfig {
  maxWidth?: number | string;
  heroPosition?: 'start' | 'end';
  orientation?: StepWizardProps['orientation'];
  showProgress?: boolean;
  allowSkip?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Hide the hero illustration on mobile to save vertical space. */
  hideIllustrationOnMobile?: boolean;
}

/** Presentation slots for onboarding chrome, hero, and progress checklist. */
export interface OnboardingSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  /** Hero image or welcome illustration. */
  hero?: ReactNode;
  /** Checklist component showing overall onboarding progress. */
  checklist?: ReactNode;
  footer?: ReactNode;
  renderField?: FormBuilderProps['renderField'];
  emptyState?: ReactNode;
}

/**
 * Complete onboarding surface configuration.
 *
 * Reuses `WizardSurfaceBehaviorConfig` for step management because
 * onboarding is fundamentally a wizard flow with different presentation.
 */
export interface OnboardingSurfaceConfig {
  visual: OnboardingSurfaceVisualConfig;
  presentation: OnboardingSurfacePresentationConfig;
  /** Reuses wizard behavior: steps, values, navigation, submit. */
  behavior: WizardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Empty-state surface contracts
// ---------------------------------------------------------------------------

/**
 * Empty-state surfaces render when a page has no data yet (e.g., "No
 * projects created"). They provide a focused call-to-action to guide the
 * user toward their first interaction.
 */

/** Visual config for empty-state surfaces. */
export interface EmptyStateSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Reduce padding and font sizes on mobile viewports. */
  compactOnMobile?: boolean;
  /** Hide the illustration graphic on mobile. Set to false to keep it visible. */
  hideIllustrationOnMobile?: boolean;
}

/** Presentation for empty-state: title, description, icon, and optional custom content. */
export interface EmptyStateSurfacePresentationConfig {
  /** Optional page chrome. Many empty states render inline without a full shell. */
  chrome?: SurfacePageChrome;
  /** Primary empty-state heading (e.g., "No projects yet"). */
  title: string;
  /** Explanatory text below the title. */
  description?: string;
  /** Large icon or illustration rendered above the title. */
  icon?: ReactNode;
  /** Custom content rendered below the description. */
  content?: ReactNode;
}

/** Behavioral config: primary and secondary call-to-action buttons. */
export interface EmptyStateSurfaceBehaviorConfig {
  /** Primary CTA (e.g., "Create your first project"). */
  primaryAction?: SurfaceAction<void>;
  /** Secondary CTA (e.g., "Learn more", "Import data"). */
  secondaryAction?: SurfaceAction<void>;
}

/** Complete empty-state surface configuration. */
export interface EmptyStateSurfaceConfig {
  visual: EmptyStateSurfaceVisualConfig;
  presentation: EmptyStateSurfacePresentationConfig;
  behavior: EmptyStateSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Settings surface contracts
// ---------------------------------------------------------------------------

/** Visual configuration for settings pages with tab-based or sidebar navigation. */
export interface SettingsSurfaceVisualConfig {
  maxWidth?: number | string;
  tabsType?: TabsProps['type'];
  centeredTabs?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
  /** Collapse the settings sidebar navigation on mobile. */
  collapseSidebarOnMobile?: boolean;
}

/** Presentation slots for settings chrome, intro text, and optional sidebar. */
export interface SettingsSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Introductory content rendered above the settings tabs. */
  intro?: ReactNode;
  /** Sidebar navigation for settings categories (alternative to tabs). */
  sidebar?: ReactNode;
  footer?: ReactNode;
}

/** Behavioral config: settings tabs, navigation, and page-level actions. */
export interface SettingsSurfaceBehaviorConfig {
  /** Settings category tabs. Each tab contains a settings section. */
  tabs: SurfaceTabbedView[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  actions?: SurfaceAction<void>[];
}

/** Complete settings surface configuration for application settings pages. */
export interface SettingsSurfaceConfig {
  visual: SettingsSurfaceVisualConfig;
  presentation: SettingsSurfacePresentationConfig;
  behavior: SettingsSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Audit surface contracts
// ---------------------------------------------------------------------------

/** Column definition for the audit log table. */
export interface AuditColumn {
  key: string;
  label: string;
  width?: number | string;
  sortable?: boolean;
  render?: (value: unknown, entry: AuditEntry) => ReactNode;
}

/**
 * A single audit log entry recording a user action on a resource.
 * Used by compliance surfaces to display an immutable activity trail.
 */
export interface AuditEntry {
  id: string;
  /** ISO timestamp of when the action occurred. */
  timestamp: string;
  /** Name or identifier of the user who performed the action. */
  actor: string;
  /** Action verb (e.g., "created", "updated", "deleted"). */
  action: string;
  /** Target resource identifier or name. */
  resource: string;
  /** Human-readable description of what changed. */
  details?: string;
  /** Severity level for visual highlighting. */
  severity?: 'info' | 'warning' | 'critical';
  /** Arbitrary metadata for drill-down inspection. */
  metadata?: Record<string, unknown>;
}

/** Filter definition for the audit log toolbar. */
export interface AuditFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'multi-select';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

/** Visual density for the audit log table. */
export interface AuditSurfaceVisualConfig {
  density?: 'compact' | 'comfortable';
  /** Constrain table height and enable vertical scrolling. */
  maxHeight?: string;
  /** Stack audit sections vertically on mobile. */
  stackOnMobile?: boolean;
  /** Use compact audit entries on mobile (fewer visible columns). */
  compactEntriesOnMobile?: boolean;
}

/** Presentation slots for audit log chrome and custom entry rendering. */
export interface AuditSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Custom renderer for individual audit entries (overrides default table row). */
  renderEntry?: (entry: AuditEntry) => ReactNode;
}

/** Behavioral config: audit data, filtering, pagination, and export. */
export interface AuditSurfaceBehaviorConfig {
  columns: AuditColumn[];
  /** Audit log entries to display. */
  entries: AuditEntry[];
  /** Filter definitions for the audit toolbar. */
  filters: AuditFilter[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  pagination?: PaginationConfig;
  /** Export callback. The surface renders export buttons for the specified formats. */
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

/** Complete audit surface configuration for compliance audit log pages. */
export interface AuditSurfaceConfig {
  visual: AuditSurfaceVisualConfig;
  presentation: AuditSurfacePresentationConfig;
  behavior: AuditSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Billing surface contracts
// ---------------------------------------------------------------------------

/** A subscription plan displayed on billing pages. */
export interface BillingPlan {
  name: string;
  price: string;
  interval: string;
  features: string[];
}

/** A usage metric with current/limit values (e.g., API calls, storage). */
export interface BillingUsage {
  label: string;
  /** Current usage count. */
  current: number;
  /** Maximum allowed usage for the current plan. */
  limit: number;
  /** Unit label (e.g., "calls", "GB", "seats"). */
  unit: string;
}

/** An invoice record displayed in the billing history. */
export interface BillingInvoice {
  id: string;
  /** Display date string (e.g., "2026-03-01"). */
  date: string;
  /** Formatted amount string (e.g., "$49.00"). */
  amount: string;
  /** Invoice status (e.g., "paid", "pending", "overdue"). */
  status: string;
  /** URL for downloading the invoice PDF. */
  downloadUrl?: string;
}

/** A saved payment method on file. */
export interface BillingPaymentMethod {
  id: string;
  /** Payment type (e.g., "visa", "mastercard", "bank_transfer"). */
  type: string;
  /** Last four digits of the card/account. */
  last4: string;
  /** Expiration date string (e.g., "12/28"). */
  expiry: string;
  /** Whether this is the default payment method. */
  isDefault: boolean;
}

/** Visual layout for billing surfaces: tabbed sections vs. stacked sections. */
export interface BillingSurfaceVisualConfig {
  /** 'tabs' groups plan/usage/invoices into tabs; 'sections' stacks them vertically. */
  layout?: 'tabs' | 'sections';
  /** Stack billing sections vertically on mobile. */
  stackOnMobile?: boolean;
  /** Collapse the billing sidebar on mobile. */
  collapseSidebarOnMobile?: boolean;
}

/** Presentation slots for billing chrome and custom plan rendering. */
export interface BillingSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Custom renderer for the current plan card/section. */
  renderPlan?: () => ReactNode;
}

/** Behavioral config: plan data, usage metrics, invoices, and billing actions. */
export interface BillingSurfaceBehaviorConfig {
  /** The tenant's current subscription plan. */
  currentPlan: BillingPlan;
  /** Usage metrics for the current billing period. */
  usage?: BillingUsage[];
  /** Invoice history records. */
  invoices?: BillingInvoice[];
  /** Saved payment methods on file. */
  paymentMethods?: BillingPaymentMethod[];
  /** Called when the user initiates a plan upgrade. */
  onUpgrade?: () => void;
  /** Called when the user cancels their subscription. */
  onCancel?: () => void;
  /** Called when the user downloads a specific invoice. */
  onDownloadInvoice?: (id: string) => void;
}

/** Complete billing surface configuration for subscription management pages. */
export interface BillingSurfaceConfig {
  visual: BillingSurfaceVisualConfig;
  presentation: BillingSurfacePresentationConfig;
  behavior: BillingSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Profile surface contracts
// ---------------------------------------------------------------------------

/** A grouped section of user profile fields (e.g., "Personal Info", "Security"). */
export interface ProfileSection {
  key: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  fields: ProfileField[];
}

/** A single editable field within a profile section. */
export interface ProfileField {
  key: string;
  label: string;
  /** Current field value. */
  value?: string;
  /** Input type controlling the rendered input element. */
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
  readOnly?: boolean;
}

/** Visual layout for profile pages: sidebar navigation vs. stacked sections. */
export interface ProfileSurfaceVisualConfig {
  /** 'sidebar' shows section nav on the side; 'stacked' renders all sections vertically. */
  layout?: 'sidebar' | 'stacked';
  /** Stack profile sections vertically on mobile. */
  stackOnMobile?: boolean;
  /** Collapse the profile sidebar navigation on mobile. */
  collapseSidebarOnMobile?: boolean;
}

/** Presentation slots for profile chrome, avatar, and header content. */
export interface ProfileSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Avatar component displayed in the profile header. */
  avatar?: ReactNode;
  /** Custom header content (e.g., name, role, bio). */
  header?: ReactNode;
}

/** Behavioral config: profile sections, save callbacks, and account actions. */
export interface ProfileSurfaceBehaviorConfig {
  /** Profile sections containing grouped fields. */
  sections: ProfileSection[];
  /** Called when the user saves changes in a specific section. */
  onSave?: (section: string, data: Record<string, unknown>) => void;
  /** Called when the user uploads a new avatar image. */
  onAvatarChange?: (file: File) => void;
  /** Called when the user changes their password. */
  onPasswordChange?: (oldPassword: string, newPassword: string) => void;
  /** Called when the user requests account deletion. */
  onDeleteAccount?: () => void;
}

/** Complete profile surface configuration for user profile/account pages. */
export interface ProfileSurfaceConfig {
  visual: ProfileSurfaceVisualConfig;
  presentation: ProfileSurfacePresentationConfig;
  behavior: ProfileSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Notification surface contracts
// ---------------------------------------------------------------------------

/** A single notification item in the notification feed. */
export interface SurfaceNotificationItem {
  id: string;
  title: string;
  message?: string;
  /** ISO timestamp string for display formatting. */
  timestamp: string;
  /** Whether the notification has been read. */
  read: boolean;
  /** Notification severity/type for icon and color treatment. */
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  /** Optional inline action within the notification (e.g., "View", "Approve"). */
  action?: { label: string; onClick: () => void };
}

/** A notification delivery preference for a specific channel. */
export interface NotificationPreference {
  id: string;
  label: string;
  description?: string;
  /** Delivery channel this preference controls. */
  channel: 'email' | 'push' | 'sms' | 'in-app';
  /** Whether notifications are enabled on this channel. */
  enabled: boolean;
  /** Category grouping for organizing preferences in the UI. */
  category?: string;
}

/** Visual layout for notification surfaces. */
export interface NotificationSurfaceVisualConfig {
  /** 'tabs' separates feed and preferences into tabs; 'sections' stacks them. */
  layout?: 'tabs' | 'sections';
  /** Stack notification sections vertically on mobile. */
  stackOnMobile?: boolean;
  /** Use compact notification items on mobile (smaller avatars, shorter text). */
  compactItemsOnMobile?: boolean;
}

/** Presentation slots for notification chrome and empty state. */
export interface NotificationSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Shown when no notifications exist. */
  emptyState?: ReactNode;
}

/** Behavioral config: notification feed, preferences, and bulk actions. */
export interface NotificationSurfaceBehaviorConfig {
  /** Notification items to display in the feed. */
  notifications: SurfaceNotificationItem[];
  /** Delivery preferences for the preferences panel. */
  preferences: NotificationPreference[];
  /** Called when the user toggles a notification preference. */
  onPreferenceChange?: (id: string, enabled: boolean) => void;
  /** Called when the user marks specific notifications as read. */
  onMarkRead?: (ids: string[]) => void;
  /** Called when the user marks all notifications as read. */
  onMarkAllRead?: () => void;
  /** Called when the user deletes specific notifications. */
  onDelete?: (ids: string[]) => void;
  pagination?: PaginationConfig;
}

/** Complete notification surface configuration for notification center pages. */
export interface NotificationSurfaceConfig {
  visual: NotificationSurfaceVisualConfig;
  presentation: NotificationSurfacePresentationConfig;
  behavior: NotificationSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Import/Export surface contracts
// ---------------------------------------------------------------------------

/** Mapping between a source field (in the uploaded file) and a target field (in the system). */
export interface FieldMapping {
  /** Column name from the imported file. */
  sourceField: string;
  /** Entity field name in the system. */
  targetField: string;
  /** Optional transform identifier (e.g., "uppercase", "date-parse"). */
  transform?: string;
}

/**
 * Result of a file import operation.
 *
 * Returned by the `onUpload` callback after the server processes the file.
 * The surface uses this to display validation results, error details, and
 * a preview before the user confirms the import.
 */
export interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  /** Per-row validation errors with field-level detail. */
  errors?: { row: number; field: string; message: string }[];
  /** Preview of parsed data for user confirmation. */
  previewData?: Record<string, unknown>[];
  /** Auto-detected field mappings based on column headers. */
  detectedMappings?: FieldMapping[];
}

/** A selectable field for export configuration. */
export interface ExportField {
  key: string;
  label: string;
  /** Whether this field is included in the export by default. */
  selected?: boolean;
}

/** A historical import/export operation record. */
export interface ImportExportHistoryEntry {
  id: string;
  type: 'import' | 'export';
  date: string;
  /** Operation status (e.g., "completed", "failed", "in-progress"). */
  status: string;
  recordCount: number;
}

/** Visual configuration for import/export surfaces. */
export interface ImportExportSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Stack import/export sections vertically on mobile. */
  stackOnMobile?: boolean;
}

/** Presentation slots for import/export chrome and empty state. */
export interface ImportExportSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
}

/**
 * Behavioral config: import upload/confirm flow, export field selection,
 * and operation history.
 */
export interface ImportExportSurfaceBehaviorConfig {
  /** Controls which panels are shown: import-only, export-only, or both. */
  mode: 'import' | 'export' | 'both';
  /** Import configuration. Required when mode is 'import' or 'both'. */
  importConfig?: {
    /** Accepted file formats (e.g., ['.csv', '.xlsx']). */
    acceptedFormats: string[];
    /** URL to download a template file for correct formatting. */
    templateUrl?: string;
    /** Async upload handler. Returns parsed results for preview/confirmation. */
    onUpload: (file: File) => Promise<ImportResult>;
    /** Async confirm handler. Called after the user reviews and approves mappings. */
    onConfirm: (mappings: FieldMapping[]) => Promise<void>;
  };
  /** Export configuration. Required when mode is 'export' or 'both'. */
  exportConfig?: {
    /** Available export formats (e.g., ['csv', 'xlsx', 'json']). */
    formats: string[];
    /** Selectable fields for the export. */
    fields: ExportField[];
    /** Async export handler. Returns a download URL for the generated file. */
    onExport: (format: string, fields: string[]) => Promise<string>;
  };
  /** Historical import/export operations for the history panel. */
  history?: ImportExportHistoryEntry[];
}

/** Complete import/export surface configuration for data migration pages. */
export interface ImportExportSurfaceConfig {
  visual: ImportExportSurfaceVisualConfig;
  presentation: ImportExportSurfacePresentationConfig;
  behavior: ImportExportSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Report surface contracts
// ---------------------------------------------------------------------------

/** A report template that users can select to generate a report. */
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
}

/** A filter control for report parameter configuration. */
export interface ReportFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'multi-select' | 'number';
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}

/** Generated report data containing columns, rows, and an optional summary. */
export interface ReportData {
  /** Column definitions for the report table. */
  columns: { key: string; label: string }[];
  /** Data rows. Each row is a record keyed by column key. */
  rows: Record<string, unknown>[];
  /** Optional summary/totals row. */
  summary?: Record<string, unknown>;
}

/** Visual layout for report surfaces: sidebar filters vs. top filters. */
export interface ReportSurfaceVisualConfig {
  /** 'sidebar-filters' places filters in a side panel; 'top-filters' stacks them above the report. */
  layout?: 'sidebar-filters' | 'top-filters';
  maxWidth?: number | string;
  /** Stack filter and report sections vertically on mobile. */
  stackSectionsOnMobile?: boolean;
  /** Use compact chart rendering on mobile (reduced padding, smaller labels). */
  compactChartsOnMobile?: boolean;
}

/** Presentation slots for report chrome, chart rendering, and empty state. */
export interface ReportSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Custom chart/visualization renderer for the generated report data. */
  renderChart?: (data: ReportData) => ReactNode;
  emptyState?: ReactNode;
}

/**
 * Behavioral config: template selection, filter parameters, report generation,
 * export, and scheduling.
 */
export interface ReportSurfaceBehaviorConfig {
  /** Available report templates. */
  templates: ReportTemplate[];
  /** Currently selected template ID. */
  selectedTemplate?: string;
  onTemplateSelect?: (id: string) => void;
  /** Report parameter filters. */
  filters: ReportFilter[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  /** Async report generation callback. Returns the generated data. */
  onGenerate?: () => Promise<ReportData>;
  /** Export the current report in the specified format. */
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  /** Schedule recurring report generation with a cron expression. */
  onSchedule?: (cron: string) => void;
  /** Pre-loaded or previously generated report data. */
  reportData?: ReportData;
  /** When true, a report generation is in progress. */
  generating?: boolean;
}

/** Complete report surface configuration for report builder/viewer pages. */
export interface ReportSurfaceConfig {
  visual: ReportSurfaceVisualConfig;
  presentation: ReportSurfacePresentationConfig;
  behavior: ReportSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Team surface contracts
// ---------------------------------------------------------------------------

/** A team member record displayed in team management surfaces. */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: ReactNode;
  role: string;
  status?: 'active' | 'invited' | 'disabled';
  joinedAt?: string;
}

/** A role available for assignment to team members. */
export interface TeamRole {
  id: string;
  label: string;
  description?: string;
}

/** Visual layout for team surfaces: table list vs. card grid. */
export interface TeamSurfaceVisualConfig {
  maxWidth?: number | string;
  layout?: 'table' | 'cards';
  /** Stack team member views vertically on mobile. */
  stackOnMobile?: boolean;
  /** Default view mode on mobile ('cards' or 'table'). */
  mobileDefaultView?: 'cards' | 'table';
}

/** Presentation slots for team chrome, empty state, and custom member rendering. */
export interface TeamSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
  /** Custom renderer for individual team member rows/cards. */
  renderMember?: (member: TeamMember) => ReactNode;
}

/** Behavioral config: team members, roles, invite/remove/role-change actions. */
export interface TeamSurfaceBehaviorConfig {
  /** Current team members to display. */
  members: TeamMember[];
  /** Available roles for the role assignment dropdown. */
  roles: TeamRole[];
  /** Called to open the invite member flow. */
  onInvite?: () => void;
  /** Called to remove a member from the team. */
  onRemove?: (memberId: string) => void;
  /** Called when a member's role is changed via the dropdown. */
  onRoleChange?: (memberId: string, roleId: string) => void;
  /** Called to open the edit member modal/page. */
  onEditMember?: (memberId: string) => void;
  actions?: SurfaceAction<void>[];
}

/** Complete team surface configuration for team management pages. */
export interface TeamSurfaceConfig {
  visual: TeamSurfaceVisualConfig;
  presentation: TeamSurfacePresentationConfig;
  behavior: TeamSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Integration surface contracts
// ---------------------------------------------------------------------------

/** An API key record for the integrations page. */
export interface IntegrationApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  status?: 'active' | 'expired' | 'revoked';
}

/** A webhook configuration record. */
export interface IntegrationWebhook {
  id: string;
  /** Webhook endpoint URL. */
  url: string;
  /** Event types this webhook listens for. */
  events: string[];
  status?: 'active' | 'paused' | 'failed';
  createdAt?: string;
  lastTriggeredAt?: string;
}

/** A third-party app connection record. */
export interface IntegrationConnectedApp {
  id: string;
  name: string;
  icon?: ReactNode;
  description?: string;
  /** Connection health status. */
  status?: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
}

/** Visual layout for integration surfaces. */
export interface IntegrationSurfaceVisualConfig {
  maxWidth?: number | string;
  /** 'tabs' separates keys/webhooks/apps into tabs; 'sections' stacks them. */
  layout?: 'tabs' | 'sections';
  /** Stack integration sections vertically on mobile. */
  stackOnMobile?: boolean;
  /** Use compact card rendering for integration items on mobile. */
  compactCardsOnMobile?: boolean;
}

/** Presentation slots for integration chrome and empty state. */
export interface IntegrationSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
}

/**
 * Behavioral config: API keys, webhooks, connected apps, and their
 * CRUD operations.
 */
export interface IntegrationSurfaceBehaviorConfig {
  apiKeys?: IntegrationApiKey[];
  webhooks?: IntegrationWebhook[];
  connectedApps?: IntegrationConnectedApp[];
  /** Open the create API key flow. */
  onCreateKey?: () => void;
  /** Revoke an existing API key. */
  onRevokeKey?: (keyId: string) => void;
  /** Open the create webhook flow. */
  onCreateWebhook?: () => void;
  /** Delete a webhook configuration. */
  onDeleteWebhook?: (webhookId: string) => void;
  /** Pause or resume a webhook. */
  onToggleWebhook?: (webhookId: string) => void;
  /** Disconnect a third-party app. */
  onDisconnectApp?: (appId: string) => void;
  actions?: SurfaceAction<void>[];
}

/** Complete integration surface configuration for developer/API settings pages. */
export interface IntegrationSurfaceConfig {
  visual: IntegrationSurfaceVisualConfig;
  presentation: IntegrationSurfacePresentationConfig;
  behavior: IntegrationSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Kanban surface contracts
// ---------------------------------------------------------------------------

/** A single card in a kanban column. */
export interface KanbanSurfaceCard {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  tags?: ReactNode;
  assignee?: ReactNode;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: unknown;
}

/**
 * A kanban column containing cards.
 * The `limit` field supports WIP (work in progress) limits -- when the
 * item count exceeds the limit, the column header shows a warning.
 */
export interface KanbanSurfaceColumn {
  id: string;
  title: ReactNode;
  /** Cards within this column, ordered by position. */
  items: KanbanSurfaceCard[];
  /** WIP limit. Exceeding this count triggers a visual warning. */
  limit?: number;
  /** Column accent color (e.g., for the header stripe). */
  color?: string;
}

/** Visual layout hints for the kanban board. */
export interface KanbanSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Minimum width for each kanban column. */
  columnMinWidth?: number | string;
  /** Gap between kanban columns. */
  columnGap?: number | string;
  /** Maximum number of visible columns on mobile. */
  mobileColumnsLimit?: number;
  /** Stack columns vertically on mobile instead of horizontal scroll. */
  stackColumnsOnMobile?: boolean;
}

/** Presentation slots for kanban chrome, card rendering, and column headers. */
export interface KanbanSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
  /** Custom card renderer. Receives the card and its parent column ID. */
  renderCard?: (card: KanbanSurfaceCard, columnId: string) => ReactNode;
  /** Custom column header renderer with item count for WIP limit display. */
  renderColumnHeader?: (column: KanbanSurfaceColumn, itemCount: number) => ReactNode;
}

/** Behavioral config: kanban columns, drag-and-drop, card CRUD, and filtering. */
export interface KanbanSurfaceBehaviorConfig {
  /** Ordered kanban columns with their cards. */
  columns: KanbanSurfaceColumn[];
  /** Called when a card is dragged to a new column or position. */
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string, position: number) => void;
  /** Called when the user creates a new card in a column. */
  onCardCreate?: (columnId: string) => void;
  /** Called when the user clicks a card (e.g., to open a detail view). */
  onCardClick?: (card: KanbanSurfaceCard, columnId: string) => void;
  filters?: FilterDef[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (values: Record<string, unknown>) => void;
  actions?: SurfaceAction<void>[];
}

/** Complete kanban surface configuration for board-style project management pages. */
export interface KanbanSurfaceConfig {
  visual: KanbanSurfaceVisualConfig;
  presentation: KanbanSurfacePresentationConfig;
  behavior: KanbanSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Activity surface contracts
// ---------------------------------------------------------------------------

/** A single activity log entry with optional field-level diff tracking. */
export interface ActivitySurfaceItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
}

/** Filter parameters for narrowing the activity feed. */
export interface ActivitySurfaceFilter {
  /** Filter by action type (e.g., ["created", "updated"]). */
  type?: string[];
  /** Filter by user identifier. */
  user?: string[];
  /** ISO date string for the start of the date range. */
  dateFrom?: string;
  /** ISO date string for the end of the date range. */
  dateTo?: string;
}

/** Visual configuration for activity feed surfaces. */
export interface ActivitySurfaceVisualConfig {
  maxWidth?: number | string;
  /** Use compact entry rendering (smaller avatars, tighter spacing) on mobile. */
  compactEntriesOnMobile?: boolean;
  /** Stack activity feed layout vertically on mobile. */
  stackOnMobile?: boolean;
}

/** Presentation slots for activity chrome and custom activity rendering. */
export interface ActivitySurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
  /** Custom renderer for individual activity entries. */
  renderActivity?: (activity: ActivitySurfaceItem) => ReactNode;
}

/** Behavioral config: activity list, filtering, user lookup, and pagination. */
export interface ActivitySurfaceBehaviorConfig {
  /** Activity entries to display in the timeline. */
  activities: ActivitySurfaceItem[];
  /** Current filter state (controlled). */
  filters?: ActivitySurfaceFilter;
  onFilterChange?: (filters: ActivitySurfaceFilter) => void;
  /** Available action types for the filter dropdown. */
  actionTypes?: string[];
  /** Available users for the user filter dropdown. */
  users?: { name: string; avatar?: string }[];
  /** Called when the user clicks an activity entry for detail inspection. */
  onActivityClick?: (activity: ActivitySurfaceItem) => void;
  pagination?: PaginationConfig;
  actions?: SurfaceAction<void>[];
}

/** Complete activity surface configuration for activity timeline/feed pages. */
export interface ActivitySurfaceConfig {
  visual: ActivitySurfaceVisualConfig;
  presentation: ActivitySurfacePresentationConfig;
  behavior: ActivitySurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// File browser surface contracts
// ---------------------------------------------------------------------------

/** A file entry in the file browser. */
export interface FileBrowserFile {
  id: string;
  name: string;
  type: 'file';
  mimeType?: string;
  size?: number;
  thumbnail?: string;
  modifiedAt?: string;
  createdAt?: string;
  parentId?: string | null;
}

/** A folder entry in the file browser. */
export interface FileBrowserFolder {
  id: string;
  name: string;
  type: 'folder';
  /** Parent folder ID. `null` indicates root level. */
  parentId?: string | null;
  /** Number of direct children (files + folders) for display. */
  childCount?: number;
  modifiedAt?: string;
  createdAt?: string;
}

/** Visual configuration for the file browser view mode. */
export interface FileBrowserSurfaceVisualConfig {
  maxWidth?: number | string;
  /** 'grid' shows thumbnails; 'list' shows a detailed table. */
  viewMode?: 'grid' | 'list';
  /** Default view mode on mobile. Overrides `viewMode` on small screens. */
  mobileView?: 'grid' | 'list';
  /** Stack file browser layout vertically on mobile (breadcrumb + list). */
  stackOnMobile?: boolean;
}

/** Presentation slots for file browser chrome and custom file icon rendering. */
export interface FileBrowserSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
  /** Custom file icon renderer based on MIME type or file extension. */
  renderFileIcon?: (file: FileBrowserFile) => ReactNode;
}

/** Behavioral config: files, folders, navigation, selection, and file operations. */
export interface FileBrowserSurfaceBehaviorConfig {
  /** Files in the current directory. */
  files: FileBrowserFile[];
  /** Folders in the current directory. */
  folders: FileBrowserFolder[];
  /** Breadcrumb path of folder IDs from root to current folder. */
  currentPath?: string[];
  /** IDs of currently selected files/folders. */
  selectedItems?: string[];
  /** Called when files are dropped or selected for upload. */
  onUpload?: (files: File[]) => void;
  /** Called to delete selected files/folders. */
  onDelete?: (ids: string[]) => void;
  /** Called when the user navigates into a folder. `null` means root. */
  onNavigate?: (folderId: string | null) => void;
  /** Called when the selection changes (checkbox toggle). */
  onSelectionChange?: (ids: string[]) => void;
  /** Called when the user switches between grid and list view. */
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  /** Called to rename a file or folder. */
  onRename?: (id: string, newName: string) => void;
  actions?: SurfaceAction<void>[];
}

/** Complete file browser surface configuration for file management pages. */
export interface FileBrowserSurfaceConfig {
  visual: FileBrowserSurfaceVisualConfig;
  presentation: FileBrowserSurfacePresentationConfig;
  behavior: FileBrowserSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

// ---------------------------------------------------------------------------
// Pricing surface contracts
// ---------------------------------------------------------------------------

/**
 * A pricing plan displayed in the pricing comparison table.
 *
 * The `features` record is keyed by `PricingSurfaceFeature.key`. Values can
 * be `true`/`false` (checkmark/cross) or a string for variable limits
 * (e.g., "10 GB", "Unlimited").
 */
export interface PricingSurfacePlan {
  id: string;
  name: string;
  price: number | string;
  description?: string;
  features: Record<string, boolean | string>;
  cta: string;
  popular?: boolean;
  priceNote?: string;
}

/** A feature row in the pricing comparison table. */
export interface PricingSurfaceFeature {
  /** Key matching the keys in `PricingSurfacePlan.features`. */
  key: string;
  label: string;
  description?: string;
  /** Category for grouping features (e.g., "Core", "Advanced", "Support"). */
  category?: string;
}

/** Visual configuration for pricing surfaces. */
export interface PricingSurfaceVisualConfig {
  maxWidth?: number | string;
  /** Stack pricing plans vertically on mobile instead of side-by-side. */
  stackOnMobile?: boolean;
  /** Use compact column rendering on mobile (reduced feature rows, smaller text). */
  compactColumnsOnMobile?: boolean;
}

/** Presentation slots for pricing chrome, intro, footer, and custom plan headers. */
export interface PricingSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  /** Introductory content above the pricing table (e.g., headline, toggle). */
  intro?: ReactNode;
  footer?: ReactNode;
  /** Custom renderer for the plan header card (name, price, CTA). */
  renderPlanHeader?: (plan: PricingSurfacePlan) => ReactNode;
}

/** Behavioral config: plans, features, billing cycle, and plan selection. */
export interface PricingSurfaceBehaviorConfig {
  /** Available pricing plans (columns in the comparison table). */
  plans: PricingSurfacePlan[];
  /** Feature rows for the comparison table. */
  features: PricingSurfaceFeature[];
  /** ID of the tenant's current plan (for highlighting). */
  currentPlan?: string;
  /** Called when the user selects/upgrades to a plan. */
  onSelectPlan?: (planId: string) => void;
  /** Current billing cycle toggle state. */
  billingCycle?: 'monthly' | 'yearly';
  /** Called when the user toggles between monthly and yearly billing. */
  onBillingCycleChange?: (cycle: 'monthly' | 'yearly') => void;
  /** Currency code for price display (e.g., "USD", "EUR"). */
  currency?: string;
  actions?: SurfaceAction<void>[];
}

/** Complete pricing surface configuration for pricing/plan comparison pages. */
export interface PricingSurfaceConfig {
  visual: PricingSurfaceVisualConfig;
  presentation: PricingSurfacePresentationConfig;
  behavior: PricingSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

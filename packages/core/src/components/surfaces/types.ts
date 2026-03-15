/**
 * Surface types
 *
 * Surfaces are the new contract layer above patterns. They centralize the
 * repeated page mechanics (chrome, loading, filtering, tables, cards, forms,
 * detail shells) while keeping product-specific rendering in the app.
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
 */
export interface SurfaceBreadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface SurfacePageChrome {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: SurfaceBreadcrumb[];
  badge?: ReactNode;
  maxWidth?: number | string;
  back?: {
    label?: string;
    onClick: () => void;
  };
}

/**
 * Actions stay declarative at the config layer. Apps still own the actual
 * handlers, but surfaces handle placement, permissions, and rendering.
 */
export interface SurfaceAction<TView = void> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: (item: TView) => void | Promise<void>;
  visible?: (item: TView) => boolean;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Permissions are intentionally lightweight.
 *
 * The surface only needs to know whether a field or action is allowed. Apps can
 * provide explicit grants or their own callback if permission logic is more
 * dynamic than a simple string list.
 */
export interface SurfacePermissionRule {
  permission: string;
  reason?: string;
}

export interface SurfacePermissionsConfig {
  granted?: string[];
  fields?: Record<string, SurfacePermissionRule | undefined>;
  actions?: Record<string, SurfacePermissionRule | undefined>;
  tabs?: Record<string, SurfacePermissionRule | undefined>;
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

/**
 * List surface contracts
 */
export type ListSurfaceView = 'table' | 'cards';

export interface SurfaceColumn<TView> extends ColumnDef<TView> {
  fieldId: string;
  hideInCards?: boolean;
  hideInTable?: boolean;
}

export interface ListSurfaceVisualConfig {
  defaultView?: ListSurfaceView;
  allowViewSwitch?: boolean;
  cardMinWidth?: number;
  compact?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

export interface ListSurfacePresentationConfig<TView> {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
  renderCard?: (item: TView, index: number) => ReactNode;
  renderCell?: Partial<Record<string, (value: unknown, item: TView, index: number) => ReactNode>>;
}

export interface ListSurfaceBehaviorConfig<TView> {
  columns: SurfaceColumn<TView>[];
  filters?: FilterDef[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (values: Record<string, unknown>) => void;
  onFilterReset?: () => void;
  onFilterApply?: (values: Record<string, unknown>) => void;
  pagination?: PaginationConfig | false;
  rowKey?: keyof TView | ((row: TView) => string);
  sorting?: SortConfig | null;
  onSortChange?: (sort: SortConfig) => void;
  primaryAction?: SurfaceAction<void>;
  rowActions?: SurfaceAction<TView>[];
  onRowClick?: (item: TView, index: number) => void;
}

export interface ListSurfaceConfig<TView> {
  visual: ListSurfaceVisualConfig;
  presentation: ListSurfacePresentationConfig<TView>;
  behavior: ListSurfaceBehaviorConfig<TView>;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Dashboard surface contracts
 */
export interface DashboardSurfaceSection {
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  content: ReactNode;
  span?: number;
  chrome?: 'card' | 'plain';
  actions?: ReactNode;
}

export interface DashboardSurfaceVisualConfig {
  statsColumns?: number;
  sectionsColumns?: GridColumns;
}

export interface DashboardSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  headerContent?: ReactNode;
  sections?: DashboardSurfaceSection[];
}

export interface DashboardSurfaceBehaviorConfig {
  stats?: StatDef[];
  headerActions?: SurfaceAction<void>[];
  onStatClick?: (stat: StatDef) => void;
}

export interface DashboardSurfaceConfig {
  visual: DashboardSurfaceVisualConfig;
  presentation: DashboardSurfacePresentationConfig;
  behavior: DashboardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Detail surface contracts
 */
export interface DetailSurfaceTab<TView> {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string | ((item: TView) => number | string | undefined);
  disabled?: boolean;
  visible?: boolean | ((item: TView) => boolean);
  permissionId?: string;
  content: (item: TView) => ReactNode;
}

export interface DetailSurfacePresentationConfig<TView> {
  chrome?: Pick<SurfacePageChrome, 'breadcrumbs' | 'maxWidth' | 'back'>;
  title: (item: TView) => ReactNode;
  subtitle?: (item: TView) => ReactNode;
  avatar?: (item: TView) => ReactNode;
  status?: (item: TView) => { label: string; color?: string } | undefined;
  tabs?: DetailSurfaceTab<TView>[];
  sidebar?: (item: TView) => ReactNode;
  headerExtra?: (item: TView) => ReactNode;
  footer?: (item: TView) => ReactNode;
}

export interface DetailSurfaceBehaviorConfig<TView> {
  actions?: SurfaceAction<TView>[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export interface DetailSurfaceVisualConfig {
  sidebarPosition?: DetailPanelProps<unknown>['sidebarPosition'];
  sidebarWidth?: number | string;
}

export interface DetailSurfaceConfig<TView> {
  visual: DetailSurfaceVisualConfig;
  presentation: DetailSurfacePresentationConfig<TView>;
  behavior: DetailSurfaceBehaviorConfig<TView>;
  permissions?: SurfacePermissionsConfig;
  emptyState?: ReactNode;
}

/**
 * Form surface contracts
 */
export interface SurfaceFieldDef extends FieldDef {
  fieldId?: string;
}

export interface FormSurfaceVisualConfig {
  layout?: FormBuilderProps['layout'];
  columns?: number;
  maxWidth?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface FormSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  error?: ReactNode;
  aside?: ReactNode;
  renderField?: FormBuilderProps['renderField'];
}

export interface FormSurfaceBehaviorConfig {
  fields: SurfaceFieldDef[];
  initialValues?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
  submitAction: SurfaceAction<Record<string, unknown>>;
  cancelAction?: SurfaceAction<void>;
  disabled?: boolean;
  readOnly?: boolean;
  showLabels?: boolean;
  showRequired?: boolean;
  stepLabels?: string[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export interface FormSurfaceConfig {
  visual: FormSurfaceVisualConfig;
  presentation: FormSurfacePresentationConfig;
  behavior: FormSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Wizard surface contracts
 */
export interface WizardSurfaceStepRenderContext {
  values: Record<string, unknown>;
  currentStep: number;
  stepIndex: number;
  isLastStep: boolean;
  setValues: (values: Record<string, unknown>) => void;
  goToStep: (step: number) => void;
}

export interface WizardSurfaceStepConfig {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  optional?: boolean;
  fields?: SurfaceFieldDef[];
  content?: ReactNode | ((context: WizardSurfaceStepRenderContext) => ReactNode);
  validate?: () => boolean | string | Promise<boolean | string>;
  layout?: Exclude<FormBuilderProps['layout'], 'steps'>;
  columns?: number;
}

export interface WizardSurfaceVisualConfig {
  maxWidth?: number | string;
  orientation?: StepWizardProps['orientation'];
  showProgress?: boolean;
  allowSkip?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface WizardSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  error?: ReactNode;
  aside?: ReactNode | ((context: WizardSurfaceStepRenderContext) => ReactNode);
  emptyState?: ReactNode;
  footer?: ReactNode | ((context: WizardSurfaceStepRenderContext) => ReactNode);
  renderField?: FormBuilderProps['renderField'];
}

export interface WizardSurfaceBehaviorConfig {
  steps: WizardSurfaceStepConfig[];
  initialValues?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
  submitAction: SurfaceAction<Record<string, unknown>>;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  nextLabel?: string;
  prevLabel?: string;
  skipLabel?: string;
  cancelAction?: SurfaceAction<void>;
  saveDraftAction?: SurfaceAction<Record<string, unknown>>;
  disabled?: boolean;
  readOnly?: boolean;
  showLabels?: boolean;
  showRequired?: boolean;
}

export interface WizardSurfaceConfig {
  visual: WizardSurfaceVisualConfig;
  presentation: WizardSurfacePresentationConfig;
  behavior: WizardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Header surface contracts
 */
export interface HeaderSurfaceVisualConfig {
  maxWidth?: number | string;
  tabsType?: TabsProps['type'];
  centeredTabs?: boolean;
}

export interface HeaderSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  metadata?: ReactNode;
  actionsStart?: ReactNode;
  headerContent?: ReactNode;
  footer?: ReactNode;
}

export interface HeaderSurfaceBehaviorConfig {
  actions?: SurfaceAction<void>[];
  tabs?: SurfaceTabbedView[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export interface HeaderSurfaceConfig {
  visual: HeaderSurfaceVisualConfig;
  presentation: HeaderSurfacePresentationConfig;
  behavior: HeaderSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Sidebar surface contracts
 */
export interface SidebarSurfaceVisualConfig {
  sidebarWidth?: number | string;
  collapsedWidth?: number | string;
  asideWidth?: number | string;
  collapsible?: boolean;
  bordered?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface SidebarSurfacePresentationConfig {
  sidebar: ReactNode;
  content: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
}

export interface SidebarSurfaceBehaviorConfig {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  toggleLabel?: string;
  actions?: SurfaceAction<void>[];
}

export interface SidebarSurfaceConfig {
  visual: SidebarSurfaceVisualConfig;
  presentation: SidebarSurfacePresentationConfig;
  behavior: SidebarSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Detail-form surface contracts
 */
export interface DetailFormSurfaceVisualConfig {
  maxWidth?: number | string;
  formSpan?: number;
  summarySpan?: number;
  layout?: 'split' | 'stacked';
  columns?: number;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface DetailFormSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  error?: ReactNode;
  summary?: ReactNode;
  summaryTitle?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  renderField?: FormBuilderProps['renderField'];
}

export interface DetailFormSurfaceBehaviorConfig {
  fields: SurfaceFieldDef[];
  initialValues?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
  submitAction: SurfaceAction<Record<string, unknown>>;
  cancelAction?: SurfaceAction<void>;
  secondaryActions?: SurfaceAction<void>[];
  disabled?: boolean;
  readOnly?: boolean;
  showLabels?: boolean;
  showRequired?: boolean;
}

export interface DetailFormSurfaceConfig {
  visual: DetailFormSurfaceVisualConfig;
  presentation: DetailFormSurfacePresentationConfig;
  behavior: DetailFormSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Visualization surface contracts
 */
export interface VisualizationSurfaceVisualConfig {
  maxWidth?: number | string;
  tabsType?: TabsProps['type'];
  centeredTabs?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface VisualizationSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  intro?: ReactNode;
  emptyState?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
}

export interface VisualizationSurfaceBehaviorConfig {
  actions?: SurfaceAction<void>[];
  stats?: StatDef[];
  views: SurfaceTabbedView[];
  activeView?: string;
  onViewChange?: (key: string) => void;
}

export interface VisualizationSurfaceConfig {
  visual: VisualizationSurfaceVisualConfig;
  presentation: VisualizationSurfacePresentationConfig;
  behavior: VisualizationSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Search surface contracts
 */
export interface SearchSurfaceResult {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  image?: ReactNode;
  keywords?: string[];
  data?: unknown;
}

export interface SearchSurfaceVisualConfig {
  layout?: 'stack' | 'split';
  maxWidth?: number | string;
  resultMinWidth?: number;
  minQueryLength?: number;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface SearchSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  placeholder?: string;
  emptyQueryState?: ReactNode;
  emptyResultsState?: ReactNode;
  resultPreview?: (result: SearchSurfaceResult) => ReactNode;
  renderResult?: (
    result: SearchSurfaceResult,
    context: { index: number; selected: boolean }
  ) => ReactNode;
  footer?: ReactNode;
}

export interface SearchSurfaceBehaviorConfig {
  query: string;
  onQueryChange: (query: string) => void;
  onQuerySubmit?: (query: string) => void;
  results: SearchSurfaceResult[];
  selectedResultId?: string;
  onSelectResult?: (result: SearchSurfaceResult) => void;
  filters?: FilterDef[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (values: Record<string, unknown>) => void;
  onFilterReset?: () => void;
  onFilterApply?: (values: Record<string, unknown>) => void;
  actions?: SurfaceAction<void>[];
  resultActions?: SurfaceAction<SearchSurfaceResult>[];
}

export interface SearchSurfaceConfig {
  visual: SearchSurfaceVisualConfig;
  presentation: SearchSurfacePresentationConfig;
  behavior: SearchSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Editor surface contracts
 */
export interface EditorSurfaceVisualConfig {
  maxWidth?: number | string;
  layout?: 'stack' | 'split';
  editorMinHeight?: number | string;
  previewWidth?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface EditorSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  toolbar?: ReactNode;
  preview?: ReactNode;
  helperText?: ReactNode;
  statusBar?: ReactNode;
  renderEditor?: (
    value: string,
    onChange: (value: string) => void
  ) => ReactNode;
}

export interface EditorSurfaceBehaviorConfig {
  value?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  saveAction?: SurfaceAction<string>;
  publishAction?: SurfaceAction<string>;
  cancelAction?: SurfaceAction<void>;
  disabled?: boolean;
  readOnly?: boolean;
  saving?: boolean;
}

export interface EditorSurfaceConfig {
  visual: EditorSurfaceVisualConfig;
  presentation: EditorSurfacePresentationConfig;
  behavior: EditorSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Operational surface contracts
 */
export interface OperationalSurfaceFeedConfig<TFeed extends FeedItem = FeedItem> {
  items: TFeed[];
  renderItem: (item: TFeed, index: number) => ReactNode;
  onRefresh?: () => void;
  autoRefresh?: number;
  emptyState?: ReactNode;
  newItemsCount?: number;
  onShowNewItems?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  maxItems?: number;
  maxHeight?: number | string;
  header?: ReactNode;
}

export interface OperationalSurfaceVisualConfig {
  maxWidth?: number | string;
  sectionsColumns?: GridColumns;
  feedHeight?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface OperationalSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  intro?: ReactNode;
  queue?: ReactNode;
  primaryPanel?: ReactNode;
  secondaryPanel?: ReactNode;
  sections?: DashboardSurfaceSection[];
  emptyState?: ReactNode;
  footer?: ReactNode;
}

export interface OperationalSurfaceBehaviorConfig<TFeed extends FeedItem = FeedItem> {
  stats?: StatDef[];
  actions?: SurfaceAction<void>[];
  refreshAction?: SurfaceAction<void>;
  feed?: OperationalSurfaceFeedConfig<TFeed>;
}

export interface OperationalSurfaceConfig<TFeed extends FeedItem = FeedItem> {
  visual: OperationalSurfaceVisualConfig;
  presentation: OperationalSurfacePresentationConfig;
  behavior: OperationalSurfaceBehaviorConfig<TFeed>;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Media surface contracts
 */
export interface MediaSurfaceItem {
  id: string;
  src: string;
  alt?: string;
  thumbnailSrc?: string;
  title?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  type?: 'image' | 'video' | 'audio' | 'document';
  data?: unknown;
}

export interface MediaSurfaceVisualConfig {
  maxWidth?: number | string;
  columns?: number;
  layout?: 'gallery' | 'detail';
  previewHeight?: number | string;
  detailsWidth?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface MediaSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
  renderGridItem?: (
    item: MediaSurfaceItem,
    context: { index: number; selected: boolean }
  ) => ReactNode;
  renderPreview?: (item: MediaSurfaceItem) => ReactNode;
  renderDetails?: (item: MediaSurfaceItem) => ReactNode;
  footer?: ReactNode;
}

export interface MediaSurfaceBehaviorConfig {
  items: MediaSurfaceItem[];
  selectedItemId?: string;
  onSelectItem?: (item: MediaSurfaceItem) => void;
  actions?: SurfaceAction<void>[];
  itemActions?: SurfaceAction<MediaSurfaceItem>[];
}

export interface MediaSurfaceConfig {
  visual: MediaSurfaceVisualConfig;
  presentation: MediaSurfacePresentationConfig;
  behavior: MediaSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Chat surface contracts
 */
export interface ChatSurfaceMessage {
  id: string;
  author: ReactNode;
  body?: ReactNode;
  parts?: AssistantMessagePart[];
  timestamp?: ReactNode;
  avatar?: ReactNode;
  meta?: ReactNode;
  attachments?: ReactNode;
  status?: ReactNode;
  align?: 'start' | 'end';
  role?: AssistantMessageRole;
  deliveryStatus?: AssistantDeliveryStatus;
  streaming?: boolean;
}

export interface ChatSurfaceVisualConfig {
  maxWidth?: number | string;
  sidebarWidth?: number | string;
  composerRows?: number;
  transcriptHeight?: number | string;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface ChatSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  headerContent?: ReactNode;
  sidebar?: ReactNode;
  emptyState?: ReactNode;
  composerPlaceholder?: string;
  renderMessage?: (message: ChatSurfaceMessage, index: number) => ReactNode;
  renderPart?: (part: AssistantMessagePart, context: { message: ChatSurfaceMessage; index: number }) => ReactNode;
  footer?: ReactNode;
}

export interface ChatSurfaceBehaviorConfig {
  messages: ChatSurfaceMessage[];
  draft?: string;
  onDraftChange?: (value: string) => void;
  onSend?: (value: string) => void | Promise<void>;
  sendLabel?: string;
  sending?: boolean;
  assistantTyping?: boolean;
  typingLabel?: string;
  actions?: SurfaceAction<void>[];
}

export interface ChatSurfaceConfig {
  visual: ChatSurfaceVisualConfig;
  presentation: ChatSurfacePresentationConfig;
  behavior: ChatSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Scheduler surface contracts
 */
export interface SchedulerSurfaceVisualConfig {
  maxWidth?: number | string;
  height?: number | string;
  sidebarWidth?: number | string;
  defaultView?: 'month' | 'week' | 'day';
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface SchedulerSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
  sidebar?: ReactNode;
  emptyState?: ReactNode;
  renderEvent?: (event: CalendarEvent) => ReactNode;
  footer?: ReactNode;
}

export interface SchedulerSurfaceBehaviorConfig {
  events: CalendarEvent[];
  currentDate?: Date;
  activeView?: 'month' | 'week' | 'day';
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  actions?: SurfaceAction<void>[];
}

export interface SchedulerSurfaceConfig {
  visual: SchedulerSurfaceVisualConfig;
  presentation: SchedulerSurfacePresentationConfig;
  behavior: SchedulerSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Compare surface contracts
 */
export interface CompareSurfaceSubject {
  key: string;
  label: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
}

export interface CompareSurfaceRow {
  key: string;
  label: ReactNode;
  description?: ReactNode;
  values: Record<string, ReactNode>;
}

export interface CompareSurfaceSection {
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  rows: CompareSurfaceRow[];
}

export interface CompareSurfaceVisualConfig {
  maxWidth?: number | string;
  compact?: boolean;
}

export interface CompareSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  intro?: ReactNode;
  emptyState?: ReactNode;
  footer?: ReactNode;
}

export interface CompareSurfaceBehaviorConfig {
  subjects: CompareSurfaceSubject[];
  sections: CompareSurfaceSection[];
  actions?: SurfaceAction<void>[];
}

export interface CompareSurfaceConfig {
  visual: CompareSurfaceVisualConfig;
  presentation: CompareSurfacePresentationConfig;
  behavior: CompareSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Auth surface contracts
 */
export interface AuthSurfaceVisualConfig {
  maxWidth?: number | string;
  layout?: 'split' | 'centered';
  heroPosition?: 'start' | 'end';
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface AuthSurfacePresentationConfig {
  title: ReactNode;
  subtitle?: ReactNode;
  form: ReactNode;
  hero?: ReactNode;
  footer?: ReactNode;
  legal?: ReactNode;
  topBar?: ReactNode;
}

export interface AuthSurfaceBehaviorConfig {
  actions?: SurfaceAction<void>[];
}

export interface AuthSurfaceConfig {
  visual: AuthSurfaceVisualConfig;
  presentation: AuthSurfacePresentationConfig;
  behavior: AuthSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Onboarding surface contracts
 */
export interface OnboardingSurfaceVisualConfig {
  maxWidth?: number | string;
  heroPosition?: 'start' | 'end';
  orientation?: StepWizardProps['orientation'];
  showProgress?: boolean;
  allowSkip?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface OnboardingSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  description?: ReactNode;
  hero?: ReactNode;
  checklist?: ReactNode;
  footer?: ReactNode;
  renderField?: FormBuilderProps['renderField'];
  emptyState?: ReactNode;
}

export interface OnboardingSurfaceConfig {
  visual: OnboardingSurfaceVisualConfig;
  presentation: OnboardingSurfacePresentationConfig;
  behavior: WizardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Empty-state surface contracts
 */
export interface EmptyStateSurfaceVisualConfig {
  maxWidth?: number | string;
}

export interface EmptyStateSurfacePresentationConfig {
  chrome?: SurfacePageChrome;
  title: string;
  description?: string;
  icon?: ReactNode;
  content?: ReactNode;
}

export interface EmptyStateSurfaceBehaviorConfig {
  primaryAction?: SurfaceAction<void>;
  secondaryAction?: SurfaceAction<void>;
}

export interface EmptyStateSurfaceConfig {
  visual: EmptyStateSurfaceVisualConfig;
  presentation: EmptyStateSurfacePresentationConfig;
  behavior: EmptyStateSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Settings surface contracts
 */
export interface SettingsSurfaceVisualConfig {
  maxWidth?: number | string;
  tabsType?: TabsProps['type'];
  centeredTabs?: boolean;
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export interface SettingsSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  intro?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

export interface SettingsSurfaceBehaviorConfig {
  tabs: SurfaceTabbedView[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  actions?: SurfaceAction<void>[];
}

export interface SettingsSurfaceConfig {
  visual: SettingsSurfaceVisualConfig;
  presentation: SettingsSurfacePresentationConfig;
  behavior: SettingsSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Audit surface contracts
 */
export interface AuditColumn {
  key: string;
  label: string;
  width?: number | string;
  sortable?: boolean;
  render?: (value: unknown, entry: AuditEntry) => ReactNode;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details?: string;
  severity?: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface AuditFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'multi-select';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface AuditSurfaceVisualConfig {
  density?: 'compact' | 'comfortable';
  maxHeight?: string;
}

export interface AuditSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  renderEntry?: (entry: AuditEntry) => ReactNode;
}

export interface AuditSurfaceBehaviorConfig {
  columns: AuditColumn[];
  entries: AuditEntry[];
  filters: AuditFilter[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  pagination?: PaginationConfig;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export interface AuditSurfaceConfig {
  visual: AuditSurfaceVisualConfig;
  presentation: AuditSurfacePresentationConfig;
  behavior: AuditSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Billing surface contracts
 */
export interface BillingPlan {
  name: string;
  price: string;
  interval: string;
  features: string[];
}

export interface BillingUsage {
  label: string;
  current: number;
  limit: number;
  unit: string;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: string;
  status: string;
  downloadUrl?: string;
}

export interface BillingPaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface BillingSurfaceVisualConfig {
  layout?: 'tabs' | 'sections';
}

export interface BillingSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  renderPlan?: () => ReactNode;
}

export interface BillingSurfaceBehaviorConfig {
  currentPlan: BillingPlan;
  usage?: BillingUsage[];
  invoices?: BillingInvoice[];
  paymentMethods?: BillingPaymentMethod[];
  onUpgrade?: () => void;
  onCancel?: () => void;
  onDownloadInvoice?: (id: string) => void;
}

export interface BillingSurfaceConfig {
  visual: BillingSurfaceVisualConfig;
  presentation: BillingSurfacePresentationConfig;
  behavior: BillingSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Profile surface contracts
 */
export interface ProfileSection {
  key: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  fields: ProfileField[];
}

export interface ProfileField {
  key: string;
  label: string;
  value?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
  readOnly?: boolean;
}

export interface ProfileSurfaceVisualConfig {
  layout?: 'sidebar' | 'stacked';
}

export interface ProfileSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  avatar?: ReactNode;
  header?: ReactNode;
}

export interface ProfileSurfaceBehaviorConfig {
  sections: ProfileSection[];
  onSave?: (section: string, data: Record<string, unknown>) => void;
  onAvatarChange?: (file: File) => void;
  onPasswordChange?: (oldPassword: string, newPassword: string) => void;
  onDeleteAccount?: () => void;
}

export interface ProfileSurfaceConfig {
  visual: ProfileSurfaceVisualConfig;
  presentation: ProfileSurfacePresentationConfig;
  behavior: ProfileSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Notification surface contracts
 */
export interface SurfaceNotificationItem {
  id: string;
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
}

export interface NotificationPreference {
  id: string;
  label: string;
  description?: string;
  channel: 'email' | 'push' | 'sms' | 'in-app';
  enabled: boolean;
  category?: string;
}

export interface NotificationSurfaceVisualConfig {
  layout?: 'tabs' | 'sections';
}

export interface NotificationSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
}

export interface NotificationSurfaceBehaviorConfig {
  notifications: SurfaceNotificationItem[];
  preferences: NotificationPreference[];
  onPreferenceChange?: (id: string, enabled: boolean) => void;
  onMarkRead?: (ids: string[]) => void;
  onMarkAllRead?: () => void;
  onDelete?: (ids: string[]) => void;
  pagination?: PaginationConfig;
}

export interface NotificationSurfaceConfig {
  visual: NotificationSurfaceVisualConfig;
  presentation: NotificationSurfacePresentationConfig;
  behavior: NotificationSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Import/Export surface contracts
 */
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors?: { row: number; field: string; message: string }[];
  previewData?: Record<string, unknown>[];
  detectedMappings?: FieldMapping[];
}

export interface ExportField {
  key: string;
  label: string;
  selected?: boolean;
}

export interface ImportExportHistoryEntry {
  id: string;
  type: 'import' | 'export';
  date: string;
  status: string;
  recordCount: number;
}

export interface ImportExportSurfaceVisualConfig {
  maxWidth?: number | string;
}

export interface ImportExportSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  emptyState?: ReactNode;
}

export interface ImportExportSurfaceBehaviorConfig {
  mode: 'import' | 'export' | 'both';
  importConfig?: {
    acceptedFormats: string[];
    templateUrl?: string;
    onUpload: (file: File) => Promise<ImportResult>;
    onConfirm: (mappings: FieldMapping[]) => Promise<void>;
  };
  exportConfig?: {
    formats: string[];
    fields: ExportField[];
    onExport: (format: string, fields: string[]) => Promise<string>;
  };
  history?: ImportExportHistoryEntry[];
}

export interface ImportExportSurfaceConfig {
  visual: ImportExportSurfaceVisualConfig;
  presentation: ImportExportSurfacePresentationConfig;
  behavior: ImportExportSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

/**
 * Report surface contracts
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
}

export interface ReportFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'multi-select' | 'number';
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}

export interface ReportData {
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
  summary?: Record<string, unknown>;
}

export interface ReportSurfaceVisualConfig {
  layout?: 'sidebar-filters' | 'top-filters';
  maxWidth?: number | string;
}

export interface ReportSurfacePresentationConfig {
  chrome: SurfacePageChrome;
  renderChart?: (data: ReportData) => ReactNode;
  emptyState?: ReactNode;
}

export interface ReportSurfaceBehaviorConfig {
  templates: ReportTemplate[];
  selectedTemplate?: string;
  onTemplateSelect?: (id: string) => void;
  filters: ReportFilter[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  onGenerate?: () => Promise<ReportData>;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  onSchedule?: (cron: string) => void;
  reportData?: ReportData;
  generating?: boolean;
}

export interface ReportSurfaceConfig {
  visual: ReportSurfaceVisualConfig;
  presentation: ReportSurfacePresentationConfig;
  behavior: ReportSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}

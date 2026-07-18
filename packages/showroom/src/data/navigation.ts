/**
 * Showroom Navigation Tree
 *
 * Defines the sidebar navigation structure matching the showroom route layout.
 * Each node maps to a route segment under /showroom/.
 */

export interface NavItem {
  slug: string;
  label: string;
  path: string;
  children?: NavItem[];
  badge?: string;
}

export interface NavSection {
  slug: string;
  label: string;
  children: NavItem[];
}

// ---------------------------------------------------------------------------
// Foundations
// ---------------------------------------------------------------------------

const foundations: NavSection = {
  slug: 'foundations',
  label: 'Foundations',
  children: [
    { slug: 'tokens', label: 'Tokens', path: '/foundations/tokens' },
    { slug: 'themes', label: 'Themes', path: '/foundations/themes' },
    { slug: 'engines', label: 'Engines', path: '/foundations/engines' },
    { slug: 'icons', label: 'Icons', path: '/foundations/icons', badge: '109' },
  ],
};

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const primitives: NavSection = {
  slug: 'primitives',
  label: 'Primitives',
  children: [
    {
      slug: 'display',
      label: 'Display',
      path: '/primitives/display',
      children: [
        { slug: 'avatar', label: 'Avatar', path: '/primitives/display/avatar' },
        { slug: 'badge', label: 'Badge', path: '/primitives/display/badge' },
        { slug: 'calendar', label: 'Calendar', path: '/primitives/display/calendar' },
        { slug: 'callout', label: 'Callout', path: '/primitives/display/callout' },
        { slug: 'card', label: 'Card', path: '/primitives/display/card' },
        { slug: 'carousel', label: 'Carousel', path: '/primitives/display/carousel' },
        { slug: 'descriptions', label: 'Descriptions', path: '/primitives/display/descriptions' },
        { slug: 'empty', label: 'Empty', path: '/primitives/display/empty' },
        { slug: 'image', label: 'Image', path: '/primitives/display/image' },
        { slug: 'kbd', label: 'Kbd', path: '/primitives/display/kbd' },
        { slug: 'list', label: 'List', path: '/primitives/display/list' },
        { slug: 'qr-code', label: 'QRCode', path: '/primitives/display/qr-code' },
        { slug: 'statistic', label: 'Statistic', path: '/primitives/display/statistic' },
        { slug: 'table', label: 'Table', path: '/primitives/display/table' },
        { slug: 'tag', label: 'Tag', path: '/primitives/display/tag' },
        { slug: 'timeline', label: 'Timeline', path: '/primitives/display/timeline' },
        { slug: 'tooltip', label: 'Tooltip', path: '/primitives/display/tooltip' },
        { slug: 'tree', label: 'Tree', path: '/primitives/display/tree' },
        { slug: 'typography', label: 'Typography', path: '/primitives/display/typography' },
      ],
    },
    {
      slug: 'inputs',
      label: 'Inputs',
      path: '/primitives/inputs',
      children: [
        { slug: 'auto-complete', label: 'AutoComplete', path: '/primitives/inputs/auto-complete' },
        { slug: 'button', label: 'Button', path: '/primitives/inputs/button' },
        { slug: 'cascader', label: 'Cascader', path: '/primitives/inputs/cascader' },
        { slug: 'checkbox', label: 'Checkbox', path: '/primitives/inputs/checkbox' },
        { slug: 'color-picker', label: 'ColorPicker', path: '/primitives/inputs/color-picker' },
        { slug: 'date-picker', label: 'DatePicker', path: '/primitives/inputs/date-picker' },
        { slug: 'form', label: 'Form', path: '/primitives/inputs/form' },
        { slug: 'form-field', label: 'FormField', path: '/primitives/inputs/form-field' },
        { slug: 'input', label: 'Input', path: '/primitives/inputs/input' },
        { slug: 'input-number', label: 'InputNumber', path: '/primitives/inputs/input-number' },
        { slug: 'mentions', label: 'Mentions', path: '/primitives/inputs/mentions' },
        { slug: 'otp-input', label: 'OTPInput', path: '/primitives/inputs/otp-input' },
        { slug: 'password-input', label: 'PasswordInput', path: '/primitives/inputs/password-input' },
        { slug: 'radio', label: 'Radio', path: '/primitives/inputs/radio' },
        { slug: 'select', label: 'Select', path: '/primitives/inputs/select' },
        { slug: 'slider', label: 'Slider', path: '/primitives/inputs/slider' },
        { slug: 'switch', label: 'Switch', path: '/primitives/inputs/switch' },
        { slug: 'tag-input', label: 'TagInput', path: '/primitives/inputs/tag-input' },
        { slug: 'textarea', label: 'Textarea', path: '/primitives/inputs/textarea' },
        { slug: 'time-picker', label: 'TimePicker', path: '/primitives/inputs/time-picker' },
        { slug: 'toggle', label: 'Toggle', path: '/primitives/inputs/toggle' },
        { slug: 'transfer', label: 'Transfer', path: '/primitives/inputs/transfer' },
        { slug: 'tree-select', label: 'TreeSelect', path: '/primitives/inputs/tree-select' },
        { slug: 'upload', label: 'Upload', path: '/primitives/inputs/upload' },
        { slug: 'voice-input-button', label: 'VoiceInputButton', path: '/primitives/inputs/voice-input-button' },
      ],
    },
    {
      slug: 'feedback',
      label: 'Feedback',
      path: '/primitives/feedback',
      children: [
        { slug: 'alert', label: 'Alert', path: '/primitives/feedback/alert' },
        { slug: 'drawer', label: 'Drawer', path: '/primitives/feedback/drawer' },
        { slug: 'message', label: 'Message', path: '/primitives/feedback/message' },
        { slug: 'modal', label: 'Modal', path: '/primitives/feedback/modal' },
        { slug: 'notification', label: 'Notification', path: '/primitives/feedback/notification' },
        { slug: 'progress', label: 'Progress', path: '/primitives/feedback/progress' },
        { slug: 'rate', label: 'Rate', path: '/primitives/feedback/rate' },
        { slug: 'result', label: 'Result', path: '/primitives/feedback/result' },
        { slug: 'skeleton', label: 'Skeleton', path: '/primitives/feedback/skeleton' },
        { slug: 'spinner', label: 'Spinner', path: '/primitives/feedback/spinner' },
        { slug: 'toast', label: 'Toast', path: '/primitives/feedback/toast' },
      ],
    },
    {
      slug: 'layout',
      label: 'Layout',
      path: '/primitives/layout',
      children: [
        { slug: 'aspect-ratio', label: 'AspectRatio', path: '/primitives/layout/aspect-ratio' },
        { slug: 'box', label: 'Box', path: '/primitives/layout/box' },
        { slug: 'collapse', label: 'Collapse', path: '/primitives/layout/collapse' },
        { slug: 'container', label: 'Container', path: '/primitives/layout/container' },
        { slug: 'divider', label: 'Divider', path: '/primitives/layout/divider' },
        { slug: 'flex', label: 'Flex', path: '/primitives/layout/flex' },
        { slug: 'grid', label: 'Grid', path: '/primitives/layout/grid' },
        { slug: 'hide', label: 'Hide', path: '/primitives/layout/hide' },
        { slug: 'layout', label: 'Layout', path: '/primitives/layout/layout' },
        { slug: 'responsive-slot', label: 'ResponsiveSlot', path: '/primitives/layout/responsive-slot' },
        { slug: 'scroll-area', label: 'ScrollArea', path: '/primitives/layout/scroll-area' },
        { slug: 'show', label: 'Show', path: '/primitives/layout/show' },
        { slug: 'space', label: 'Space', path: '/primitives/layout/space' },
        { slug: 'splitter', label: 'Splitter', path: '/primitives/layout/splitter' },
        { slug: 'stack', label: 'Stack', path: '/primitives/layout/stack' },
      ],
    },
    {
      slug: 'navigation',
      label: 'Navigation',
      path: '/primitives/navigation',
      children: [
        { slug: 'affix', label: 'Affix', path: '/primitives/navigation/affix' },
        { slug: 'anchor', label: 'Anchor', path: '/primitives/navigation/anchor' },
        { slug: 'back-top', label: 'BackTop', path: '/primitives/navigation/back-top' },
        { slug: 'breadcrumb', label: 'Breadcrumb', path: '/primitives/navigation/breadcrumb' },
        { slug: 'float-button', label: 'FloatButton', path: '/primitives/navigation/float-button' },
        { slug: 'link', label: 'Link', path: '/primitives/navigation/link' },
        { slug: 'menu', label: 'Menu', path: '/primitives/navigation/menu' },
        { slug: 'pagination', label: 'Pagination', path: '/primitives/navigation/pagination' },
        { slug: 'segmented', label: 'Segmented', path: '/primitives/navigation/segmented' },
        { slug: 'stepper', label: 'Stepper', path: '/primitives/navigation/stepper' },
        { slug: 'steps', label: 'Steps', path: '/primitives/navigation/steps' },
        { slug: 'tabs', label: 'Tabs', path: '/primitives/navigation/tabs' },
      ],
    },
    {
      slug: 'overlay',
      label: 'Overlay',
      path: '/primitives/overlay',
      children: [
        { slug: 'alert-dialog', label: 'AlertDialog', path: '/primitives/overlay/alert-dialog' },
        { slug: 'confirm-dialog', label: 'ConfirmDialog', path: '/primitives/overlay/confirm-dialog' },
        { slug: 'context-menu', label: 'ContextMenu', path: '/primitives/overlay/context-menu' },
        { slug: 'dropdown', label: 'Dropdown', path: '/primitives/overlay/dropdown' },
        { slug: 'hover-card', label: 'HoverCard', path: '/primitives/overlay/hover-card' },
        { slug: 'overlay-modal', label: 'Modal', path: '/primitives/overlay/overlay-modal' },
        { slug: 'popconfirm', label: 'Popconfirm', path: '/primitives/overlay/popconfirm' },
        { slug: 'popover', label: 'Popover', path: '/primitives/overlay/popover' },
        { slug: 'sheet', label: 'Sheet', path: '/primitives/overlay/sheet' },
        { slug: 'tour', label: 'Tour', path: '/primitives/overlay/tour' },
        { slug: 'watermark', label: 'Watermark', path: '/primitives/overlay/watermark' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

const patterns: NavSection = {
  slug: 'patterns',
  label: 'Patterns',
  children: [
    {
      slug: 'data',
      label: 'Data',
      path: '/patterns/data',
      children: [
        { slug: 'data-table', label: 'DataTable', path: '/patterns/data/data-table' },
        { slug: 'bulk-select-toggle', label: 'BulkSelectToggle', path: '/patterns/data/bulk-select-toggle' },
        { slug: 'cell-renderers', label: 'CellRenderers', path: '/patterns/data/cell-renderers' },
        { slug: 'column-settings', label: 'ColumnSettings', path: '/patterns/data/column-settings' },
        { slug: 'detail-panel', label: 'DetailPanel', path: '/patterns/data/detail-panel' },
        { slug: 'file-manager', label: 'FileManager', path: '/patterns/data/file-manager' },
        { slug: 'gallery-view', label: 'GalleryView', path: '/patterns/data/gallery-view' },
        { slug: 'grid-view', label: 'GridView', path: '/patterns/data/grid-view' },
        { slug: 'list-toolbar', label: 'ListToolbar', path: '/patterns/data/list-toolbar' },
        { slug: 'saved-views', label: 'SavedViews', path: '/patterns/data/saved-views' },
        { slug: 'stats-grid', label: 'StatsGrid', path: '/patterns/data/stats-grid' },
        { slug: 'status-filter-pills', label: 'StatusFilterPills', path: '/patterns/data/status-filter-pills' },
      ],
    },
    {
      slug: 'forms',
      label: 'Forms',
      path: '/patterns/forms',
      children: [
        { slug: 'form-builder', label: 'FormBuilder', path: '/patterns/forms/form-builder' },
        { slug: 'filter-builder', label: 'FilterBuilder', path: '/patterns/forms/filter-builder' },
        { slug: 'filter-panel', label: 'FilterPanel', path: '/patterns/forms/filter-panel' },
        { slug: 'invoice-template', label: 'InvoiceTemplate', path: '/patterns/forms/invoice-template' },
        { slug: 'step-wizard', label: 'StepWizard', path: '/patterns/forms/step-wizard' },
      ],
    },
    {
      slug: 'visualization',
      label: 'Visualization',
      path: '/patterns/visualization',
      children: [
        { slug: 'calendar-view', label: 'CalendarView', path: '/patterns/visualization/calendar-view' },
        { slug: 'charts', label: 'Charts', path: '/patterns/visualization/charts', badge: '18' },
        { slug: 'kanban-board', label: 'KanbanBoard', path: '/patterns/visualization/kanban-board' },
        { slug: 'map-view', label: 'MapView', path: '/patterns/visualization/map-view' },
        { slug: 'timeline', label: 'Timeline', path: '/patterns/visualization/timeline' },
        { slug: 'tree-view', label: 'TreeView', path: '/patterns/visualization/tree-view' },
      ],
    },
    {
      slug: 'communication',
      label: 'Communication',
      path: '/patterns/communication',
      children: [
        { slug: 'activity-log', label: 'ActivityLog', path: '/patterns/communication/activity-log' },
        { slug: 'assistant', label: 'Assistant', path: '/patterns/communication/assistant' },
        { slug: 'comment-thread', label: 'CommentThread', path: '/patterns/communication/comment-thread' },
        { slug: 'live-feed', label: 'LiveFeed', path: '/patterns/communication/live-feed' },
        { slug: 'notification-center', label: 'NotificationCenter', path: '/patterns/communication/notification-center' },
        { slug: 'presence', label: 'Presence', path: '/patterns/communication/presence' },
      ],
    },
    {
      slug: 'feedback',
      label: 'Feedback',
      path: '/patterns/feedback',
      children: [
        { slug: 'adaptive-overlay', label: 'AdaptiveOverlay', path: '/patterns/feedback/adaptive-overlay' },
        { slug: 'empty-state', label: 'EmptyState', path: '/patterns/feedback/empty-state' },
      ],
    },
    {
      slug: 'workflow',
      label: 'Workflow',
      path: '/patterns/workflow',
      children: [
        { slug: 'approval-inbox', label: 'ApprovalInbox', path: '/patterns/workflow/approval-inbox' },
        { slug: 'approval-workflow', label: 'ApprovalWorkflow', path: '/patterns/workflow/approval-workflow' },
        { slug: 'moderation-gallery', label: 'ModerationGallery', path: '/patterns/workflow/moderation-gallery' },
        { slug: 'operational-ledger', label: 'OperationalLedger', path: '/patterns/workflow/operational-ledger' },
        { slug: 'shift-matrix', label: 'ShiftMatrix', path: '/patterns/workflow/shift-matrix' },
      ],
    },
    {
      slug: 'navigation',
      label: 'Navigation',
      path: '/patterns/navigation',
      children: [
        { slug: 'command-palette', label: 'CommandPalette', path: '/patterns/navigation/command-palette' },
        { slug: 'environment-toggle', label: 'EnvironmentToggle', path: '/patterns/navigation/environment-toggle' },
        { slug: 'locale-switcher', label: 'LocaleSwitcher', path: '/patterns/navigation/locale-switcher' },
        { slug: 'shortcuts-overlay', label: 'ShortcutsOverlay', path: '/patterns/navigation/shortcuts-overlay' },
        { slug: 'workspace-switcher', label: 'WorkspaceSwitcher', path: '/patterns/navigation/workspace-switcher' },
      ],
    },
    {
      slug: 'commerce',
      label: 'Commerce',
      path: '/patterns/commerce',
      children: [
        { slug: 'pricing-table', label: 'PricingTable', path: '/patterns/commerce/pricing-table' },
      ],
    },
    {
      slug: 'customization',
      label: 'Customization',
      path: '/patterns/customization',
      children: [
        { slug: 'branding-preview-sandbox', label: 'BrandingPreviewSandbox', path: '/patterns/customization/branding-preview-sandbox' },
        { slug: 'tenant-preview', label: 'TenantPreview', path: '/patterns/customization/tenant-preview' },
        { slug: 'token-inspector', label: 'TokenInspector', path: '/patterns/customization/token-inspector' },
      ],
    },
    {
      slug: 'identity',
      label: 'Identity',
      path: '/patterns/identity',
      children: [
        { slug: 'user-profile-card', label: 'UserProfileCard', path: '/patterns/identity/user-profile-card' },
      ],
    },
    {
      slug: 'shell',
      label: 'Shell',
      path: '/patterns/shell',
      children: [
        { slug: 'cockpit-header', label: 'CockpitHeader', path: '/patterns/shell/cockpit-header' },
        { slug: 'page-shell', label: 'PageShell', path: '/patterns/shell/page-shell' },
        { slug: 'workbench-header', label: 'WorkbenchHeader', path: '/patterns/shell/workbench-header' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Structures
// ---------------------------------------------------------------------------

const structuresNav: NavSection = {
  slug: 'structures',
  label: 'Structures',
  children: [
    {
      slug: 'headers',
      label: 'Headers',
      path: '/structures/headers',
      children: [
        { slug: 'mobile-header', label: 'MobileHeader', path: '/structures/headers/mobile-header' },
        { slug: 'collection-header', label: 'CollectionHeader', path: '/structures/headers/collection-header' },
        { slug: 'dashboard-header', label: 'DashboardHeader', path: '/structures/headers/dashboard-header' },
        { slug: 'detail-header', label: 'DetailHeader', path: '/structures/headers/detail-header' },
        { slug: 'edit-header', label: 'EditHeader', path: '/structures/headers/edit-header' },
        { slug: 'form-header', label: 'FormHeader', path: '/structures/headers/form-header' },
      ],
    },
    {
      slug: 'workspace',
      label: 'Workspace',
      path: '/structures/workspace',
      children: [
        { slug: 'action-dock', label: 'ActionDock', path: '/structures/workspace/action-dock' },
        { slug: 'active-filters-bar', label: 'ActiveFiltersBar', path: '/structures/workspace/active-filters-bar' },
        { slug: 'column-menu', label: 'ColumnMenu', path: '/structures/workspace/column-menu' },
        { slug: 'export-button', label: 'ExportButton', path: '/structures/workspace/export-button' },
        { slug: 'field-filters-panel', label: 'FieldFiltersPanel', path: '/structures/workspace/field-filters-panel' },
        { slug: 'saved-views-menu', label: 'SavedViewsMenu', path: '/structures/workspace/saved-views-menu' },
        { slug: 'scope-switcher', label: 'ScopeSwitcher', path: '/structures/workspace/scope-switcher' },
        { slug: 'search-command-bar', label: 'SearchCommandBar', path: '/structures/workspace/search-command-bar' },
        { slug: 'selection-preview-rail', label: 'SelectionPreviewRail', path: '/structures/workspace/selection-preview-rail' },
        { slug: 'table-toolbar', label: 'TableToolbar', path: '/structures/workspace/table-toolbar' },
        { slug: 'view-mode-switcher', label: 'ViewModeSwitcher', path: '/structures/workspace/view-mode-switcher' },
      ],
    },
    {
      slug: 'shell',
      label: 'Shell',
      path: '/structures/shell',
      children: [
        { slug: 'bottom-tab-bar', label: 'BottomTabBar', path: '/structures/shell/bottom-tab-bar' },
      ],
    },
    {
      slug: 'record',
      label: 'Record',
      path: '/structures/record',
      children: [
        { slug: 'record', label: 'Record', path: '/structures/record/record' },
        { slug: 'form-sections', label: 'FormSections', path: '/structures/record/form-sections' },
      ],
    },
    {
      slug: 'dashboard',
      label: 'Dashboard',
      path: '/structures/dashboard',
      children: [
        { slug: 'stats-header', label: 'StatsHeader', path: '/structures/dashboard/stats-header' },
        { slug: 'data-terminal-card', label: 'DataTerminalCard', path: '/structures/dashboard/data-terminal-card' },
        { slug: 'dashboard-insights', label: 'DashboardInsights', path: '/structures/dashboard/dashboard-insights' },
      ],
    },
    {
      slug: 'feedback',
      label: 'Feedback',
      path: '/structures/feedback',
      children: [
        { slug: 'loading-overlay', label: 'LoadingOverlay', path: '/structures/feedback/loading-overlay' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

const surfacesNav: NavSection = {
  slug: 'surfaces',
  label: 'Surfaces',
  children: [
    {
      slug: 'admin',
      label: 'Admin',
      path: '/surfaces/admin',
      children: [
        { slug: 'audit', label: 'AuditSurface', path: '/surfaces/admin/audit' },
        { slug: 'billing', label: 'BillingSurface', path: '/surfaces/admin/billing' },
        { slug: 'file-browser', label: 'FileBrowserSurface', path: '/surfaces/admin/file-browser' },
        { slug: 'import-export', label: 'ImportExportSurface', path: '/surfaces/admin/import-export' },
        { slug: 'integration', label: 'IntegrationSurface', path: '/surfaces/admin/integration' },
        { slug: 'profile', label: 'ProfileSurface', path: '/surfaces/admin/profile' },
        { slug: 'settings', label: 'SettingsSurface', path: '/surfaces/admin/settings' },
        { slug: 'team', label: 'TeamSurface', path: '/surfaces/admin/team' },
      ],
    },
    {
      slug: 'data',
      label: 'Data',
      path: '/surfaces/data',
      children: [
        { slug: 'compare', label: 'CompareSurface', path: '/surfaces/data/compare' },
        { slug: 'dashboard', label: 'DashboardSurface', path: '/surfaces/data/dashboard' },
        { slug: 'detail', label: 'DetailSurface', path: '/surfaces/data/detail' },
        { slug: 'list', label: 'ListSurface', path: '/surfaces/data/list' },
        { slug: 'report', label: 'ReportSurface', path: '/surfaces/data/report' },
        { slug: 'search', label: 'SearchSurface', path: '/surfaces/data/search' },
        { slug: 'visualization', label: 'VisualizationSurface', path: '/surfaces/data/visualization' },
      ],
    },
    {
      slug: 'experience',
      label: 'Experience',
      path: '/surfaces/experience',
      children: [
        { slug: 'auth', label: 'AuthSurface', path: '/surfaces/experience/auth' },
        { slug: 'chat', label: 'ChatSurface', path: '/surfaces/experience/chat' },
        { slug: 'editor', label: 'EditorSurface', path: '/surfaces/experience/editor' },
        { slug: 'empty-state', label: 'EmptyStateSurface', path: '/surfaces/experience/empty-state' },
        { slug: 'marketing', label: 'MarketingSurface', path: '/surfaces/experience/marketing' },
        { slug: 'media', label: 'MediaSurface', path: '/surfaces/experience/media' },
        { slug: 'notification', label: 'NotificationSurface', path: '/surfaces/experience/notification' },
        { slug: 'onboarding', label: 'OnboardingSurface', path: '/surfaces/experience/onboarding' },
        { slug: 'pricing', label: 'PricingSurface', path: '/surfaces/experience/pricing' },
      ],
    },
    {
      slug: 'forms',
      label: 'Forms',
      path: '/surfaces/forms',
      children: [
        { slug: 'detail-form', label: 'DetailFormSurface', path: '/surfaces/forms/detail-form' },
        { slug: 'form', label: 'FormSurface', path: '/surfaces/forms/form' },
        { slug: 'guided-draft-form', label: 'GuidedDraftFormSurface', path: '/surfaces/forms/guided-draft-form' },
        { slug: 'wizard', label: 'WizardSurface', path: '/surfaces/forms/wizard' },
      ],
    },
    {
      slug: 'operations',
      label: 'Operations',
      path: '/surfaces/operations',
      children: [
        { slug: 'activity', label: 'ActivitySurface', path: '/surfaces/operations/activity' },
        { slug: 'kanban', label: 'KanbanSurface', path: '/surfaces/operations/kanban' },
        { slug: 'operational', label: 'OperationalSurface', path: '/surfaces/operations/operational' },
        { slug: 'scheduler', label: 'SchedulerSurface', path: '/surfaces/operations/scheduler' },
      ],
    },
    {
      slug: 'workspace',
      label: 'Workspace',
      path: '/surfaces/workspace',
      children: [
        { slug: 'collection-workspace', label: 'CollectionWorkspaceSurface', path: '/surfaces/workspace/collection-workspace' },
        { slug: 'command-center', label: 'CommandCenterSurface', path: '/surfaces/workspace/command-center' },
        { slug: 'decision-inbox', label: 'DecisionInboxSurface', path: '/surfaces/workspace/decision-inbox' },
        { slug: 'record-workbench', label: 'RecordWorkbenchSurface', path: '/surfaces/workspace/record-workbench' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Verticals
// ---------------------------------------------------------------------------

const verticals: NavSection = {
  slug: 'verticals',
  label: 'Verticals',
  children: [
    { slug: 'platform', label: 'Platform', path: '/verticals/platform' },
    { slug: 'bithire', label: 'BitHire', path: '/verticals/bithire' },
    { slug: 'evnto', label: 'Evnto', path: '/verticals/evnto' },
  ],
};

// ---------------------------------------------------------------------------
// Standalone pages
// ---------------------------------------------------------------------------

const playground: NavSection = {
  slug: 'playground',
  label: 'Playground',
  children: [
    { slug: 'playground', label: 'Playground', path: '/playground' },
  ],
};

const developers: NavSection = {
  slug: 'developers',
  label: 'Developers',
  children: [
    {
      slug: 'developers',
      label: 'Developers',
      path: '/developers',
      children: [
        { label: 'Getting Started', slug: 'getting-started', path: '/developers/getting-started' },
        { label: 'Architecture', slug: 'architecture', path: '/developers/architecture' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Full navigation tree
// ---------------------------------------------------------------------------

export const navigation: NavSection[] = [
  foundations,
  primitives,
  patterns,
  structuresNav,
  surfacesNav,
  verticals,
  playground,
  developers,
];

/**
 * Flat list of all navigable paths for route validation.
 */
export function getAllPaths(sections: NavSection[] = navigation): string[] {
  const paths: string[] = [];

  function walk(items: NavItem[]) {
    for (const item of items) {
      paths.push(item.path);
      if (item.children) {
        walk(item.children);
      }
    }
  }

  for (const section of sections) {
    walk(section.children);
  }

  return paths;
}

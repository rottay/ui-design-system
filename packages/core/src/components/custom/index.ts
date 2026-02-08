/**
 * Custom Components
 */

// Factory
export { createPreset, createPresets } from './factory';
export type { PresetConfig, PresetContext } from './factory';

// AuthLayout
export { AuthLayout } from './auth-layout';
export type { AuthLayoutProps, AuthLayoutPreset } from './auth-layout';
export {
  MinimalAuthLayout,
  StandardAuthLayout,
  BrandedAuthLayout,
  SocialAuthLayout,
  EnterpriseAuthLayout
} from './auth-layout';

// DashboardCard
export { DashboardCard } from './dashboard-card';
export type { DashboardCardProps, DashboardCardPreset, TrendDirection } from './dashboard-card';
export { CompactDashboardCard, TrendingDashboardCard, ChartDashboardCard, DetailedDashboardCard } from './dashboard-card';

// DataTable
export { DataTable } from './data-table';
export type { DataTableProps, DataTablePreset, DataTableColumn } from './data-table';
export { SimpleDataTable, SearchableDataTable, SelectableDataTable, FullDataTable, ExpandableDataTable, ProfessionalDataTable } from './data-table';
export type { ExpandableDataTableProps, ProfessionalDataTableProps, FilterOption, RowAction, BulkAction } from './data-table';

// SearchBar
export { SearchBar } from './search-bar';
export type { SearchBarProps, SearchBarPreset, SearchSuggestion } from './search-bar';
export { BasicSearchBar, SuggestionsSearchBar, CommandSearchBar } from './search-bar';

// UserMenu
export { UserMenu } from './user-menu';
export type { UserMenuProps, UserMenuPreset, UserMenuItem } from './user-menu';
export { AvatarUserMenu, NamedUserMenu, DetailedUserMenu } from './user-menu';

// Sidebar
export { Sidebar } from './sidebar';
export type { SidebarProps, SidebarPreset, SidebarItem } from './sidebar';
export { SlimSidebar, StandardSidebar, CollapsibleSidebar } from './sidebar';

// NavigationEditor
export { NavigationEditor } from './navigation-editor';
export type {
  NavigationEditorProps,
  NavigationEditorPreset,
  MenuItem as NavMenuItem,
  MenuGroup as NavMenuGroup,
  Role as NavRole,
  Permission as NavPermission,
  RoutePolicy,
  MenuItemFormData,
  DragItem,
  EditorTab,
} from './navigation-editor';
export { StandardNavigationEditor, AdvancedNavigationEditor } from './navigation-editor';
export { ICON_OPTIONS, BADGE_COLORS, NAVIGATION_EDITOR_DEFAULTS } from './navigation-editor';

// OutreachTable
export { OutreachTable } from './outreach-table';
export type {
  OutreachTableProps,
  OutreachTablePreset,
  Contact,
  ContactStatus,
  OutreachFilterItem,
  OutreachStat,
} from './outreach-table';
export { StandardOutreachTable, PipelineOutreachTable } from './outreach-table';
export { OUTREACH_TABLE_DEFAULTS } from './outreach-table';

// SprintRetro
export { SprintRetro } from './sprint-retro';
export type {
  SprintRetroProps,
  SprintRetroPreset,
  RetroNote,
  RetroColumn,
  RetroParticipant,
  NoteColor,
} from './sprint-retro';
export { BoardSprintRetro, CompactSprintRetro } from './sprint-retro';
export { SPRINT_RETRO_DEFAULTS } from './sprint-retro';

// DataGrid
export { DataGrid } from './data-grid';
export type { DataGridProps, DataGridPreset, DataGridColumn, DataGridColumnType, BadgeConfig } from './data-grid';
export { BasicDataGrid, EnrichedDataGrid } from './data-grid';
export type { EnrichedDataGridProps } from './data-grid';
export { DATA_GRID_DEFAULTS } from './data-grid';

// TransactionList
export { TransactionList } from './transaction-list';
export type {
  TransactionListProps,
  TransactionListPreset,
  Transaction,
  TransactionStatus,
  TransactionSummary,
  TransactionFilter,
  PaymentMethod,
  PaymentMethodType,
  TransactionAction,
  TransactionRowAction,
} from './transaction-list';
export { StandardTransactionList, DetailedTransactionList } from './transaction-list';
export { TRANSACTION_LIST_DEFAULTS } from './transaction-list';

// FileManager
export { FileManager } from './file-manager';
export type {
  FileManagerProps,
  FileManagerPreset,
  FileItem,
  FileManagerNavItem,
  FileManagerAction,
  FileManagerViewMode,
} from './file-manager';
export { StandardFileManager, DualPanelFileManager } from './file-manager';
export { FILE_MANAGER_DEFAULTS } from './file-manager';

// SprintBoard
export { SprintBoard } from './sprint-board';
export type {
  SprintBoardProps,
  SprintBoardPreset,
  SprintTask,
  SprintGroup,
  TaskStatus,
  TaskPriority,
  SprintBoardTab,
  SprintBoardFilter,
} from './sprint-board';
export { ByProjectSprintBoard, BySprintSprintBoard } from './sprint-board';
export { SPRINT_BOARD_DEFAULTS } from './sprint-board';

// UserProfile
export { UserProfile } from './user-profile';
export type {
  UserProfileProps,
  UserProfilePreset,
  UserStat,
  SocialLink,
  UserProfileTab,
  UserProfileNavItem,
  AvailabilityStatus,
  MediaUploadConfig,
} from './user-profile';
export { StandardUserProfile, PortfolioUserProfile } from './user-profile';
export { USER_PROFILE_DEFAULTS } from './user-profile';

// CommentThread
export { CommentThread } from './comment-thread';
export type {
  CommentThreadProps,
  CommentThreadPreset,
  Comment,
  CommentAuthor,
  AuthorRole,
  CommentReaction,
  CategoryItem,
  SidebarMember,
} from './comment-thread';
export { ThreadCommentThread, InlineCommentThread } from './comment-thread';
export { COMMENT_THREAD_DEFAULTS } from './comment-thread';

// PricingTable
export { PricingTable } from './pricing-table';
export type {
  PricingTableProps,
  PricingTablePreset,
  PricingPlan,
  PricingFeature,
  BillingCycle,
} from './pricing-table';
export { CardsPricingTable, ComparisonPricingTable } from './pricing-table';
export { PRICING_TABLE_DEFAULTS } from './pricing-table';

// SchedulePicker
export { SchedulePicker } from './schedule-picker';
export type {
  SchedulePickerProps,
  SchedulePickerPreset,
  TimeSlot,
  DayAvailability,
  SessionDuration,
  TimePeriod,
} from './schedule-picker';
export { BookingSchedulePicker, CompactSchedulePicker } from './schedule-picker';
export { SCHEDULE_PICKER_DEFAULTS } from './schedule-picker';

// ChatMessaging
export { ChatMessaging } from './chat-messaging';
export type {
  ChatMessagingProps,
  ChatMessagingPreset,
  ChatMessage,
  Conversation,
  ConversationParticipant,
  ConversationTab,
  EmbeddedCard,
  EmbeddedCardType,
  MessageAttachment,
  MessageStatus,
} from './chat-messaging';
export { SplitChatMessaging, PanelChatMessaging } from './chat-messaging';
export { CHAT_MESSAGING_DEFAULTS } from './chat-messaging';

// WorkflowOverview
export { WorkflowOverview } from './workflow-overview';
export type {
  WorkflowOverviewProps,
  WorkflowOverviewPreset,
  WorkflowNode,
  NodeConnection,
  NodeAction,
  NodeType,
  NodeStatus,
  WorkflowTab,
} from './workflow-overview';
export { CanvasWorkflowOverview, ListWorkflowOverview } from './workflow-overview';
export { WORKFLOW_OVERVIEW_DEFAULTS } from './workflow-overview';

// ActivityMonitor
export { ActivityMonitor } from './activity-monitor';
export type {
  ActivityMonitorProps,
  ActivityMonitorPreset,
  LogEntry,
  LogDetail,
  LogStatus,
  Evaluation,
  TimelineDataPoint,
  TimeRange,
  DetailTab,
} from './activity-monitor';
export { DashboardActivityMonitor, CompactActivityMonitor } from './activity-monitor';
export { ACTIVITY_MONITOR_DEFAULTS } from './activity-monitor';

// CrmTable
export { CrmTable } from './crm-table';
export type {
  CrmTableProps,
  CrmTablePreset,
  CrmColumn,
  CrmColumnType,
  CompanySizeCategory,
  ContextMenuItem,
  BreadcrumbItem as CrmBreadcrumbItem,
} from './crm-table';
export { StandardCrmTable, EnrichedCrmTable } from './crm-table';
export { CRM_TABLE_DEFAULTS } from './crm-table';

// EmailSequence
export { EmailSequence } from './email-sequence';
export type {
  EmailSequenceProps,
  EmailSequencePreset,
  SequenceStatus,
  ToolbarAction as EmailToolbarAction,
  DelayUnit,
  StepDelay,
  StepStatus as EmailStepStatus,
  EmailRecipientField,
  EmailStep,
  ContactSendStatus,
  SequenceContact,
} from './email-sequence';
export { BuilderEmailSequence, PreviewEmailSequence } from './email-sequence';
export { EMAIL_SEQUENCE_DEFAULTS } from './email-sequence';

// GanttTimeline
export { GanttTimeline } from './gantt-timeline';
export type {
  GanttTimelineProps,
  GanttTimelinePreset,
  TimeScale,
  GanttTaskStatus,
  GanttTaskPriority,
  DependencyType,
  DateRange,
  GanttTask,
  GanttDependency,
  GanttFilter,
  GanttToolbarAction,
  GanttTaskNode,
  TimeColumn,
  TimeScaleConfig,
} from './gantt-timeline';
export { StandardGanttTimeline, CompactGanttTimeline } from './gantt-timeline';
export { GANTT_TIMELINE_DEFAULTS } from './gantt-timeline';

// ApprovalWorkflow
export { ApprovalWorkflow } from './approval-workflow';
export type {
  ApprovalWorkflowProps,
  ApprovalWorkflowPreset,
  Approver,
  Transition,
  WorkflowStatus,
  ApprovalOutcome,
  ApprovalRule,
  StatusCategory,
} from './approval-workflow';
export { EditorApprovalWorkflow, SummaryApprovalWorkflow } from './approval-workflow';
export { APPROVAL_WORKFLOW_DEFAULTS } from './approval-workflow';

// DependencyGraph
export { DependencyGraph } from './dependency-graph';
export type {
  DependencyGraphProps,
  DependencyGraphPreset,
  DependencyNode,
  DependencyLink,
  NodeStatus as DepNodeStatus,
  LinkType,
  LinkLabel,
  NodeAction as DepNodeAction,
  FilterConfig,
  DepGraphBreadcrumbItem,
} from './dependency-graph';
export { CanvasDependencyGraph, ListDependencyGraph } from './dependency-graph';
export { DEPENDENCY_GRAPH_DEFAULTS } from './dependency-graph';

// PageHeader
export { PageHeader } from './page-header';
export type {
  PageHeaderProps,
  PageHeaderPreset,
  BreadcrumbItem as PageBreadcrumbItem,
  PageHeaderAction,
} from './page-header';
export { StandardPageHeader, CompactPageHeader, HeroPageHeader } from './page-header';
export { PAGE_HEADER_DEFAULTS } from './page-header';

// CommandSearch
export { CommandSearch } from './command-search';
export type {
  CommandSearchProps,
  CommandSearchPreset,
  SearchResult,
  SearchCategory,
  QuickAction,
} from './command-search';
export { PaletteCommandSearch, InlineCommandSearch } from './command-search';
export { COMMAND_SEARCH_DEFAULTS } from './command-search';

// MetricTerminalCard
export { MetricTerminalCard } from './metric-terminal-card';
export type {
  MetricTerminalCardProps,
  MetricTerminalCardPreset,
  TrendDirection as MetricTrendDirection,
} from './metric-terminal-card';
export { CommandMetricTerminalCard, HudMetricTerminalCard, CircuitMetricTerminalCard, MatrixMetricTerminalCard } from './metric-terminal-card';
export { METRIC_TERMINAL_CARD_DEFAULTS } from './metric-terminal-card';

// CommandHeader
export { CommandHeader } from './command-header';
export type {
  CommandHeaderProps,
  CommandHeaderPreset,
  KeyMetric,
  ActivityItem,
  QuickAction as CmdQuickAction,
  AIInsight,
  SystemStatus,
  TrendDirection as CmdTrendDirection,
} from './command-header';
export { FullCommandHeader, CompactCommandHeader, MinimalCommandHeader } from './command-header';
export { COMMAND_HEADER_DEFAULTS } from './command-header';

// TableToolkit (composable sub-components)
export {
  TableToolbar,
  StatusFilterPills,
  TablePagination,
  TableEmptyState,
  TableLoadingOverlay,
  BulkSelectToggle,
  ConfirmActionModal,
  FilterSelect,
  useTableFilters,
  useTableSort,
  useBulkSelection,
} from './table-toolkit';
export type {
  TableToolbarProps,
  StatusFilterPillsProps,
  FilterPill,
  TablePaginationProps,
  TableEmptyStateProps,
  TableLoadingOverlayProps,
  BulkSelectToggleProps,
  ConfirmActionModalProps,
  FilterSelectProps,
  FilterSelectOption,
  SortDirection,
  UseTableFiltersOptions,
  UseTableFiltersReturn,
  UseTableSortOptions,
  UseTableSortReturn,
  UseBulkSelectionOptions,
  UseBulkSelectionReturn,
} from './table-toolkit';
export { TABLE_TOOLKIT_DEFAULTS } from './table-toolkit';

// ConsentBanner
export { ConsentBanner } from './consent-banner';
export type {
  ConsentBannerProps,
  ConsentBannerPreset,
  ConsentCategory,
} from './consent-banner';
export { BarConsentBanner, ModalConsentBanner } from './consent-banner';
export { CONSENT_BANNER_DEFAULTS, DEFAULT_CATEGORIES } from './consent-banner';

// ActivityFeed
export { ActivityFeed } from './activity-feed';
export type {
  ActivityFeedProps,
  ActivityFeedPreset,
  ActivityEvent as FeedActivityEvent,
  ActivityActor,
  ActivityEventType as FeedActivityEventType,
} from './activity-feed';
export { TimelineActivityFeed, CompactActivityFeed } from './activity-feed';
export { ACTIVITY_FEED_DEFAULTS } from './activity-feed';

// PermissionTree
export { PermissionTree } from './permission-tree';
export type {
  PermissionTreeProps,
  PermissionTreePreset,
  PermissionItem,
} from './permission-tree';
export { GridPermissionTree, ListPermissionTree } from './permission-tree';
export { PERMISSION_TREE_DEFAULTS } from './permission-tree';

// FilterBuilder
export { FilterBuilder } from './filter-builder';
export type {
  FilterBuilderProps,
  FilterBuilderPreset,
  FilterFieldConfig,
  FilterFieldType,
  FilterFieldOption,
  FilterQuickPreset,
  SavedFilter,
} from './filter-builder';
export { PanelFilterBuilder, BarFilterBuilder } from './filter-builder';
export { FILTER_BUILDER_DEFAULTS } from './filter-builder';

// EntityForm
export { EntityForm } from './entity-form';
export type {
  EntityFormProps,
  EntityFormPreset,
  FormFieldConfig,
  FormFieldType,
  FormFieldOption,
  FormSection,
} from './entity-form';
export { StandardEntityForm, CardEntityForm } from './entity-form';
export { ENTITY_FORM_DEFAULTS } from './entity-form';

// SkeletonPattern
export { SkeletonPattern } from './skeleton-pattern';
export type {
  SkeletonPatternProps,
  SkeletonPatternPreset,
} from './skeleton-pattern';
export { SKELETON_PATTERN_DEFAULTS } from './skeleton-pattern';

// ChartCard
export { ChartCard } from './chart-card';
export type {
  ChartCardProps,
  ChartCardPreset,
  ChartTrendDirection,
} from './chart-card';
export { CHART_CARD_DEFAULTS } from './chart-card';

// StatWidget
export { StatWidget } from './stat-widget';
export type {
  StatWidgetProps,
  StatWidgetPreset,
} from './stat-widget';
export { STAT_WIDGET_DEFAULTS } from './stat-widget';

// OnboardingWizard
export { OnboardingWizard } from './onboarding-wizard';
export type {
  OnboardingWizardProps,
  OnboardingWizardPreset,
  OnboardingStep,
} from './onboarding-wizard';
export { ONBOARDING_WIZARD_DEFAULTS } from './onboarding-wizard';

// AppShell
export { AppShell } from './app-shell';
export type { AppShellProps, AppShellPreset } from './app-shell';
export { APP_SHELL_DEFAULTS } from './app-shell';

// PageShell
export { PageShell } from './page-shell';
export type { PageShellProps, PageShellPreset, PageShellTab, PageShellBreadcrumb, PageShellAction } from './page-shell';
export { PAGE_SHELL_DEFAULTS } from './page-shell';

// SettingsPage
export { SettingsPage } from './settings-page';
export type { SettingsPageProps, SettingsPagePreset, SettingsSection } from './settings-page';
export { SETTINGS_PAGE_DEFAULTS } from './settings-page';

// ErrorPage
export { ErrorPage } from './error-page';
export type { ErrorPageProps, ErrorPagePreset, ErrorPageAction, ErrorCode } from './error-page';
export { ERROR_PAGE_DEFAULTS, ERROR_MESSAGES } from './error-page';

// EmptyState
export { EmptyState } from './empty-state';
export type { EmptyStateProps, EmptyStatePreset, EmptyStateAction } from './empty-state';
export { EMPTY_STATE_DEFAULTS } from './empty-state';

// ConfirmationDialog
export { ConfirmationDialog } from './confirmation-dialog';
export type { ConfirmationDialogProps, ConfirmationDialogPreset } from './confirmation-dialog';
export { CONFIRMATION_DIALOG_DEFAULTS } from './confirmation-dialog';

// ToastManager
export { ToastManager } from './toast-manager';
export type { ToastManagerProps, ToastManagerPreset, Toast as ToastItem, ToastType as ToastItemType, ToastPosition as ToastItemPosition } from './toast-manager';
export { TOAST_MANAGER_DEFAULTS } from './toast-manager';

// BannerAlert
export { BannerAlert } from './banner-alert';
export type { BannerAlertProps, BannerAlertPreset, BannerAlertType, BannerAlertAction } from './banner-alert';
export { BANNER_ALERT_DEFAULTS } from './banner-alert';

// TeamManager
export { TeamManager } from './team-manager';
export type { TeamManagerProps, TeamManagerPreset, TeamMember, TeamRole } from './team-manager';
export { TEAM_MANAGER_DEFAULTS } from './team-manager';

// NotificationCenter
export { NotificationCenter } from './notification-center';
export type { NotificationCenterProps, NotificationCenterPreset, Notification as NotifItem, NotificationCategory as NotifCategory, NotificationType as NotifType } from './notification-center';
export { NOTIFICATION_CENTER_DEFAULTS } from './notification-center';

// MultiStepForm
export { MultiStepForm } from './multi-step-form';
export type { MultiStepFormProps, MultiStepFormPreset, FormStep } from './multi-step-form';
export { MULTI_STEP_FORM_DEFAULTS } from './multi-step-form';

// FileUploadZone
export { FileUploadZone } from './file-upload-zone';
export type { FileUploadZoneProps, FileUploadZonePreset, UploadFile as UploadFileItem, FileUploadStatus } from './file-upload-zone';
export { FILE_UPLOAD_ZONE_DEFAULTS } from './file-upload-zone';

// --- Phase 2B: Marketing & Commerce ---

// HeroSection
export { HeroSection } from './hero-section';
export type { HeroSectionProps, HeroSectionPreset, HeroSectionAction } from './hero-section';
export { HERO_SECTION_DEFAULTS } from './hero-section';

// FeatureGrid
export { FeatureGrid } from './feature-grid';
export type { FeatureGridProps, FeatureGridPreset, FeatureItem } from './feature-grid';
export { FEATURE_GRID_DEFAULTS } from './feature-grid';

// TestimonialSection
export { TestimonialSection } from './testimonial-section';
export type { TestimonialSectionProps, TestimonialSectionPreset, Testimonial } from './testimonial-section';
export { TESTIMONIAL_SECTION_DEFAULTS } from './testimonial-section';

// CtaSection
export { CtaSection } from './cta-section';
export type { CtaSectionProps, CtaSectionPreset, CtaSectionAction } from './cta-section';
export { CTA_SECTION_DEFAULTS } from './cta-section';

// StatsSection
export { StatsSection } from './stats-section';
export type { StatsSectionProps, StatsSectionPreset, StatItem as StatsStatItem } from './stats-section';
export { STATS_SECTION_DEFAULTS } from './stats-section';

// FaqSection
export { FaqSection } from './faq-section';
export type { FaqSectionProps, FaqSectionPreset, FaqItem, FaqCategory } from './faq-section';
export { FAQ_SECTION_DEFAULTS } from './faq-section';

// FooterSection
export { FooterSection } from './footer-section';
export type { FooterSectionProps, FooterSectionPreset, FooterColumn, SocialLink as FooterSocialLink } from './footer-section';
export { FOOTER_SECTION_DEFAULTS } from './footer-section';

// LogoCloud
export { LogoCloud } from './logo-cloud';
export type { LogoCloudProps, LogoCloudPreset, LogoItem } from './logo-cloud';
export { LOGO_CLOUD_DEFAULTS } from './logo-cloud';

// ComparisonTable
export { ComparisonTable } from './comparison-table';
export type { ComparisonTableProps, ComparisonTablePreset, ComparisonPlan, ComparisonFeature } from './comparison-table';
export { COMPARISON_TABLE_DEFAULTS } from './comparison-table';

// BlogCard
export { BlogCard } from './blog-card';
export type { BlogCardProps, BlogCardPreset } from './blog-card';
export { BLOG_CARD_DEFAULTS } from './blog-card';

// TeamSection
export { TeamSection } from './team-section';
export type { TeamSectionProps, TeamSectionPreset, TeamMemberDisplay } from './team-section';
export { TEAM_SECTION_DEFAULTS } from './team-section';

// ChangelogSection
export { ChangelogSection } from './changelog-section';
export type { ChangelogSectionProps, ChangelogSectionPreset, ChangelogEntry, ChangelogType } from './changelog-section';
export { CHANGELOG_SECTION_DEFAULTS } from './changelog-section';

// ProductCard
export { ProductCard } from './product-card';
export type { ProductCardProps, ProductCardPreset } from './product-card';
export { PRODUCT_CARD_DEFAULTS } from './product-card';

// CartSummary
export { CartSummary } from './cart-summary';
export type { CartSummaryProps, CartSummaryPreset, CartItem } from './cart-summary';
export { CART_SUMMARY_DEFAULTS } from './cart-summary';

// --- Phase 2C: Data & Admin ---

// BillingPanel
export { BillingPanel } from './billing-panel';
export type { BillingPanelProps, BillingPanelPreset, Invoice, PaymentMethod as BillingPaymentMethod, SubscriptionPlan } from './billing-panel';
export { BILLING_PANEL_DEFAULTS } from './billing-panel';

// ApiKeyManager
export { ApiKeyManager } from './api-key-manager';
export type { ApiKeyManagerProps, ApiKeyManagerPreset, ApiKey } from './api-key-manager';
export { API_KEY_MANAGER_DEFAULTS } from './api-key-manager';

// AuditLog
export { AuditLog } from './audit-log';
export type { AuditLogProps, AuditLogPreset, AuditEntry } from './audit-log';
export { AUDIT_LOG_DEFAULTS } from './audit-log';

// FeatureFlagPanel
export { FeatureFlagPanel } from './feature-flag-panel';
export type { FeatureFlagPanelProps, FeatureFlagPanelPreset, FeatureFlag } from './feature-flag-panel';
export { FEATURE_FLAG_PANEL_DEFAULTS } from './feature-flag-panel';

// WebhookConfig
export { WebhookConfig } from './webhook-config';
export type { WebhookConfigProps, WebhookConfigPreset, Webhook, WebhookEvent, DeliveryLog } from './webhook-config';
export { WEBHOOK_CONFIG_DEFAULTS } from './webhook-config';

// ImportExportPanel
export { ImportExportPanel } from './import-export-panel';
export type { ImportExportPanelProps, ImportExportPanelPreset, ColumnMapping } from './import-export-panel';
export { IMPORT_EXPORT_PANEL_DEFAULTS } from './import-export-panel';

// SparklineWidget
export { SparklineWidget } from './sparkline-widget';
export type { SparklineWidgetProps, SparklineWidgetPreset } from './sparkline-widget';
export { SPARKLINE_WIDGET_DEFAULTS } from './sparkline-widget';

// Leaderboard
export { Leaderboard } from './leaderboard';
export type { LeaderboardProps, LeaderboardPreset, LeaderboardEntry } from './leaderboard';
export { LEADERBOARD_DEFAULTS } from './leaderboard';

// KpiGrid
export { KpiGrid } from './kpi-grid';
export type { KpiGridProps, KpiGridPreset, KpiItem } from './kpi-grid';
export { KPI_GRID_DEFAULTS } from './kpi-grid';

// DataSummaryBar
export { DataSummaryBar } from './data-summary-bar';
export type { DataSummaryBarProps, DataSummaryBarPreset, SummaryMetric } from './data-summary-bar';
export { DATA_SUMMARY_BAR_DEFAULTS } from './data-summary-bar';

// ProgressTracker
export { ProgressTracker } from './progress-tracker';
export type { ProgressTrackerProps, ProgressTrackerPreset, ProgressStage } from './progress-tracker';
export { PROGRESS_TRACKER_DEFAULTS } from './progress-tracker';

// ComparisonCard
export { ComparisonCard } from './comparison-card';
export type { ComparisonCardProps, ComparisonCardPreset, ComparisonMetric } from './comparison-card';
export { COMPARISON_CARD_DEFAULTS } from './comparison-card';

// --- Phase 2D: Social, Content & Navigation ---

// NewsFeed
export { NewsFeed } from './news-feed';
export type { NewsFeedProps, NewsFeedPreset, FeedPost } from './news-feed';
export { NEWS_FEED_DEFAULTS } from './news-feed';

// MediaGallery
export { MediaGallery } from './media-gallery';
export type { MediaGalleryProps, MediaGalleryPreset, MediaItem } from './media-gallery';
export { MEDIA_GALLERY_DEFAULTS } from './media-gallery';

// ProfileCard
export { ProfileCard } from './profile-card';
export type { ProfileCardProps, ProfileCardPreset } from './profile-card';
export { PROFILE_CARD_DEFAULTS } from './profile-card';

// MentionInput
export { MentionInput } from './mention-input';
export type { MentionInputProps, MentionInputPreset, MentionUser } from './mention-input';
export { MENTION_INPUT_DEFAULTS } from './mention-input';

// ContentCard
export { ContentCard } from './content-card';
export type { ContentCardProps, ContentCardPreset } from './content-card';
export { CONTENT_CARD_DEFAULTS } from './content-card';

// MegaMenu
export { MegaMenu } from './mega-menu';
export type { MegaMenuProps, MegaMenuPreset, MegaMenuGroup } from './mega-menu';
export { MEGA_MENU_DEFAULTS } from './mega-menu';

// MobileNav
export { MobileNav } from './mobile-nav';
export type { MobileNavProps, MobileNavPreset, MobileNavItem } from './mobile-nav';
export { MOBILE_NAV_DEFAULTS } from './mobile-nav';

// BottomNav
export { BottomNav } from './bottom-nav';
export type { BottomNavProps, BottomNavPreset, BottomNavItem } from './bottom-nav';
export { BOTTOM_NAV_DEFAULTS } from './bottom-nav';

// TabNav
export { TabNav } from './tab-nav';
export type { TabNavProps, TabNavPreset, TabNavItem } from './tab-nav';
export { TAB_NAV_DEFAULTS } from './tab-nav';

// SplitLayout
export { SplitLayout } from './split-layout';
export type { SplitLayoutProps, SplitLayoutPreset } from './split-layout';
export { SPLIT_LAYOUT_DEFAULTS } from './split-layout';

// ReviewList
export { ReviewList } from './review-list';
export type { ReviewListProps, ReviewListPreset, Review, RatingBreakdown } from './review-list';
export { REVIEW_LIST_DEFAULTS } from './review-list';

// ProductGallery
export { ProductGallery } from './product-gallery';
export type { ProductGalleryProps, ProductGalleryPreset, GalleryImage } from './product-gallery';
export { PRODUCT_GALLERY_DEFAULTS } from './product-gallery';

// CheckoutForm
export { CheckoutForm } from './checkout-form';
export type { CheckoutFormProps, CheckoutFormPreset, CheckoutStep } from './checkout-form';
export { CHECKOUT_FORM_DEFAULTS } from './checkout-form';

// OrderSummaryCard
export { OrderSummaryCard } from './order-summary-card';
export type { OrderSummaryCardProps, OrderSummaryCardPreset, OrderItem, TrackingStep } from './order-summary-card';
export { ORDER_SUMMARY_CARD_DEFAULTS } from './order-summary-card';

// --- Phase 2E: Nice-to-Have ---

// IntegrationHub
export { IntegrationHub } from './integration-hub';
export type { IntegrationHubProps, IntegrationHubPreset, Integration } from './integration-hub';
export { INTEGRATION_HUB_DEFAULTS } from './integration-hub';

// StatusBadgeGroup
export { StatusBadgeGroup } from './status-badge-group';
export type { StatusBadgeGroupProps, StatusBadgeGroupPreset, StatusBadge } from './status-badge-group';
export { STATUS_BADGE_GROUP_DEFAULTS } from './status-badge-group';

// MaintenancePage
export { MaintenancePage } from './maintenance-page';
export type { MaintenancePageProps, MaintenancePagePreset } from './maintenance-page';
export { MAINTENANCE_PAGE_DEFAULTS } from './maintenance-page';

// BadgeShowcase
export { BadgeShowcase } from './badge-showcase';
export type { BadgeShowcaseProps, BadgeShowcasePreset, AchievementBadge } from './badge-showcase';
export { BADGE_SHOWCASE_DEFAULTS } from './badge-showcase';

// AddressForm
export { AddressForm } from './address-form';
export type { AddressFormProps, AddressFormPreset, AddressData } from './address-form';
export { ADDRESS_FORM_DEFAULTS } from './address-form';

// PaymentForm
export { PaymentForm } from './payment-form';
export type { PaymentFormProps, PaymentFormPreset, PaymentData } from './payment-form';
export { PAYMENT_FORM_DEFAULTS } from './payment-form';

// TagInput
export { TagInput } from './tag-input';
export type { TagInputProps, TagInputPreset, Tag as TagItem } from './tag-input';
export { TAG_INPUT_DEFAULTS } from './tag-input';

// ContextualToolbar
export { ContextualToolbar } from './contextual-toolbar';
export type { ContextualToolbarProps, ContextualToolbarPreset, ToolbarAction } from './contextual-toolbar';
export { CONTEXTUAL_TOOLBAR_DEFAULTS } from './contextual-toolbar';

// AlertRuleBuilder
export { AlertRuleBuilder } from './alert-rule-builder';
export type { AlertRuleBuilderProps, AlertRuleBuilderPreset } from './alert-rule-builder';
export { ALERT_RULE_BUILDER_DEFAULTS } from './alert-rule-builder';

// AnnouncementBanner
export { AnnouncementBanner } from './announcement-banner';
export type { AnnouncementBannerProps, AnnouncementBannerPreset } from './announcement-banner';
export { ANNOUNCEMENT_BANNER_DEFAULTS } from './announcement-banner';

// KeyboardShortcuts
export { KeyboardShortcuts } from './keyboard-shortcuts';
export type { KeyboardShortcutsProps, KeyboardShortcutsPreset, ShortcutCategory } from './keyboard-shortcuts';
export { KEYBOARD_SHORTCUTS_DEFAULTS } from './keyboard-shortcuts';

// ColorPalettePicker
export { ColorPalettePicker } from './color-palette-picker';
export type { ColorPalettePickerProps, ColorPalettePickerPreset, ColorPalette } from './color-palette-picker';
export { COLOR_PALETTE_PICKER_DEFAULTS } from './color-palette-picker';

// AvatarGroup (aliased to avoid conflict with primitives AvatarGroup)
export { AvatarGroup as CustomAvatarGroup } from './avatar-group';
export type { AvatarGroupProps as CustomAvatarGroupProps, AvatarGroupPreset, AvatarItem } from './avatar-group';
export { AVATAR_GROUP_DEFAULTS } from './avatar-group';

// --- BitHire ATS Components ---

// BhIndividualHome
export { BhIndividualHome } from './bh-individual-home';
export type {
  BhIndividualHomeProps,
  BhIndividualHomePreset,
  WelcomeInfo,
  PipelinePreview,
  PipelineStage,
  ScheduleItem as BhScheduleItem,
  WizardStep as BhWizardStep,
  PerformanceRing,
  RecentCandidate,
  TokenBalance,
} from './bh-individual-home';
export { StandardBhIndividualHome } from './bh-individual-home';
export { BH_INDIVIDUAL_HOME_DEFAULTS } from './bh-individual-home';

// BhOnboardingFlow
export { BhOnboardingFlow } from './bh-onboarding-flow';
export type {
  BhOnboardingFlowProps,
  BhOnboardingFlowPreset,
  OnboardingStep as BhOnboardingStep,
  FormField as BhFormField,
  PreviewItem as BhPreviewItem,
  HelpTooltip as BhHelpTooltip,
} from './bh-onboarding-flow';
export { AdminSetupBhOnboardingFlow, RecruiterWelcomeBhOnboardingFlow } from './bh-onboarding-flow';
export { BH_ONBOARDING_FLOW_DEFAULTS } from './bh-onboarding-flow';

// BhTemplateDesigner
export { BhTemplateDesigner } from './bh-template-designer';
export type {
  BhTemplateDesignerProps,
  BhTemplateDesignerPreset,
  TemplateStage,
  StageType,
  AutomationRule,
  TemplateVersion,
  ValidationItem,
  ValidationStatus,
  AvailableAgent,
  AvailableRubric,
  TemplateStatus,
} from './bh-template-designer';
export { CanvasBhTemplateDesigner, FormBhTemplateDesigner } from './bh-template-designer';
export { BH_TEMPLATE_DESIGNER_DEFAULTS } from './bh-template-designer';

// BhRubricBuilder
export { BhRubricBuilder } from './bh-rubric-builder';
export type {
  BhRubricBuilderProps,
  BhRubricBuilderPreset,
  ScoringDimension,
  ScoreLevel,
  ValidationError as RubricValidationError,
  RubricStatus,
  ScorableType,
} from './bh-rubric-builder';
export { EditorBhRubricBuilder, PreviewBhRubricBuilder } from './bh-rubric-builder';
export { BH_RUBRIC_BUILDER_DEFAULTS } from './bh-rubric-builder';

// BhCalibrationView
export { BhCalibrationView } from './bh-calibration-view';
export type {
  BhCalibrationViewProps,
  BhCalibrationViewPreset,
  CalibrationSample,
  TranscriptLine,
  AlignmentMetrics,
  DimensionAdjustment,
} from './bh-calibration-view';
export { SessionBhCalibrationView, ResultsBhCalibrationView } from './bh-calibration-view';
export { BH_CALIBRATION_VIEW_DEFAULTS } from './bh-calibration-view';

// BhScoringInsights
export { BhScoringInsights } from './bh-scoring-insights';
export type {
  BhScoringInsightsProps,
  BhScoringInsightsPreset,
  ScoringKpi,
  LevelDistribution,
  HeatmapCell,
  KnockoutStat,
  TrendPoint,
  CohortComparison,
  SkillGap,
  ScoringFilter,
} from './bh-scoring-insights';
export { DashboardBhScoringInsights, DetailedBhScoringInsights } from './bh-scoring-insights';
export { BH_SCORING_INSIGHTS_DEFAULTS } from './bh-scoring-insights';

// BhTeamBoard
export { BhTeamBoard } from './bh-team-board';
export type {
  BhTeamBoardProps,
  BhTeamBoardPreset,
  TeamItem as BhTeamItem,
  TeamMember as BhTeamMember,
  TeamKpiData,
  SprintData as BhSprintData,
  TeamTarget,
} from './bh-team-board';
export { GridBhTeamBoard, DetailBhTeamBoard } from './bh-team-board';
export { BH_TEAM_BOARD_DEFAULTS } from './bh-team-board';

// BhProviderConfig
export { BhProviderConfig } from './bh-provider-config';
export type {
  BhProviderConfigProps,
  BhProviderConfigPreset,
  ProviderItem,
  ProviderType,
  ProviderStatus,
  CircuitBreakerState,
  TestStatus,
  ApiKeyInfo,
  ModelInfo,
  FallbackChain,
  TestResult,
  DragState,
} from './bh-provider-config';
export { DashboardBhProviderConfig, DetailBhProviderConfig } from './bh-provider-config';
export { BH_PROVIDER_CONFIG_DEFAULTS } from './bh-provider-config';

// BhRecruiterHome
export { BhRecruiterHome } from './bh-recruiter-home';
export type {
  BhRecruiterHomeProps,
  BhRecruiterHomePreset,
  KpiStat,
  PipelineJob,
  UpcomingInterview,
  QuickAction as BhRecruiterQuickAction,
  ActivityType as BhRecruiterActivityType,
  EntityType as BhRecruiterEntityType,
  ActivityItem as BhRecruiterActivityItem,
  NotificationType as BhRecruiterNotificationType,
  Notification as BhRecruiterNotification,
  AISuggestion,
  PerformanceMetric,
} from './bh-recruiter-home';
export { OverviewBhRecruiterHome, CompactBhRecruiterHome } from './bh-recruiter-home';
export { BH_RECRUITER_HOME_DEFAULTS } from './bh-recruiter-home';

// BhManagerConsole
export { BhManagerConsole } from './bh-manager-console';
export type {
  BhManagerConsoleProps,
  BhManagerConsolePreset,
  SlaStatus as BhManagerSlaStatus,
  AlertSeverity,
  TaskPriority as BhManagerTaskPriority,
  TrendDirection as BhManagerTrendDirection,
  DateRangeOption,
  MetricViewMode,
  Team,
  TeamKpi as BhManagerTeamKpi,
  RecruiterWorkload,
  SlaItem,
  TaskCard,
  PipelineStage as BhManagerPipelineStage,
  PerformanceAlert,
  SprintSummary,
} from './bh-manager-console';
export { OverviewBhManagerConsole, PerformanceBhManagerConsole } from './bh-manager-console';
export { BH_MANAGER_CONSOLE_DEFAULTS } from './bh-manager-console';

// BhAdminCenter
export { BhAdminCenter } from './bh-admin-center';
export type {
  BhAdminCenterProps,
  BhAdminCenterPreset,
  SystemHealthStatus,
  ProviderStatusType,
  CircuitBreakerState as BhAdminCircuitBreakerState,
  ProviderHealth,
  BillingMetrics,
  GlobalKpi,
  UserSummary,
  SystemEventType,
  EventSeverity,
  SystemEvent,
  CostBreakdown as BhAdminCostBreakdown,
  ComplianceLevel,
  ComplianceStatus,
  AdminQuickAction,
  DateRangeValue,
} from './bh-admin-center';
export { OverviewBhAdminCenter, BillingBhAdminCenter } from './bh-admin-center';
export { BH_ADMIN_CENTER_DEFAULTS } from './bh-admin-center';

// BhJobBoard
export { BhJobBoard } from './bh-job-board';
export type {
  BhJobBoardProps,
  BhJobBoardPreset,
  JobStatus as BhJobBoardJobStatus,
  JobUrgency,
  CandidateStage,
  JobItem,
  JobBoardStat,
  JobBoardFilter,
  ViewMode as BhJobBoardViewMode,
  SortDirection as BhJobBoardSortDirection,
} from './bh-job-board';
export { GridBhJobBoard, TableBhJobBoard, KanbanBhJobBoard } from './bh-job-board';
export { BH_JOB_BOARD_DEFAULTS } from './bh-job-board';

// BhJobEditor
export { BhJobEditor } from './bh-job-editor';
export type {
  BhJobEditorProps,
  BhJobEditorPreset,
  EmploymentType,
  SeniorityLevel,
  WorkArrangement,
  SkillTag,
  ScreeningQuestion,
  JobFormData,
  JobEditorStep,
  ValidationError as BhJobEditorValidationError,
  JobTemplate,
  JobClient,
} from './bh-job-editor';
export { WizardBhJobEditor, SinglePageBhJobEditor } from './bh-job-editor';
export { BH_JOB_EDITOR_DEFAULTS } from './bh-job-editor';

// BhJobDetail
export { BhJobDetail } from './bh-job-detail';
export type {
  BhJobDetailProps,
  BhJobDetailPreset,
  JobStatus as BhJobDetailJobStatus,
  UrgencyLevel,
  CandidateStatus as BhJobDetailCandidateStatus,
  JobEventType,
  MetricsTimeRange,
  JobInfo,
  JobMetric,
  FunnelStage as BhJobDetailFunnelStage,
  CandidatePreview,
  TemplateInfo,
  JobEvent,
  AnalyticsSource,
  TimeToStageEntry,
  ScoreDistributionBucket,
  AnalyticsData,
  SlaConfig as BhJobDetailSlaConfig,
  JobSettings,
  JobDetailTab,
} from './bh-job-detail';
export { FullBhJobDetail, CompactBhJobDetail } from './bh-job-detail';
export { BH_JOB_DETAIL_DEFAULTS } from './bh-job-detail';

// BhClientDirectory
export { BhClientDirectory } from './bh-client-directory';
export type {
  BhClientDirectoryProps,
  BhClientDirectoryPreset,
  ClientType,
  ClientStatus,
  ClientTier,
  ApprovalStatus,
  ClientContact,
  ClientItem,
  ClientFilter,
  ViewMode as BhClientDirectoryViewMode,
} from './bh-client-directory';
export { DirectoryBhClientDirectory, CardsBhClientDirectory } from './bh-client-directory';
export { BH_CLIENT_DIRECTORY_DEFAULTS } from './bh-client-directory';

// BhPositionDetail
export { BhPositionDetail } from './bh-position-detail';
export type {
  BhPositionDetailProps,
  BhPositionDetailPreset,
  PositionStatus,
  FeeStructure,
  PositionEventType,
  PositionTab,
  PositionInfo,
  RequirementSummary,
  LinkedJob,
  TeamAssignment,
  FinancialTracker,
  SlaMilestone,
  SlaMonitor as BhPositionSlaMonitor,
  PositionEvent,
} from './bh-position-detail';
export { StandardBhPositionDetail } from './bh-position-detail';
export { BH_POSITION_DETAIL_DEFAULTS } from './bh-position-detail';

// BhAgentStudio
export { BhAgentStudio } from './bh-agent-studio';
export type {
  BhAgentStudioProps,
  BhAgentStudioPreset,
  AgentType as BhStudioAgentType,
  VoiceProvider,
  PersonalityTrait,
  ScriptSection,
  ToolConfig,
  CallSettings,
  ValidationStatus as BhStudioValidationStatus,
  ValidationResult as BhStudioValidationResult,
  AgentData,
  VoiceOption,
  ModelOption,
} from './bh-agent-studio';
export { FullBhAgentStudio, GuidedBhAgentStudio } from './bh-agent-studio';
export { BH_AGENT_STUDIO_DEFAULTS, DEFAULT_AGENT_DATA } from './bh-agent-studio';

// BhAgentGallery
export { BhAgentGallery } from './bh-agent-gallery';
export type {
  BhAgentGalleryProps,
  BhAgentGalleryPreset,
  AgentTab,
  AgentStatus,
  AgentType as BhGalleryAgentType,
  AgentSummary,
  AgentPreview,
  AgentFilter,
  AgentViewMode,
} from './bh-agent-gallery';
export { GalleryBhAgentGallery, ListBhAgentGallery } from './bh-agent-gallery';
export { BH_AGENT_GALLERY_DEFAULTS } from './bh-agent-gallery';

// BhAgentTester
export { BhAgentTester } from './bh-agent-tester';
export type {
  BhAgentTesterProps,
  BhAgentTesterPreset,
  ChatRole,
  ChatMessage as BhChatMessage,
  TestConfig,
  ValidationStatus as BhTesterValidationStatus,
  ValidationCheck,
  TranscriptLine as BhTesterTranscriptLine,
  CostEstimate,
  AgentInfo,
  AudioPlaybackState,
  AudioState,
} from './bh-agent-tester';
export { StandardBhAgentTester } from './bh-agent-tester';
export { BH_AGENT_TESTER_DEFAULTS } from './bh-agent-tester';

// BhTemplateLibrary
export { BhTemplateLibrary } from './bh-template-library';
export type {
  BhTemplateLibraryProps,
  BhTemplateLibraryPreset,
  TemplateStage as BhLibraryTemplateStage,
  TemplateItem,
  TemplateFilter,
  IndustryGroup,
} from './bh-template-library';
export { CardsBhTemplateLibrary, TableBhTemplateLibrary } from './bh-template-library';
export { BH_TEMPLATE_LIBRARY_DEFAULTS } from './bh-template-library';

// BhCandidateKanban
export { BhCandidateKanban } from './bh-candidate-kanban';
export type {
  BhCandidateKanbanProps,
  BhCandidateKanbanPreset,
  CandidateSource,
  AiRecommendation,
  SlaStatus as BhKanbanSlaStatus,
  KanbanCandidate,
  KanbanStage,
  KanbanFilter,
  BulkAction as BhKanbanBulkAction,
} from './bh-candidate-kanban';
export { BoardBhCandidateKanban, SwimlaneBhCandidateKanban } from './bh-candidate-kanban';
export { BH_CANDIDATE_KANBAN_DEFAULTS } from './bh-candidate-kanban';

// BhCandidateProfile
export { BhCandidateProfile } from './bh-candidate-profile';
export type {
  BhCandidateProfileProps,
  BhCandidateProfilePreset,
  CandidateTab,
  CandidateInfo,
  CandidateSkill,
  Experience,
  Education,
  CandidateApplication,
  CandidateInterview,
  ScoreCard,
  CandidateNote,
  CandidateEvent,
  CandidateStats,
} from './bh-candidate-profile';
export { FullBhCandidateProfile, CompactBhCandidateProfile } from './bh-candidate-profile';
export { BH_CANDIDATE_PROFILE_DEFAULTS } from './bh-candidate-profile';

// BhCandidateImport
export { BhCandidateImport } from './bh-candidate-import';
export type {
  BhCandidateImportProps,
  BhCandidateImportPreset,
  ImportMethod,
  ImportStep,
  FieldMapping,
  DedupMatch,
  ValidationResult as BhImportValidationResult,
  ImportProgress,
} from './bh-candidate-import';
export { StandardBhCandidateImport } from './bh-candidate-import';
export { BH_CANDIDATE_IMPORT_DEFAULTS } from './bh-candidate-import';

// BhCandidateSearch
export { BhCandidateSearch } from './bh-candidate-search';
export type {
  BhCandidateSearchProps,
  BhCandidateSearchPreset,
  SearchResult as BhSearchResult,
  SavedSearch,
  SearchFilter,
  FacetCount,
} from './bh-candidate-search';
export { StandardBhCandidateSearch } from './bh-candidate-search';
export { BH_CANDIDATE_SEARCH_DEFAULTS } from './bh-candidate-search';

// BhCandidateOutreach
export { BhCandidateOutreach } from './bh-candidate-outreach';
export type {
  BhCandidateOutreachProps,
  BhCandidateOutreachPreset,
  OutreachChannel,
  OutreachRecipient,
  OutreachTemplate,
  CampaignMetrics,
  ABVariant,
  ScheduleConfig,
} from './bh-candidate-outreach';
export { ComposerBhCandidateOutreach, TrackerBhCandidateOutreach } from './bh-candidate-outreach';
export { BH_CANDIDATE_OUTREACH_DEFAULTS } from './bh-candidate-outreach';

// BhComparisonView
export { BhComparisonView } from './bh-comparison-view';
export type {
  BhComparisonViewProps,
  BhComparisonViewPreset,
  ComparisonCandidate,
  ComparisonRow,
  CandidateDecision,
} from './bh-comparison-view';
export { StandardBhComparisonView } from './bh-comparison-view';
export { BH_COMPARISON_VIEW_DEFAULTS } from './bh-comparison-view';

// BhInterviewCenter
export { BhInterviewCenter } from './bh-interview-center';
export type {
  BhInterviewCenterProps,
  BhInterviewCenterPreset,
  InterviewType,
  InterviewStatus,
  CalendarView,
  InterviewItem,
  InterviewStats,
  InterviewFilter,
  SortDirection as BhInterviewSortDirection,
} from './bh-interview-center';
export { CalendarBhInterviewCenter, ListBhInterviewCenter, TimelineBhInterviewCenter } from './bh-interview-center';
export { BH_INTERVIEW_CENTER_DEFAULTS } from './bh-interview-center';

// BhInterviewPlayer
export { BhInterviewPlayer } from './bh-interview-player';
export type {
  BhInterviewPlayerProps,
  BhInterviewPlayerPreset,
  EvidenceHighlight,
  ScorecardDimension as BhPlayerScorecardDimension,
  InterviewScorecard,
  TranscriptLine as BhPlayerTranscriptLine,
  TimestampedNote,
  AiInsight,
  InterviewInfo,
} from './bh-interview-player';
export { FullBhInterviewPlayer, TranscriptOnlyBhInterviewPlayer } from './bh-interview-player';
export { BH_INTERVIEW_PLAYER_DEFAULTS } from './bh-interview-player';

// BhInterviewMonitor
export { BhInterviewMonitor } from './bh-interview-monitor';
export type {
  BhInterviewMonitorProps,
  BhInterviewMonitorPreset,
  ActiveSession,
  ProviderStatus as BhMonitorProviderStatus,
  MonitorAlert,
  MetricsDataPoint,
  RecentCompletion,
} from './bh-interview-monitor';
export { StandardBhInterviewMonitor } from './bh-interview-monitor';
export { BH_INTERVIEW_MONITOR_DEFAULTS } from './bh-interview-monitor';

// BhInterviewScheduler
export { BhInterviewScheduler } from './bh-interview-scheduler';
export type {
  BhInterviewSchedulerProps,
  BhInterviewSchedulerPreset,
  ScheduleCandidate,
  InterviewTypeConfig,
  ScheduleData,
  AgentOverride,
  AvailableAgent as BhSchedulerAvailableAgent,
  AvailableInterviewer,
} from './bh-interview-scheduler';
export { StandardBhInterviewScheduler } from './bh-interview-scheduler';
export { BH_INTERVIEW_SCHEDULER_DEFAULTS } from './bh-interview-scheduler';

// BhInterviewPrep
export { BhInterviewPrep } from './bh-interview-prep';
export type {
  BhInterviewPrepProps,
  BhInterviewPrepPreset,
  InterviewBrief,
  CandidateBrief,
  EvaluationFocus,
  ScriptOverview,
  ChecklistItem,
} from './bh-interview-prep';
export { StandardBhInterviewPrep } from './bh-interview-prep';
export { BH_INTERVIEW_PREP_DEFAULTS } from './bh-interview-prep';

// BhScorecardDetail
export { BhScorecardDetail } from './bh-scorecard-detail';
export type {
  BhScorecardDetailProps,
  BhScorecardDetailPreset,
  ScoreLevel as BhScorecardScoreLevel,
  ScorecardHeader,
  ScorecardDimension as BhScorecardDimension,
  DimensionEvidence,
  OverrideInfo,
  CohortComparison as BhScorecardCohortComparison,
  ScorecardSortBy,
  ScorecardView,
} from './bh-scorecard-detail';
export { FullBhScorecardDetail, SummaryBhScorecardDetail } from './bh-scorecard-detail';
export { BH_SCORECARD_DETAIL_DEFAULTS } from './bh-scorecard-detail';

// BhRankingBoard
export { BhRankingBoard } from './bh-ranking-board';
export type {
  BhRankingBoardProps,
  BhRankingBoardPreset,
  DecisionAction as BhRankingDecisionAction,
  DecisionStatus,
  RankedCandidate,
  ScoreDistribution,
  RankingFilters,
  RankingSortBy,
  SortDirection as BhRankingSortDirection,
} from './bh-ranking-board';
export { TableBhRankingBoard, ComparisonBhRankingBoard } from './bh-ranking-board';
export { BH_RANKING_BOARD_DEFAULTS } from './bh-ranking-board';

// BhDecisionHub
export { BhDecisionHub } from './bh-decision-hub';
export type {
  BhDecisionHubProps,
  BhDecisionHubPreset,
  DecisionAction as BhHubDecisionAction,
  RejectCategory,
  HistoryFilter,
  DecisionCandidate,
  DecisionRecord,
  CompareSlot,
  BulkDecisionEntry,
  RejectReasonData,
  AdvanceStepData,
  DecisionFormData,
} from './bh-decision-hub';
export { StandardBhDecisionHub, BulkBhDecisionHub } from './bh-decision-hub';
export { BH_DECISION_HUB_DEFAULTS } from './bh-decision-hub';

// BhFeedbackEditor
export { BhFeedbackEditor } from './bh-feedback-editor';
export type {
  BhFeedbackEditorProps,
  BhFeedbackEditorPreset,
  FeedbackChannel,
  FeedbackTone,
  FeedbackTemplateCategory,
  FeedbackTemplate,
  DecisionContext,
} from './bh-feedback-editor';
export { StandardBhFeedbackEditor } from './bh-feedback-editor';
export { BH_FEEDBACK_EDITOR_DEFAULTS } from './bh-feedback-editor';

// BhOfferWorkspace
export { BhOfferWorkspace } from './bh-offer-workspace';
export type {
  BhOfferWorkspaceProps,
  BhOfferWorkspacePreset,
  OfferStatus,
  CompensationData,
  BenefitItem,
  BenefitCategory,
  ApprovalStep,
  NegotiationChange,
  NegotiationVersion,
  DocumentInfo as BhOfferDocumentInfo,
  EmploymentTerms,
  RelocationPackage,
  SignatureStatus,
} from './bh-offer-workspace';
export { EditorBhOfferWorkspace, TrackerBhOfferWorkspace } from './bh-offer-workspace';
export { BH_OFFER_WORKSPACE_DEFAULTS } from './bh-offer-workspace';

// BhTenantSetup
export { BhTenantSetup } from './bh-tenant-setup';
export type {
  BhTenantSetupProps,
  BhTenantSetupPreset,
  SetupStep,
  BillingMode,
  ProviderTestResult,
  TeamSetup,
  InvitationItem,
  TenantFormData,
} from './bh-tenant-setup';
export { FullBhTenantSetup, QuickBhTenantSetup } from './bh-tenant-setup';
export { BH_TENANT_SETUP_DEFAULTS } from './bh-tenant-setup';

// BhTokenManager
export { BhTokenManager } from './bh-token-manager';
export type {
  BhTokenManagerProps,
  BhTokenManagerPreset,
  TokenBalance as BhTokenBalance,
  ConsumptionDataPoint,
  CostBreakdownItem,
  TeamQuota,
  TokenTransaction,
  AlertConfig,
  ForecastPoint,
} from './bh-token-manager';
export { OverviewBhTokenManager, DetailedBhTokenManager } from './bh-token-manager';
export { BH_TOKEN_MANAGER_DEFAULTS } from './bh-token-manager';

// BhAnalyticsHub
export { BhAnalyticsHub } from './bh-analytics-hub';
export type {
  BhAnalyticsHubProps,
  BhAnalyticsHubPreset,
  DateRangePreset,
  FunnelStage as BhAnalyticsFunnelStage,
  TimeToHireData,
  SourceEffectiveness,
  RecruiterPerformance,
  CostAnalysis,
  PipelineVelocity,
  TrendComparison,
} from './bh-analytics-hub';
export { ExecutiveBhAnalyticsHub, OperationalBhAnalyticsHub } from './bh-analytics-hub';
export { BH_ANALYTICS_HUB_DEFAULTS } from './bh-analytics-hub';

// BhSlaMonitor
export { BhSlaMonitor } from './bh-sla-monitor';
export type {
  BhSlaMonitorProps,
  BhSlaMonitorPreset,
  SlaCompliance,
  SlaBreach,
  SlaStatusColor,
  StageSla,
  AtRiskItem,
  SlaHistoryPoint,
  SlaConfig as BhSlaConfig,
} from './bh-sla-monitor';
export { StandardBhSlaMonitor } from './bh-sla-monitor';
export { BH_SLA_MONITOR_DEFAULTS } from './bh-sla-monitor';

// BhAuditTrail
export { BhAuditTrail } from './bh-audit-trail';
export type {
  BhAuditTrailProps,
  BhAuditTrailPreset,
  EntityType as BhAuditEntityType,
  ActionType as BhAuditActionType,
  AuditEvent,
  AuditStats,
  AuditFilter,
} from './bh-audit-trail';
export { TimelineBhAuditTrail, TableBhAuditTrail } from './bh-audit-trail';
export { BH_AUDIT_TRAIL_DEFAULTS } from './bh-audit-trail';

// BhApprovalQueue
export { BhApprovalQueue } from './bh-approval-queue';
export type {
  BhApprovalQueueProps,
  BhApprovalQueuePreset,
  ApprovalCategory,
  ApprovalItem,
  ApprovalDetail,
  ApprovalStats,
  ApprovalHistory,
} from './bh-approval-queue';
export { StandardBhApprovalQueue } from './bh-approval-queue';
export { BH_APPROVAL_QUEUE_DEFAULTS } from './bh-approval-queue';

// BhEvidenceBrowser
export { BhEvidenceBrowser } from './bh-evidence-browser';
export type {
  BhEvidenceBrowserProps,
  BhEvidenceBrowserPreset,
  EvidenceItem,
  TranscriptSegment,
  EvidenceImpact,
  SpeakerRole as EvidenceSpeakerRole,
  EvidenceFilter,
} from './bh-evidence-browser';
export { SplitPaneBhEvidenceBrowser, CompactBhEvidenceBrowser } from './bh-evidence-browser';
export { BH_EVIDENCE_BROWSER_DEFAULTS } from './bh-evidence-browser';

// BhFraudMonitor
export { BhFraudMonitor } from './bh-fraud-monitor';
export type {
  BhFraudMonitorProps,
  BhFraudMonitorPreset,
  ProctoringEvent,
  SimilarityCheck,
  FraudStats,
  EventSeverity as FraudEventSeverity,
  EventType as FraudEventType,
  ReviewStatus,
} from './bh-fraud-monitor';
export { DashboardBhFraudMonitor, CompactBhFraudMonitor } from './bh-fraud-monitor';
export { BH_FRAUD_MONITOR_DEFAULTS } from './bh-fraud-monitor';

// BhSkillGapMap
export { BhSkillGapMap } from './bh-skill-gap-map';
export type {
  BhSkillGapMapProps,
  BhSkillGapMapPreset,
  SkillGapItem,
  DimensionHeatmapCell,
  GapSummary,
  GapPriority,
} from './bh-skill-gap-map';
export { HeatmapBhSkillGapMap, ListBhSkillGapMap } from './bh-skill-gap-map';
export { BH_SKILL_GAP_MAP_DEFAULTS } from './bh-skill-gap-map';

// BhCostAnalyzer
export { BhCostAnalyzer } from './bh-cost-analyzer';
export type {
  BhCostAnalyzerProps,
  BhCostAnalyzerPreset,
  ProviderCost,
  ModelCost,
  CostTrendPoint,
  TokenBalance as CostTokenBalance,
  BudgetAlert,
  CostSummary,
  CostCategory,
  TrendDirection as CostTrendDirection,
} from './bh-cost-analyzer';
export { DashboardBhCostAnalyzer, BreakdownBhCostAnalyzer } from './bh-cost-analyzer';
export { BH_COST_ANALYZER_DEFAULTS } from './bh-cost-analyzer';

// BhInterviewReplay
export { BhInterviewReplay } from './bh-interview-replay';
export type {
  BhInterviewReplayProps,
  BhInterviewReplayPreset,
  TranscriptEntry,
  ScoreOverlayPoint,
  EvidenceMarker,
  PersonaInfo,
  ReplayScoreSummary,
  SpeakerRole as ReplaySpeakerRole,
} from './bh-interview-replay';
export { FullBhInterviewReplay, CompactBhInterviewReplay } from './bh-interview-replay';
export { BH_INTERVIEW_REPLAY_DEFAULTS } from './bh-interview-replay';

// BhPanelCoordinator
export { BhPanelCoordinator } from './bh-panel-coordinator';
export type {
  BhPanelCoordinatorProps,
  BhPanelCoordinatorPreset,
  PanelMember as CoordinatorPanelMember,
  InterviewStage as CoordinatorInterviewStage,
  PanelConsensus,
  AggregationStrategy,
  Recommendation,
  StageStatus as CoordinatorStageStatus,
} from './bh-panel-coordinator';
export { TimelineBhPanelCoordinator, SummaryBhPanelCoordinator } from './bh-panel-coordinator';
export { BH_PANEL_COORDINATOR_DEFAULTS } from './bh-panel-coordinator';

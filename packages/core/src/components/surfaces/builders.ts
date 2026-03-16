/**
 * @fileoverview Surface config builders - Rottay Design System
 * @description Tiny identity helpers that preserve type inference for app-level
 * surface configuration without forcing consumers to spell complex generics.
 *
 * @remarks
 * These builders are intentionally boring: they do not transform config.
 * Their only job is to give TypeScript a stable inference boundary so surface
 * setup in app code stays ergonomic and strongly typed.
 */

import type { FeedItem } from '../patterns';
import type {
  ActivitySurfaceConfig,
  AuditSurfaceConfig,
  AuthSurfaceConfig,
  BillingSurfaceConfig,
  ChatSurfaceConfig,
  CompareSurfaceConfig,
  DashboardSurfaceConfig,
  DetailFormSurfaceConfig,
  DetailSurfaceConfig,
  EditorSurfaceConfig,
  EmptyStateSurfaceConfig,
  FileBrowserSurfaceConfig,
  FormSurfaceConfig,
  HeaderSurfaceConfig,
  ImportExportSurfaceConfig,
  IntegrationSurfaceConfig,
  KanbanSurfaceConfig,
  ListSurfaceConfig,
  MediaSurfaceConfig,
  NotificationSurfaceConfig,
  OnboardingSurfaceConfig,
  OperationalSurfaceConfig,
  PricingSurfaceConfig,
  ProfileSurfaceConfig,
  ReportSurfaceConfig,
  SchedulerSurfaceConfig,
  SearchSurfaceConfig,
  SettingsSurfaceConfig,
  SidebarSurfaceConfig,
  TeamSurfaceConfig,
  VisualizationSurfaceConfig,
  WizardSurfaceConfig,
} from './types';

// ---------------------------------------------------------------------------
// Identity builders
// ---------------------------------------------------------------------------
//
// Each function below is a no-op at runtime -- it returns the config object
// unchanged. The value is purely at the type level: TypeScript uses the
// function signature to infer the full generic config type so consumers
// never need to write `ListSurfaceConfig<MyView>` explicitly.
//
// Pattern:
//   const config = createListSurfaceConfig({ ... });
//   // `config` is correctly inferred as `ListSurfaceConfig<MyView>`
// ---------------------------------------------------------------------------

/**
 * Create a type-safe list surface config with automatic `TView` inference.
 *
 * @typeParam TView - Row/card item view-model type, inferred from `columns`.
 * @param config - Full list surface configuration.
 * @returns The same config object, strongly typed.
 *
 * @example
 * ```ts
 * const userListConfig = createListSurfaceConfig({
 *   visual: { defaultView: 'table' },
 *   presentation: { chrome: { title: 'Users' } },
 *   behavior: { columns: userColumns },
 * });
 * ```
 */
export function createListSurfaceConfig<TView>(
  config: ListSurfaceConfig<TView>
): ListSurfaceConfig<TView> {
  return config;
}

/**
 * Create a type-safe dashboard surface config.
 * @param config - Full dashboard surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createDashboardSurfaceConfig(
  config: DashboardSurfaceConfig
): DashboardSurfaceConfig {
  return config;
}

/**
 * Create a type-safe chat surface config.
 * Preserves typing for transcripts, composer behavior, and side panels.
 * @param config - Full chat surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createChatSurfaceConfig(
  config: ChatSurfaceConfig
): ChatSurfaceConfig {
  return config;
}

/**
 * Create a type-safe detail surface config with automatic `TView` inference.
 * @typeParam TView - Entity view-model type displayed on the detail page.
 * @param config - Full detail surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createDetailSurfaceConfig<TView>(
  config: DetailSurfaceConfig<TView>
): DetailSurfaceConfig<TView> {
  return config;
}

/**
 * Create a type-safe form surface config.
 * Preserves inference around field definitions, defaults, and submit behavior.
 * @param config - Full form surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createFormSurfaceConfig(
  config: FormSurfaceConfig
): FormSurfaceConfig {
  return config;
}

/**
 * Create a type-safe wizard surface config.
 * @param config - Full wizard surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createWizardSurfaceConfig(
  config: WizardSurfaceConfig
): WizardSurfaceConfig {
  return config;
}

/**
 * Create a type-safe header surface config.
 * Preserves layout-shell typing for header chrome and navigation actions.
 * @param config - Full header surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createHeaderSurfaceConfig(
  config: HeaderSurfaceConfig
): HeaderSurfaceConfig {
  return config;
}

/**
 * Create a type-safe sidebar surface config.
 * @param config - Full sidebar surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSidebarSurfaceConfig(
  config: SidebarSurfaceConfig
): SidebarSurfaceConfig {
  return config;
}

/**
 * Create a type-safe detail-form surface config.
 * @param config - Full detail-form surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createDetailFormSurfaceConfig(
  config: DetailFormSurfaceConfig
): DetailFormSurfaceConfig {
  return config;
}

/**
 * Create a type-safe visualization surface config.
 * @param config - Full visualization surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createVisualizationSurfaceConfig(
  config: VisualizationSurfaceConfig
): VisualizationSurfaceConfig {
  return config;
}

/**
 * Create a type-safe search surface config.
 * @param config - Full search surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSearchSurfaceConfig(
  config: SearchSurfaceConfig
): SearchSurfaceConfig {
  return config;
}

/**
 * Create a type-safe editor surface config.
 * @param config - Full editor surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createEditorSurfaceConfig(
  config: EditorSurfaceConfig
): EditorSurfaceConfig {
  return config;
}

/**
 * Create a type-safe operational surface config with `TFeed` inference.
 * @typeParam TFeed - Feed item type extending `FeedItem`.
 * @param config - Full operational surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createOperationalSurfaceConfig<TFeed extends FeedItem = FeedItem>(
  config: OperationalSurfaceConfig<TFeed>
): OperationalSurfaceConfig<TFeed> {
  return config;
}

/**
 * Create a type-safe media surface config.
 * @param config - Full media surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createMediaSurfaceConfig(
  config: MediaSurfaceConfig
): MediaSurfaceConfig {
  return config;
}

/**
 * Create a type-safe scheduler surface config.
 * @param config - Full scheduler surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSchedulerSurfaceConfig(
  config: SchedulerSurfaceConfig
): SchedulerSurfaceConfig {
  return config;
}

/**
 * Create a type-safe compare surface config.
 * @param config - Full compare surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createCompareSurfaceConfig(
  config: CompareSurfaceConfig
): CompareSurfaceConfig {
  return config;
}

/**
 * Create a type-safe auth surface config.
 * @param config - Full auth surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createAuthSurfaceConfig(
  config: AuthSurfaceConfig
): AuthSurfaceConfig {
  return config;
}

/**
 * Create a type-safe onboarding surface config.
 * @param config - Full onboarding surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createOnboardingSurfaceConfig(
  config: OnboardingSurfaceConfig
): OnboardingSurfaceConfig {
  return config;
}

/**
 * Create a type-safe empty-state surface config.
 * @param config - Full empty-state surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createEmptyStateSurfaceConfig(
  config: EmptyStateSurfaceConfig
): EmptyStateSurfaceConfig {
  return config;
}

/**
 * Create a type-safe settings surface config.
 * @param config - Full settings surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSettingsSurfaceConfig(
  config: SettingsSurfaceConfig
): SettingsSurfaceConfig {
  return config;
}

/**
 * Create a type-safe audit surface config.
 * @param config - Full audit surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createAuditSurfaceConfig(
  config: AuditSurfaceConfig
): AuditSurfaceConfig {
  return config;
}

/**
 * Create a type-safe billing surface config.
 * @param config - Full billing surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createBillingSurfaceConfig(
  config: BillingSurfaceConfig
): BillingSurfaceConfig {
  return config;
}

/**
 * Create a type-safe profile surface config.
 * @param config - Full profile surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createProfileSurfaceConfig(
  config: ProfileSurfaceConfig
): ProfileSurfaceConfig {
  return config;
}

/**
 * Create a type-safe notification surface config.
 * @param config - Full notification surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createNotificationSurfaceConfig(
  config: NotificationSurfaceConfig
): NotificationSurfaceConfig {
  return config;
}

/**
 * Create a type-safe import/export surface config.
 * @param config - Full import/export surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createImportExportSurfaceConfig(
  config: ImportExportSurfaceConfig
): ImportExportSurfaceConfig {
  return config;
}

/**
 * Create a type-safe report surface config.
 * @param config - Full report surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createReportSurfaceConfig(
  config: ReportSurfaceConfig
): ReportSurfaceConfig {
  return config;
}

/**
 * Create a type-safe team surface config.
 * @param config - Full team surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createTeamSurfaceConfig(
  config: TeamSurfaceConfig
): TeamSurfaceConfig {
  return config;
}

/**
 * Create a type-safe integration surface config.
 * @param config - Full integration surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createIntegrationSurfaceConfig(
  config: IntegrationSurfaceConfig
): IntegrationSurfaceConfig {
  return config;
}

/**
 * Create a type-safe kanban surface config.
 * @param config - Full kanban surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createKanbanSurfaceConfig(
  config: KanbanSurfaceConfig
): KanbanSurfaceConfig {
  return config;
}

/**
 * Create a type-safe activity surface config.
 * @param config - Full activity surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createActivitySurfaceConfig(
  config: ActivitySurfaceConfig
): ActivitySurfaceConfig {
  return config;
}

/**
 * Create a type-safe file browser surface config.
 * @param config - Full file browser surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createFileBrowserSurfaceConfig(
  config: FileBrowserSurfaceConfig
): FileBrowserSurfaceConfig {
  return config;
}

/**
 * Create a type-safe pricing surface config.
 * @param config - Full pricing surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createPricingSurfaceConfig(
  config: PricingSurfaceConfig
): PricingSurfaceConfig {
  return config;
}

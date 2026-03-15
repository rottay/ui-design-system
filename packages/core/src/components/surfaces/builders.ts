import type { FeedItem } from '../patterns';
import type {
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
  FormSurfaceConfig,
  HeaderSurfaceConfig,
  ImportExportSurfaceConfig,
  ListSurfaceConfig,
  MediaSurfaceConfig,
  NotificationSurfaceConfig,
  OnboardingSurfaceConfig,
  OperationalSurfaceConfig,
  ProfileSurfaceConfig,
  ReportSurfaceConfig,
  SchedulerSurfaceConfig,
  SearchSurfaceConfig,
  SettingsSurfaceConfig,
  SidebarSurfaceConfig,
  VisualizationSurfaceConfig,
  WizardSurfaceConfig,
} from './types';

/**
 * Tiny identity builders that preserve inference for app code without
 * introducing another abstraction layer on top of the surface contracts.
 */
export function createListSurfaceConfig<TView>(
  config: ListSurfaceConfig<TView>
): ListSurfaceConfig<TView> {
  return config;
}

export function createDashboardSurfaceConfig(
  config: DashboardSurfaceConfig
): DashboardSurfaceConfig {
  return config;
}

export function createChatSurfaceConfig(
  config: ChatSurfaceConfig
): ChatSurfaceConfig {
  return config;
}

export function createDetailSurfaceConfig<TView>(
  config: DetailSurfaceConfig<TView>
): DetailSurfaceConfig<TView> {
  return config;
}

export function createFormSurfaceConfig(
  config: FormSurfaceConfig
): FormSurfaceConfig {
  return config;
}

export function createWizardSurfaceConfig(
  config: WizardSurfaceConfig
): WizardSurfaceConfig {
  return config;
}

export function createHeaderSurfaceConfig(
  config: HeaderSurfaceConfig
): HeaderSurfaceConfig {
  return config;
}

export function createSidebarSurfaceConfig(
  config: SidebarSurfaceConfig
): SidebarSurfaceConfig {
  return config;
}

export function createDetailFormSurfaceConfig(
  config: DetailFormSurfaceConfig
): DetailFormSurfaceConfig {
  return config;
}

export function createVisualizationSurfaceConfig(
  config: VisualizationSurfaceConfig
): VisualizationSurfaceConfig {
  return config;
}

export function createSearchSurfaceConfig(
  config: SearchSurfaceConfig
): SearchSurfaceConfig {
  return config;
}

export function createEditorSurfaceConfig(
  config: EditorSurfaceConfig
): EditorSurfaceConfig {
  return config;
}

export function createOperationalSurfaceConfig<TFeed extends FeedItem = FeedItem>(
  config: OperationalSurfaceConfig<TFeed>
): OperationalSurfaceConfig<TFeed> {
  return config;
}

export function createMediaSurfaceConfig(
  config: MediaSurfaceConfig
): MediaSurfaceConfig {
  return config;
}

export function createSchedulerSurfaceConfig(
  config: SchedulerSurfaceConfig
): SchedulerSurfaceConfig {
  return config;
}

export function createCompareSurfaceConfig(
  config: CompareSurfaceConfig
): CompareSurfaceConfig {
  return config;
}

export function createAuthSurfaceConfig(
  config: AuthSurfaceConfig
): AuthSurfaceConfig {
  return config;
}

export function createOnboardingSurfaceConfig(
  config: OnboardingSurfaceConfig
): OnboardingSurfaceConfig {
  return config;
}

export function createEmptyStateSurfaceConfig(
  config: EmptyStateSurfaceConfig
): EmptyStateSurfaceConfig {
  return config;
}

export function createSettingsSurfaceConfig(
  config: SettingsSurfaceConfig
): SettingsSurfaceConfig {
  return config;
}

export function createAuditSurfaceConfig(
  config: AuditSurfaceConfig
): AuditSurfaceConfig {
  return config;
}

export function createBillingSurfaceConfig(
  config: BillingSurfaceConfig
): BillingSurfaceConfig {
  return config;
}

export function createProfileSurfaceConfig(
  config: ProfileSurfaceConfig
): ProfileSurfaceConfig {
  return config;
}

export function createNotificationSurfaceConfig(
  config: NotificationSurfaceConfig
): NotificationSurfaceConfig {
  return config;
}

export function createImportExportSurfaceConfig(
  config: ImportExportSurfaceConfig
): ImportExportSurfaceConfig {
  return config;
}

export function createReportSurfaceConfig(
  config: ReportSurfaceConfig
): ReportSurfaceConfig {
  return config;
}

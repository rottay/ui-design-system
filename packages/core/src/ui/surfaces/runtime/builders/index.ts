/**
 * @fileoverview Surface config builders - Rottay Design System
 * @description Tiny identity helpers that preserve type inference for app-level
 * surface configuration without forcing consumers to spell complex generics.
 *
 * @remarks
 * These builders provide a stable inference boundary and apply conservative
 * mobile-first defaults. Apps can always override them explicitly, but the
 * design system owns the baseline responsive posture.
 */

import type { FeedItem } from '../../../patterns';
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
  MarketingSurfaceConfig,
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
} from '../../foundation/contracts';

// ---------------------------------------------------------------------------
// Surface config builders
// ---------------------------------------------------------------------------
//
// Each function below injects conservative mobile-first defaults into the
// `visual` section while preserving type inference. Defaults are spread
// BEFORE the consumer's config, so explicit overrides always win.
//
// Pattern:
//   const config = createListSurfaceConfig({ ... });
//   // `config` is correctly inferred as `ListSurfaceConfig<MyView>`
//   // mobile defaults are injected unless the app overrides them
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
  return {
    ...config,
    visual: {
      compact: true,
      mobileDefaultView: 'cards',
      hideViewSwitchOnMobile: true,
      mobileFiltersLayout: 'stacked',
      filterPanelChrome: 'plain',
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe dashboard surface config.
 * @param config - Full dashboard surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createDashboardSurfaceConfig(
  config: DashboardSurfaceConfig
): DashboardSurfaceConfig {
  return {
    ...config,
    visual: {
      mobileStatsLimit: 2,
      stackSectionsOnMobile: true,
      ...config.visual,
    },
  };
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
  return {
    ...config,
    visual: {
      hideListOnMobile: true,
      stickyInputOnMobile: true,
      ...config.visual,
    },
  };
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
  return {
    ...config,
    visual: {
      collapseSidebarOnMobile: true,
      ...config.visual,
    },
  };
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
  return {
    ...config,
    visual: {
      maxWidth: '100%',
      hideAsideOnMobile: true,
      mobileActionsSticky: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe wizard surface config.
 * @param config - Full wizard surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createWizardSurfaceConfig(
  config: WizardSurfaceConfig
): WizardSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      compactStepsOnMobile: true,
      mobileActionsSticky: true,
      ...config.visual,
    },
  };
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
  return {
    ...config,
    visual: {
      compactOnMobile: true,
      hideSecondaryActionsOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe sidebar surface config.
 * @param config - Full sidebar surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSidebarSurfaceConfig(
  config: SidebarSurfaceConfig
): SidebarSurfaceConfig {
  return {
    ...config,
    visual: {
      collapsible: true,
      collapseOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe detail-form surface config.
 * @param config - Full detail-form surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createDetailFormSurfaceConfig(
  config: DetailFormSurfaceConfig
): DetailFormSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      hideAsideOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe visualization surface config.
 * @param config - Full visualization surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createVisualizationSurfaceConfig(
  config: VisualizationSurfaceConfig
): VisualizationSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      compactChartsOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe search surface config.
 * @param config - Full search surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSearchSurfaceConfig(
  config: SearchSurfaceConfig
): SearchSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      stickySearchOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe editor surface config.
 * @param config - Full editor surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createEditorSurfaceConfig(
  config: EditorSurfaceConfig
): EditorSurfaceConfig {
  return {
    ...config,
    visual: {
      hideToolbarOnMobile: false,
      compactToolbarOnMobile: true,
      ...config.visual,
    },
  };
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
  return {
    ...config,
    visual: {
      mobileStatsLimit: 2,
      mobileQueuePosition: 'bottom',
      mobileFeedPosition: 'bottom',
      stackSectionsOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe media surface config.
 * @param config - Full media surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createMediaSurfaceConfig(
  config: MediaSurfaceConfig
): MediaSurfaceConfig {
  return {
    ...config,
    visual: {
      mobileColumnsLimit: 2,
      stackOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe scheduler surface config.
 * @param config - Full scheduler surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSchedulerSurfaceConfig(
  config: SchedulerSurfaceConfig
): SchedulerSurfaceConfig {
  return {
    ...config,
    visual: {
      mobileView: 'list',
      hideTimelineOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe compare surface config.
 * @param config - Full compare surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createCompareSurfaceConfig(
  config: CompareSurfaceConfig
): CompareSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      mobileCompareLimit: 2,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe auth surface config.
 * @param config - Full auth surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createAuthSurfaceConfig(
  config: AuthSurfaceConfig
): AuthSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      compactFormOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe marketing surface config.
 * @param config - Full marketing surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createMarketingSurfaceConfig(
  config: MarketingSurfaceConfig
): MarketingSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe onboarding surface config.
 * @param config - Full onboarding surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createOnboardingSurfaceConfig(
  config: OnboardingSurfaceConfig
): OnboardingSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      hideIllustrationOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe empty-state surface config.
 * @param config - Full empty-state surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createEmptyStateSurfaceConfig(
  config: EmptyStateSurfaceConfig
): EmptyStateSurfaceConfig {
  return {
    ...config,
    visual: {
      compactOnMobile: true,
      hideIllustrationOnMobile: false,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe settings surface config.
 * @param config - Full settings surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createSettingsSurfaceConfig(
  config: SettingsSurfaceConfig
): SettingsSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      collapseSidebarOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe audit surface config.
 * @param config - Full audit surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createAuditSurfaceConfig(
  config: AuditSurfaceConfig
): AuditSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      compactEntriesOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe billing surface config.
 * @param config - Full billing surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createBillingSurfaceConfig(
  config: BillingSurfaceConfig
): BillingSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      collapseSidebarOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe profile surface config.
 * @param config - Full profile surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createProfileSurfaceConfig(
  config: ProfileSurfaceConfig
): ProfileSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      collapseSidebarOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe notification surface config.
 * @param config - Full notification surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createNotificationSurfaceConfig(
  config: NotificationSurfaceConfig
): NotificationSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      compactItemsOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe import/export surface config.
 * @param config - Full import/export surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createImportExportSurfaceConfig(
  config: ImportExportSurfaceConfig
): ImportExportSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe report surface config.
 * @param config - Full report surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createReportSurfaceConfig(
  config: ReportSurfaceConfig
): ReportSurfaceConfig {
  return {
    ...config,
    visual: {
      stackSectionsOnMobile: true,
      compactChartsOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe team surface config.
 * @param config - Full team surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createTeamSurfaceConfig(
  config: TeamSurfaceConfig
): TeamSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      mobileDefaultView: 'cards',
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe integration surface config.
 * @param config - Full integration surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createIntegrationSurfaceConfig(
  config: IntegrationSurfaceConfig
): IntegrationSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      compactCardsOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe kanban surface config.
 * @param config - Full kanban surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createKanbanSurfaceConfig(
  config: KanbanSurfaceConfig
): KanbanSurfaceConfig {
  return {
    ...config,
    visual: {
      mobileColumnsLimit: 1,
      stackColumnsOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe activity surface config.
 * @param config - Full activity surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createActivitySurfaceConfig(
  config: ActivitySurfaceConfig
): ActivitySurfaceConfig {
  return {
    ...config,
    visual: {
      compactEntriesOnMobile: true,
      stackOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe file browser surface config.
 * @param config - Full file browser surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createFileBrowserSurfaceConfig(
  config: FileBrowserSurfaceConfig
): FileBrowserSurfaceConfig {
  return {
    ...config,
    visual: {
      mobileView: 'list',
      stackOnMobile: true,
      ...config.visual,
    },
  };
}

/**
 * Create a type-safe pricing surface config.
 * @param config - Full pricing surface configuration.
 * @returns The same config object, strongly typed.
 */
export function createPricingSurfaceConfig(
  config: PricingSurfaceConfig
): PricingSurfaceConfig {
  return {
    ...config,
    visual: {
      stackOnMobile: true,
      compactColumnsOnMobile: true,
      ...config.visual,
    },
  };
}

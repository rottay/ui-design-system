/**
 * @fileoverview Page-chrome contracts shared by structure shells and surfaces.
 * @module Structures/Foundation/Chrome/Contracts
 * @category StructureFoundation
 * @package @rottay/design-system
 *
 * @remarks
 * WHY THESE DECLARATIONS LIVE AT THE STRUCTURE TIER.
 *
 * `PageShellSurface`, `HeaderSurface` and `SidebarSurface` are page chrome, and
 * `CLAUDE.md` puts public page-chrome and layout-shell components in
 * `structure/shell/*`. They used to sit physically under the surfaces tier
 * (in the since-retired `ui/surfaces/composition/layout`) while their configs
 * were declared in `ui/surfaces/foundation/contracts`, so relabelling their
 * family layer alone
 * would have left a `structure` family whose only source owner was inside the
 * surface tier.
 *
 * Moving the components without moving this vocabulary would have inverted the
 * canonical `primitives -> patterns -> structures -> surfaces` order: the
 * structures tier had ZERO imports from surfaces before this change, and that
 * has to stay true. So the cluster the shells actually need moved down with
 * them, and it is declared here exactly once.
 *
 * Everything here is genuinely shared vocabulary rather than surface-specific
 * shape -- a breadcrumb, an action descriptor, a tabbed view, an app-resolved
 * access decision, the chrome block itself, and the two shell configs. The
 * surface tier still composes all of it (`ListSurfaceConfig.presentation.chrome`
 * is a `SurfacePageChrome`), and now consumes it from below, which is the
 * allowed direction. `ui/surfaces/foundation/contracts` re-exports these names
 * so `@rottay/design-system/contracts/surfaces` keeps the exact API it had.
 *
 * The `Surface*` prefix is retained deliberately. These are public exported
 * names with app consumers; renaming them would be a breaking API change
 * dressed up as a file move.
 */

import type { ReactNode } from 'react';
import type { TabsProps } from '../../../../primitives/navigation/tabs';

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
  /** Hide the shell header row entirely when the page composes its own top chrome. */
  hideHeader?: boolean;
  /** Secondary text or node shown below the title. */
  subtitle?: ReactNode;
  /** Optional register-line metadata (counts, timestamps, owners) rendered below the subtitle. */
  metadata?: ReactNode;
  /** Optional rich content rendered below the title/subtitle block inside the page header. */
  headerContent?: ReactNode;
  /** Breadcrumb trail for hierarchical navigation. */
  breadcrumbs?: SurfaceBreadcrumb[];
  /** Optional badge rendered inline with the title (e.g., status pill, count). */
  badge?: ReactNode;
  /** When true, the shell header sticks to the top of the scrollport with governed stuck elevation. */
  sticky?: boolean;
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
 * Apps own the actual handlers and access decisions; surfaces own placement,
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
  /** Stable identifier used for presentation access and test selectors. */
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

/** Capability anatomy resolved by the owning app/server before it reaches the DS. */
export type SurfaceCapabilityKind = 'route' | 'field' | 'column' | 'action' | 'tab';

/** A single app-resolved presentation decision for a registered surface capability. */
export interface SurfaceResolvedCapability {
  kind: SurfaceCapabilityKind;
  id: string;
  visible: boolean;
  disabled?: boolean;
}

/** Stable capability anatomy declared by a surface before data is available. */
export interface SurfaceCapabilityRegistration {
  kind: SurfaceCapabilityKind;
  id: string;
  label?: ReactNode;
  disabled?: boolean;
}

/**
 * Presentation-only access input resolved by the owning app/server.
 *
 * `all` is an upstream-resolved, unfiltered presentation mode: every registered
 * capability stays visible, no DS policy callback runs, and no authorization is granted.
 */
export type AppResolvedSurfaceAccess =
  | { mode: 'all' }
  | {
      mode: 'resolved';
      capabilities: ReadonlyArray<SurfaceResolvedCapability>;
    };

/** The only access input accepted by DS surfaces and presentation helpers. */
export type SurfaceAccessInput = AppResolvedSurfaceAccess;

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
  /** Stable capability ID used by final app-resolved presentation access. Defaults to `key`. */
  capabilityId?: string;
  /** @deprecated Use `capabilityId`; retained as a type-only migration alias. */
  permissionId?: string;
}

/**
 * The two view modes a ListSurface can render.
 * Table is the default for data-dense operator screens; cards suit
 * media-heavy or consumer-facing lists.
 */
export type ListSurfaceView = 'table' | 'cards';

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

  /** Instance visual selections, admitted only where the tenant is undecided. */
  profileOverrides?: SurfaceVisualOverrides;
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
  /** Upstream-resolved presentation access. `all` renders every registered capability; it grants no authorization. */
  access?: AppResolvedSurfaceAccess;
}

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

  /** Instance visual selections, admitted only where the tenant is undecided. */
  profileOverrides?: SurfaceVisualOverrides;
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
  /** Upstream-resolved presentation access. `all` renders every registered capability; it grants no authorization. */
  access?: AppResolvedSurfaceAccess;
}

/**
 * Instance-level visual selections, SUBORDINATE to the resolved tenant.
 *
 * A field declared here is applied only when the catalog models its value AND
 * the tenant left the personality channel it speaks for undecided
 * (`SURFACE_VISUAL_OVERRIDE_CATALOG` /
 * `SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS`). It can narrow a DS or
 * product-profile default; it can never contradict a tenant decision, and an
 * unmodelled value is refused rather than passed through.
 */
export interface SurfaceVisualOverrides {
  density?: 'compact' | 'comfortable' | 'spacious';
  cardVariant?: 'outlined' | 'elevated' | 'filled' | 'ghost';
  sectionSpacing?: 'sm' | 'md' | 'lg';
  headerWeight?: 'lighter' | 'normal' | 'heavier';
  animateEntrance?: boolean;
  entranceStyle?: 'none' | 'fade' | 'slideUp' | 'spring' | 'bounce';
  entranceDuration?: number;
  staggerDelay?: number;
  badgeShape?: 'rounded' | 'pill' | 'square';
  labelStyle?: 'uppercase' | 'sentence' | 'capitalize';
  countUpEnabled?: boolean;
  pulseSpeed?: 'none' | 'slow' | 'normal' | 'fast';
}

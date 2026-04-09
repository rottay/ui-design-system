/**
 * @fileoverview Type definitions for the DetailPanel pattern component.
 * Defines {@link DetailTab} (tabbed content with badge/icon support),
 * {@link DetailAction} (header action buttons), and the generic
 * {@link DetailPanelProps} controlling sidebar layout, breadcrumbs,
 * status badges, and tab navigation.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Represents a single tab within the detail panel.
 *
 * Tabs allow content to be organized into logical sections (e.g., Overview,
 * Activity, Settings). Each tab can display an optional badge count and icon.
 */
export interface DetailTab {
  /** Unique key used to identify this tab for controlled selection. */
  key: string;

  /** Human-readable label displayed on the tab trigger. */
  label: string;

  /** Optional icon rendered before the tab label. */
  icon?: ReactNode;

  /** The renderable content displayed when this tab is active. */
  content: ReactNode;

  /**
   * Badge displayed on the tab trigger.
   * Commonly used to show counts (e.g., unread messages) or status labels.
   */
  badge?: number | string;

  /** Whether this tab is disabled and cannot be selected. */
  disabled?: boolean;
}

/**
 * Represents an action button displayed in the detail panel header.
 *
 * Actions provide quick access to operations on the displayed entity
 * (e.g., Edit, Delete, Archive).
 */
export interface DetailAction {
  /** Unique key used to identify this action. */
  key: string;

  /** Human-readable label displayed on or alongside the button. */
  label: string;

  /** Optional icon rendered inside the action button. */
  icon?: ReactNode;

  /**
   * Visual variant of the action button.
   * - `'default'`: Standard secondary appearance.
   * - `'primary'`: Emphasized primary action.
   * - `'danger'`: Destructive action (e.g., delete).
   * - `'ghost'`: Minimal, borderless appearance.
   */
  variant?: 'default' | 'primary' | 'danger' | 'ghost';

  /** Click handler invoked when the action button is pressed. */
  onClick: () => void;

  /** Whether the action button is disabled. */
  disabled?: boolean;

  /** Whether to show a loading spinner on the action button. */
  loading?: boolean;
}

/**
 * Props for the DetailPanel pattern component.
 *
 * A generic detail view for displaying a single entity with a header
 * (title, subtitle, avatar, status), tabbed content area, action buttons,
 * and an optional sidebar. The generic `T` represents the entity data type.
 *
 * @typeParam T - The shape of the data object being displayed.
 *
 * @example
 * ```tsx
 * <DetailPanel<User>
 *   data={user}
 *   title={user.name}
 *   subtitle={user.email}
 *   avatar={<Avatar src={user.avatar} />}
 *   status={{ label: 'Active', color: 'green' }}
 *   tabs={[
 *     { key: 'overview', label: 'Overview', content: <UserOverview /> },
 *     { key: 'activity', label: 'Activity', badge: 5, content: <ActivityFeed /> },
 *   ]}
 *   activeTab="overview"
 *   onTabChange={(key) => setActiveTab(key)}
 *   actions={[
 *     { key: 'edit', label: 'Edit', variant: 'primary', onClick: handleEdit },
 *   ]}
 *   breadcrumbs={[
 *     { label: 'Users', onClick: () => navigate('/users') },
 *     { label: user.name },
 *   ]}
 *   sidebar={<UserMetadata user={user} />}
 *   sidebarPosition="right"
 *   onBack={() => navigate(-1)}
 * />
 * ```
 */
export interface DetailPanelProps<T> extends PatternBaseProps {
  /** The data object representing the entity being displayed. */
  data: T;

  /**
   * Panel title, typically the entity name.
   * Accepts ReactNode for rich formatting (e.g., inline badges).
   */
  title: ReactNode;

  /** Optional subtitle displayed below the title (e.g., email, role). */
  subtitle?: ReactNode;

  /** Avatar or image element representing the entity. */
  avatar?: ReactNode;

  /**
   * Status badge displayed alongside the title.
   * The `color` is a design-system token or CSS color string.
   */
  status?: { label: string; color?: string };

  /** Tab definitions for the content area. */
  tabs?: DetailTab[];

  /** Key of the currently active tab (controlled mode). */
  activeTab?: string;

  /** Callback fired when the active tab changes. */
  onTabChange?: (key: string) => void;

  /** Action buttons rendered in the panel header. */
  actions?: DetailAction[];

  /** Sidebar content (e.g., metadata, quick info, related links). */
  sidebar?: ReactNode;

  /**
   * Which side the sidebar is rendered on.
   * @default 'right'
   */
  sidebarPosition?: 'left' | 'right';

  /**
   * Width of the sidebar. Accepts a number (pixels) or CSS string
   * (e.g., `'300px'`, `'25%'`).
   */
  sidebarWidth?: number | string;

  /**
   * Back button handler. When provided, a back arrow is rendered
   * in the header for parent-level navigation.
   */
  onBack?: () => void;

  /** Extra content rendered in the header area after the title/actions. */
  headerExtra?: ReactNode;

  /** Content rendered in the fixed footer area at the bottom of the panel. */
  footer?: ReactNode;

  /**
   * Breadcrumb navigation items displayed above the title.
   * Each item may have a click handler or href for navigation.
   */
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
}

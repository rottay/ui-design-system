/**
 * DetailPanel<T> - Type Definitions
 *
 * Master-detail panel with tabs, sidebar info, and action buttons.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface DetailTab {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface DetailAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface DetailPanelProps<T> extends PatternBaseProps {
  /** The data object being displayed */
  data: T;
  /** Panel title */
  title: ReactNode;
  /** Panel subtitle */
  subtitle?: ReactNode;
  /** Avatar/image for the entity */
  avatar?: ReactNode;
  /** Status badge */
  status?: { label: string; color?: string };
  /** Tab definitions */
  tabs?: DetailTab[];
  /** Active tab key */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (key: string) => void;
  /** Action buttons in header */
  actions?: DetailAction[];
  /** Sidebar content (metadata, quick info) */
  sidebar?: ReactNode;
  /** Sidebar position */
  sidebarPosition?: 'left' | 'right';
  /** Sidebar width */
  sidebarWidth?: number | string;
  /** Back button handler */
  onBack?: () => void;
  /** Header extra content */
  headerExtra?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Breadcrumb items */
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
}

/**
 * @fileoverview Type definitions for the PageShell pattern. Defines props
 * for the standard page layout wrapper with title, breadcrumbs, action
 * buttons, tab navigation, back button, and max-width constraint.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * Props for the PageShell pattern component.
 * Provides the standard page layout wrapper used across all application pages.
 * Includes a header area with title, optional breadcrumbs, action buttons,
 * tab navigation, a back button, and a max-width content constraint.
 *
 * @example
 * ```tsx
 * <PageShell
 *   title="Team Members"
 *   subtitle="Manage your organization's team"
 *   breadcrumbs={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Settings', href: '/settings' },
 *     { label: 'Team' },
 *   ]}
 *   actions={<Button onClick={openInvite}>Invite Member</Button>}
 *   tabs={[
 *     { key: 'active', label: 'Active', content: <ActiveMembers /> },
 *     { key: 'pending', label: 'Pending', content: <PendingInvites /> },
 *   ]}
 *   activeTab="active"
 *   onTabChange={setActiveTab}
 *   back={{ label: 'Settings', onClick: () => router.back() }}
 *   maxWidth={1200}
 * >
 *   {children}
 * </PageShell>
 * ```
 */
export interface PageShellProps extends PatternBaseProps {
  /** Page title displayed as the primary heading */
  title: string;
  /** Optional localized context label rendered above the primary heading. */
  eyebrow?: ReactNode;
  /** Optional semantic DS icon rendered in the page-header identity tile. */
  icon?: ReactNode;
  /** Hide the shell header row entirely when a surface renders its own top chrome. */
  hideHeader?: boolean;
  /** Optional subtitle or description rendered below the title */
  subtitle?: ReactNode;
  /**
   * Optional register-line metadata (counts, timestamps, owners, sync state)
   * rendered below the subtitle. Kept visually subordinate to the subtitle:
   * caption role, muted ink, tabular numerals, hairline-separated.
   */
  metadata?: ReactNode;
  /** Optional rich content rendered below the title block inside the header. */
  headerContent?: ReactNode;
  /** Breadcrumb trail items; last item is treated as current (no link) */
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
  /** Action buttons or controls rendered in the top-right header area */
  actions?: ReactNode;
  /** Tab definitions for sub-navigation within the page */
  tabs?: { key: string; label: string; content: ReactNode }[];
  /** Key of the currently active tab */
  activeTab?: string;
  /** Called when the user switches tabs, receiving the new tab key */
  onTabChange?: (key: string) => void;
  /** Main page content rendered below the header/tabs area */
  children: ReactNode;
  /** Back navigation button configuration */
  back?: {
    /** Optional visible label next to the back icon. */
    label?: string;
    /** Localized accessible label. Required by consumers when `label` is omitted. */
    ariaLabel?: string;
    onClick: () => void;
  };
  /** Badge element rendered next to the title (e.g. status indicator) */
  badge?: ReactNode;
  /**
   * When true, the page header sticks to the top of the scrollport. While
   * stuck, the panel trades its resting elevation for a governed hairline +
   * deeper shadow so the hierarchy survives content scrolling beneath it.
   * The sticky offset reads the `--ds-safe-area-top` channel (env fallback),
   * so notched devices never tuck the header under the sensor area.
   */
  sticky?: boolean;
  /** Maximum width constraint for the page content area */
  maxWidth?: number | string;
}

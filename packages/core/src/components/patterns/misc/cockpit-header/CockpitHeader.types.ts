/**
 * @fileoverview Type definitions for the CockpitHeader pattern component.
 *
 * CockpitHeader renders a rich header for detail/workbench pages with
 * back navigation, breadcrumbs, title + status cluster, action buttons,
 * and optional sticky compact mode on scroll.
 *
 * @module Patterns/CockpitHeader/Types
 * @category Patterns
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

/**
 * A breadcrumb segment in the header trail.
 */
export interface CockpitBreadcrumb {
  /** Display label for the breadcrumb. */
  label: string;
  /** Optional navigation URL. When omitted, renders as plain text. */
  href?: string;
}

/**
 * A status badge displayed next to the title.
 */
export interface CockpitStatus {
  /** Status label text. */
  label: string;
  /** Visual variant controlling the badge color. */
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
}

/**
 * Props for the CockpitHeader pattern component.
 *
 * Renders a full header card with breadcrumb trail, title row with
 * status badges, action buttons, and optional sticky compact mode.
 *
 * @example
 * ```tsx
 * <PatternCockpitHeader
 *   title="Event #1234"
 *   subtitle="Summer Music Festival"
 *   breadcrumbs={[
 *     { label: 'Events', href: '/events' },
 *     { label: 'Festivals', href: '/events?type=festival' },
 *     { label: 'Event #1234' },
 *   ]}
 *   status={[
 *     { label: 'Active', variant: 'success' },
 *     { label: 'VIP', variant: 'info' },
 *   ]}
 *   actions={<Button>Edit</Button>}
 *   sticky
 *   onBack={() => router.back()}
 * />
 * ```
 */
export interface CockpitHeaderProps extends PatternBaseProps {
  /** Page title. */
  title: string;
  /** Optional subtitle displayed below the title. */
  subtitle?: string;
  /** Breadcrumb trail rendered above the title. */
  breadcrumbs?: CockpitBreadcrumb[];
  /** Status badges displayed next to the title. */
  status?: CockpitStatus[];
  /** Action buttons or controls rendered on the right side. */
  actions?: ReactNode;
  /** When true, the header becomes sticky and compact on scroll. */
  sticky?: boolean;
  /** Callback fired when the back button is clicked. */
  onBack?: () => void;
}

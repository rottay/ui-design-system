/**
 * @fileoverview DetailHeader contracts — props, action/tab shapes and the
 * archetype vocabulary for the detail-page header structure.
 *
 * @module Structures/Headers/DetailHeader/Contracts
 * @category Structure
 * @package @rottay/design-system
 */

import type { ComponentType, ReactNode } from 'react';

import type { SharedHeaderActionKind } from '@/ui/patterns/foundation/header-actions';

/**
 * Icon component accepted by the header's action rail, metadata strip and
 * tab strip. Consumers pass a semantic-facade icon component; the family
 * never selects a glyph itself.
 */
export type DetailHeaderIcon = ComponentType<any>;

/**
 * Editorial posture of the header.
 *
 * The archetype is caller anatomy, not tenant voice: it selects which type
 * scale and which hero motif the page speaks with, while the tenant's own
 * channels still resolve inside every archetype.
 */
export type DetailHeaderArchetype = 'editorial' | 'control' | 'technical' | 'governance';

/** A single entry in the header's action rail. */
export interface DetailHeaderAction {
  label: string;
  kind?: SharedHeaderActionKind;
  icon?: DetailHeaderIcon;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  tooltip?: string;
}

/** A single entry in the header's tab strip. */
export interface DetailHeaderTab {
  id: string;
  label: string;
  count?: number;
  icon?: DetailHeaderIcon;
}

/** A single label/value pair in the header's metadata region. */
export interface DetailHeaderMetadataItem {
  label: string;
  value: string;
  icon?: DetailHeaderIcon;
  /** Renders the value as machine data (monospace + tabular figures). */
  mono?: boolean;
}

/** Status pill rendered beside the hero title. */
export interface DetailHeaderStatus {
  label: string;
  variant: 'primary' | 'success' | 'error' | 'warning' | 'secondary';
}

export interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string | ReactNode;
  status?: DetailHeaderStatus;
  backHref: string;
  backLabel?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: DetailHeaderAction[];
  tabs?: DetailHeaderTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  metadata?: DetailHeaderMetadataItem[];
  eyebrow?: string;
  archetype?: DetailHeaderArchetype;
  contextRail?: ReactNode;
  children?: ReactNode;
  /**
   * Extra class names merged onto the header root. The engine wrappers use
   * this channel to stamp their own scope class; consumers may add their own.
   */
  className?: string;
}

/** Default values for DetailHeader props. */
export const DETAIL_HEADER_DEFAULTS: Partial<DetailHeaderProps> = {
  archetype: 'control',
};

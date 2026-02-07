/**
 * FooterSection - Core Interface
 * Website footer with link columns, social, newsletter, copyright
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../types';

export type FooterSectionPreset = 'multi-column' | 'simple' | 'centered';

export interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
}

export interface SocialLink {
  key: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface FooterSectionProps extends EngineAwareProps, BaseComponentProps {
  /** Preset to use */
  preset?: FooterSectionPreset;
  /** Link columns */
  columns?: FooterColumn[];
  /** Social media links */
  social?: SocialLink[];
  /** Copyright text */
  copyright?: string;
  /** Newsletter signup */
  newsletter?: {
    placeholder: string;
    onSubscribe: (email: string) => void;
  };
  /** Logo or brand element */
  logo?: ReactNode;
}

export const FOOTER_SECTION_DEFAULTS: Partial<FooterSectionProps> = {
  preset: 'multi-column',
  copyright: `© ${new Date().getFullYear()} All rights reserved.`,
};

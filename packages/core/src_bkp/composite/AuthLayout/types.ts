import type { CSSProperties, ReactNode } from 'react';

export type AuthBackgroundVariant = 'solid' | 'gradient' | 'image' | 'none';

export type AuthLayoutPosition = 'left' | 'center' | 'right';

export interface AuthLayoutProps {
  /** Child elements (your form) */
  children: ReactNode;

  /** Title text */
  title?: string;

  /** Subtitle text */
  subtitle?: string;

  /** Logo image source */
  logoSrc?: string;

  /** Logo alt text */
  logoAlt?: string;

  /** Background variant */
  backgroundVariant?: AuthBackgroundVariant;

  /** Background image URL (when variant is 'image') */
  backgroundImage?: string;

  /** Background gradient colors (when variant is 'gradient') */
  gradientColors?: [string, string];

  /** Background solid color (when variant is 'solid') */
  backgroundColor?: string;

  /** Form container position */
  position?: AuthLayoutPosition;

  /** Maximum width of form container */
  maxWidth?: number | string;

  /** Footer content */
  footer?: ReactNode;

  /** Show back to home link */
  showBackLink?: boolean;

  /** Back link text */
  backLinkText?: string;

  /** Back link URL */
  backLinkUrl?: string;

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * AuthLayout - Core Interface
 * Authentication layout component
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type AuthLayoutPreset = 'minimal' | 'standard' | 'branded' | 'social' | 'enterprise';

export interface AuthLayoutProps extends EngineAwareProps {
  /** Preset to use */
  preset?: AuthLayoutPreset;
  /** Page title */
  title?: ReactNode;
  /** Subtitle or description */
  subtitle?: ReactNode;
  /** Form content */
  children: ReactNode;
  /** Logo element or URL */
  logo?: ReactNode | string;
  /** Background image URL */
  backgroundImage?: string;
  /** Show remember me checkbox */
  showRememberMe?: boolean;
  /** Show forgot password link */
  showForgotPassword?: boolean;
  /** Forgot password click handler */
  onForgotPassword?: () => void;
  /** OAuth providers */
  socialProviders?: Array<{
    name: string;
    icon: ReactNode;
    onClick: () => void;
  }>;
  /** Show terms acceptance checkbox */
  showTerms?: boolean;
  /** Terms text/element */
  termsContent?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Index signature for Record compatibility */
  [key: string]: unknown;
}

export const AUTH_LAYOUT_DEFAULTS: Partial<AuthLayoutProps> = {
  preset: 'standard',
  title: 'Sign In',
  showRememberMe: true,
  showForgotPassword: true,
};

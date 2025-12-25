'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { ThemeProvider } from './ThemeProvider';
import { EngineProvider } from './EngineProvider';
import type { Engine } from '../types/engine';
import type { TemplateName } from '../themes/types';
import { DEFAULT_ENGINE } from '../types/engine';

// ============================================
// BRANDING TYPES
// ============================================

export interface BrandingConfig {
  logo?: string;
  logoMark?: string;
  favicon?: string;
  companyName?: string;
}

// ============================================
// DEFAULTS TYPES
// ============================================

export type LoginFormVariant = 'minimal' | 'standard' | 'enterprise';
export type RegisterFormVariant = 'minimal' | 'standard' | 'enterprise';
export type DashboardVariant = 'simple' | 'analytics' | 'admin';
export type UserProfileVariant = 'compact' | 'detailed' | 'public';

export interface DefaultsConfig {
  LoginForm?: LoginFormVariant;
  RegisterForm?: RegisterFormVariant;
  Dashboard?: DashboardVariant;
  UserProfile?: UserProfileVariant;
}

// ============================================
// DS CONFIG
// ============================================

export interface DSConfig {
  tenant?: string;
  engine: Engine;
  template: TemplateName;
  defaults: DefaultsConfig;
  branding: BrandingConfig;
}

// ============================================
// CONTEXT
// ============================================

interface DSExtrasContextValue {
  tenant?: string;
  defaults: DefaultsConfig;
  branding: BrandingConfig;
}

const DSExtrasContext = createContext<DSExtrasContextValue | null>(null);

/**
 * Hook to access design system extras (defaults, branding, tenant).
 * For internal use - prefer useBranding() and useDefaults() for public API.
 */
export function useDSExtras(): DSExtrasContextValue {
  const context = useContext(DSExtrasContext);
  if (!context) {
    throw new Error('useDSExtras must be used within a UIProvider');
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

export interface UIProviderProps {
  /** Tenant identifier for multi-tenant apps */
  tenant?: string;
  /** Rendering engine to use */
  engine?: Engine;
  /** Theme template to use */
  template?: TemplateName;
  /** Default variants for custom components */
  defaults?: DefaultsConfig;
  /** Branding configuration */
  branding?: BrandingConfig;
  /** Child components */
  children: ReactNode;
}

/** @deprecated Use UIProviderProps instead */
export type DesignSystemProviderProps = UIProviderProps;

const DEFAULT_DEFAULTS: DefaultsConfig = {};
const DEFAULT_BRANDING: BrandingConfig = {};

/**
 * UIProvider
 *
 * Unified provider that manages:
 * - Engine selection (titan, hermes, apollo, athena)
 * - Theme/template (visual styling)
 * - Component defaults (variants)
 * - Branding (logos, company name)
 *
 * This is the recommended way to set up the design system.
 * For advanced use cases, you can use ThemeProvider and EngineProvider separately.
 *
 * @example
 * ```tsx
 * import { UIProvider } from '@es-rottay/designsystem-core';
 *
 * function App() {
 *   return (
 *     <UIProvider
 *       tenant="acme"
 *       engine="titan"
 *       template="stripe"
 *       branding={{ companyName: 'Acme Corp', logo: '/logo.png' }}
 *       defaults={{ LoginForm: 'enterprise' }}
 *     >
 *       <YourApp />
 *     </UIProvider>
 *   );
 * }
 * ```
 */
export function UIProvider({
  tenant,
  engine = DEFAULT_ENGINE,
  template = 'base',
  defaults = DEFAULT_DEFAULTS,
  branding = DEFAULT_BRANDING,
  children,
}: UIProviderProps) {
  const extrasValue = useMemo<DSExtrasContextValue>(
    () => ({
      tenant,
      defaults,
      branding,
    }),
    [tenant, defaults, branding]
  );

  return (
    <DSExtrasContext.Provider value={extrasValue}>
      <EngineProvider engine={engine}>
        <ThemeProvider defaultTemplate={template}>
          {children}
        </ThemeProvider>
      </EngineProvider>
    </DSExtrasContext.Provider>
  );
}

UIProvider.displayName = 'UIProvider';

/** @deprecated Use UIProvider instead */
export const DesignSystemProvider = UIProvider;

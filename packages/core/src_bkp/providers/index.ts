// Main provider (recommended for most use cases)
export { UIProvider, DesignSystemProvider } from './DesignSystemProvider';
export type { UIProviderProps, DesignSystemProviderProps } from './DesignSystemProvider';

// Separated providers (for advanced use cases)
export { ThemeProvider, ThemeContext } from './ThemeProvider';
export type { ThemeProviderProps, ThemeContextType } from './ThemeProvider';

export { EngineProvider, useEngineContext } from './EngineProvider';
export type { EngineProviderProps } from './EngineProvider';

// Internal hooks for library extension
export { useDSExtras } from './DesignSystemProvider';

// Types
export type {
  BrandingConfig,
  DefaultsConfig,
  DSConfig,
  LoginFormVariant,
  RegisterFormVariant,
  DashboardVariant,
  UserProfileVariant,
} from './DesignSystemProvider';

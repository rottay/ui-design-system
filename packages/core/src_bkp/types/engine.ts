/**
 * Engine Types
 *
 * Multi-engine architecture for flexible UI library switching.
 * Greek names mask the underlying libraries from clients.
 */

// ============================================
// ENGINE TYPES
// ============================================

/**
 * Available rendering engines.
 * Each engine maps to a hidden UI library.
 * Los nombres griegos enmascaran la libreria real al cliente.
 */
export type Engine = 'titan' | 'hermes' | 'apollo' | 'athena';

/**
 * Engine to library mapping (internal reference only).
 * This is NOT exposed to clients in documentation.
 *
 * - titan: Enterprise-grade, feature-complete (Ant Design)
 * - hermes: Lightweight, performance-focused (DaisyUI + Tailwind)
 * - apollo: Modern, zero-dependency (Native HTML + Tailwind)
 * - athena: Extensible, bring-your-own-library (Custom/Pluggable)
 */
export const ENGINE_LIBRARY_MAP: Record<Engine, string> = {
  titan: 'antd',
  hermes: 'daisyui',
  apollo: 'native',
  athena: 'custom',
} as const;

/**
 * Engine features for documentation and selection UI.
 */
export interface EngineFeatures {
  name: string;
  description: string;
  library: string;
  bundleSize: string;
  components: number | string;
  themes: number | string;
  features: string[];
  recommended: string[];
}

export const ENGINE_FEATURES: Record<Engine, EngineFeatures> = {
  titan: {
    name: 'Titan',
    description: 'Enterprise-grade, feature-complete',
    library: 'Ant Design',
    bundleSize: '~150kb',
    components: 63,
    themes: 8,
    features: ['forms', 'tables', 'charts', 'i18n', 'rtl', 'accessibility'],
    recommended: ['enterprise', 'admin', 'dashboard'],
  },
  hermes: {
    name: 'Hermes',
    description: 'Lightweight, performance-focused',
    library: 'DaisyUI + Tailwind',
    bundleSize: '~30kb',
    components: 25,
    themes: 30,
    features: ['responsive', 'dark-mode', 'customizable'],
    recommended: ['landing', 'marketing', 'simple-apps'],
  },
  apollo: {
    name: 'Apollo',
    description: 'Modern, zero-dependency',
    library: 'Native HTML + Tailwind',
    bundleSize: '~15kb',
    components: 20,
    themes: 'unlimited',
    features: ['minimal', 'fast', 'accessible'],
    recommended: ['performance-critical', 'simple-ui'],
  },
  athena: {
    name: 'Athena',
    description: 'Extensible, bring-your-own-library',
    library: 'Custom/Pluggable',
    bundleSize: 'varies',
    components: 'varies',
    themes: 'varies',
    features: ['extensible', 'custom'],
    recommended: ['custom-requirements', 'migration'],
  },
};

// ============================================
// ENGINE DEFAULTS
// ============================================

export const DEFAULT_ENGINE: Engine = 'titan';

/**
 * Available engines in priority order.
 */
export const ENGINES = ['titan', 'hermes', 'apollo', 'athena'] as const;

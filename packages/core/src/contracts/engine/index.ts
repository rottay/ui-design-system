/**
 * @fileoverview Engine contracts - Rottay Design System
 * @description Type definitions for the multi-engine rendering layer: engine names,
 * metadata, capabilities, context, provider props, and engine-aware component interfaces.
 *
 * @remarks
 * These contracts describe engine selection and metadata only. The actual
 * component implementations live under `src/engines/` and individual
 * component folders. Four engines are supported:
 * - **classic**: Ant Design (enterprise, structured, corporate)
 * - **modern**: DaisyUI/Tailwind (contemporary, rounded, glassmorphism)
 * - **rustic**: Vanilla HTML/CSS (minimal, spacious, understated)
 * - **custom**: Pluggable tenant-specific implementations
 *
 * @module Contracts/Engine
 * @category Types
 * @package @rottay/design-system
 */

import type { ComponentType, CSSProperties } from 'react';
import type { ComponentExtensions } from '../extensions';

/**
 * Available engine names in the Rottay Design System.
 * Each engine maps to a distinct UI library and visual personality.
 */
export type EngineName = 'classic' | 'modern' | 'rustic' | 'custom';

/**
 * Props that allow a component to select its rendering engine.
 * Most components extend this interface to support per-component engine override.
 */
export interface EngineAwareProps {
  /**
   * UI engine to use for this component.
   * Falls back to the nearest EngineProvider context when not specified.
   * @default 'classic'
   */
  engine?: EngineName;
  /**
   * Additional CSS class name(s) for the component.
   */
  className?: string;
  /**
   * Inline CSS styles for the component.
   */
  style?: CSSProperties;
  /**
   * Extension points for customizing component rendering.
   * Allows apps to inject columns, actions, filters, slots, and more
   * without modifying the design system presets.
   */
  extensions?: ComponentExtensions;
}

/** Per-component engine configuration linking an engine to its implementation. */
export interface EngineComponentConfig<P = unknown> {
  /** Engine identifier */
  name: EngineName;
  /** React component implementation for this engine */
  component: ComponentType<P>;
  /** Whether this engine's dependency is installed and available */
  available: boolean;
}

/** Engine metadata stored in the engine registry. */
export interface EngineConfig {
  /** Engine identifier */
  name: EngineName;
  /** Human-readable display name */
  displayName: string;
  /** Underlying UI library (e.g. 'antd', 'daisyui', 'html') */
  library: string;
  /** Stability status */
  status: 'stable' | 'beta' | 'experimental' | 'deprecated';
}

/** Capability flags describing what an engine supports. */
export interface EngineCapabilities {
  /** Supports runtime theme switching */
  theming: boolean;
  /** Supports animations and transitions */
  animations: boolean;
  /** Supports advanced accessibility features */
  accessibility: boolean;
  /** Optimized bundle size (no heavy dependencies) */
  lightweight: boolean;
  /** List of component names this engine implements */
  supportedComponents: string[];
}

/** Full metadata for an engine including capabilities and version. */
export interface EngineMetadata {
  /** Engine identifier */
  name: EngineName;
  /** Human-readable display name */
  displayName: string;
  /** Short description of the engine */
  description: string;
  /** Engine version */
  version: string;
  /** Capability flags */
  capabilities: EngineCapabilities;
}

/** Value exposed by the EngineProvider context. */
export interface EngineContextValue {
  /** Currently active engine */
  engine: EngineName;
  /** Function to switch the active engine at runtime */
  setEngine: (engine: EngineName) => void;
  /** Metadata for the active engine */
  metadata?: EngineMetadata;
}

/** Props for the EngineProvider component. */
export interface EngineProviderProps {
  /** Default engine to use */
  defaultEngine?: EngineName;
  /** Child components */
  children: React.ReactNode;
  /** Whether runtime engine switching is allowed */
  allowEngineSwitch?: boolean;
}

/** Map of all available engines to their metadata. */
export type EngineRegistry = Record<EngineName, EngineMetadata>;

/** Fallback configuration when a primary engine is unavailable. */
export interface EngineFallbackConfig {
  /** Engine to use if the primary is not available */
  fallbackEngine: EngineName;
  /** Whether to log a warning when fallback occurs */
  warnOnFallback?: boolean;
}

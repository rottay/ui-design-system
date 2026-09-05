/**
 * @fileoverview Engine contracts - Rottay Design System
 * @description Type definitions for the multi-engine rendering layer: engine names,
 * registry config, context, provider props, and engine-aware component props.
 *
 * @remarks
 * These contracts describe engine selection and metadata only. The actual
 * component implementations live under `src/engines/` and individual
 * component folders. Four engines are supported:
 * - **classic**: Ant Design (enterprise, structured, corporate)
 * - **modern**: the Rottay-native premium skin and the PRIMARY engine
 *   (contemporary, rounded, glassmorphism)
 * - **rustic**: Vanilla HTML/CSS (minimal, spacious, understated)
 * - **custom**: Pluggable tenant-specific implementations
 *
 * @module Contracts/Engine
 * @category Types
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';
import type { EngineName } from '../../kernel/engine-identity';
import type { ComponentExtensions } from '../../kernel/tokens/extensions';

export type { EngineName } from '../../kernel/engine-identity';

/**
 * Available engine names in the Rottay Design System.
 * Each engine maps to a distinct UI library and visual personality.
 */
/**
 * Props that allow a component to select its rendering engine.
 * Most components extend this interface to support per-component engine override.
 */
export interface EngineAwareProps {
  /**
   * UI engine to use for this component.
   * Resolved from the nearest EngineProvider context when not specified.
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
   * Reserved compatibility field for the unimplemented universal extension API.
   * Production components do not read it and passing it has no runtime effect.
   *
   * @deprecated DS-IMP-021 owns replacement/removal after the deferred
   * external-import census. Use each component's evidenced props/compounds.
   */
  extensions?: ComponentExtensions;
}

/** Engine metadata stored in the engine registry. */
export interface EngineConfig {
  /** Engine identifier */
  name: EngineName;
  /** Human-readable display name */
  displayName: string;
  /** Underlying UI library (e.g. 'antd', 'rottay-native', 'html') */
  library: string;
  /** Stability status */
  status: 'stable' | 'beta' | 'experimental' | 'deprecated';
}

/** Value exposed by the EngineProvider context. */
export interface EngineContextValue {
  /** Currently active engine */
  engine: EngineName;
  /** Function to switch the active engine at runtime */
  setEngine: (engine: EngineName) => void;
}

/** Props for the EngineProvider component. */
export interface EngineProviderProps {
  /** The engine to render with. Required: absence has no default. */
  defaultEngine: EngineName;
  /** Child components */
  children: React.ReactNode;
}

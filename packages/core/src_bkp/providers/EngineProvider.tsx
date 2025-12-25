'use client';

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type { Engine } from '../types/engine';
import { DEFAULT_ENGINE } from '../types/engine';

// ============================================
// GLOBAL ENGINE STORE (for imperative APIs)
// ============================================

/**
 * Global engine store for imperative APIs like Message and Notification.
 * These APIs cannot use React hooks, so they need a way to access the engine.
 */
let globalEngine: Engine = DEFAULT_ENGINE;

/**
 * Get the current global engine.
 * Used by imperative APIs like Message and Notification.
 */
export function getGlobalEngine(): Engine {
  return globalEngine;
}

/**
 * Set the global engine.
 * Called automatically by EngineProvider, but can also be called manually.
 */
export function setGlobalEngine(engine: Engine): void {
  globalEngine = engine;
}

// ============================================
// CONTEXT
// ============================================

interface EngineContextValue {
  /** Current rendering engine */
  engine: Engine;
  /**
   * Whether the current engine is the specified one.
   * Useful for conditional rendering based on engine.
   */
  isEngine: (engine: Engine) => boolean;
}

const EngineContext = createContext<EngineContextValue | null>(null);

// ============================================
// HOOK
// ============================================

/**
 * Hook to access the current engine.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { engine, isEngine } = useEngineContext();
 *
 *   if (isEngine('titan')) {
 *     // Engine-specific logic
 *   }
 *
 *   return <div>Current engine: {engine}</div>;
 * }
 * ```
 */
export function useEngineContext(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngineContext must be used within an EngineProvider');
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

export interface EngineProviderProps {
  /** Rendering engine to use */
  engine?: Engine;
  /** Child components */
  children: ReactNode;
}

/**
 * EngineProvider
 *
 * Manages which rendering engine (UI library) is used for primitives.
 * This provider is responsible ONLY for engine selection - no theme logic.
 *
 * Engines (nombres griegos enmascaran la libreria real):
 * - titan: Enterprise-grade (Ant Design) - DEFAULT, 63+ components
 * - hermes: Lightweight (DaisyUI + Tailwind) - 30 themes, performance
 * - apollo: Modern (Native HTML + Tailwind) - Zero-dependency
 * - athena: Extensible (Custom/Pluggable) - Bring-your-own-library
 *
 * @example
 * ```tsx
 * import { EngineProvider } from '@es-rottay/designsystem-core';
 *
 * function App() {
 *   // Enterprise app with full features
 *   return (
 *     <EngineProvider engine="titan">
 *       <YourApp />
 *     </EngineProvider>
 *   );
 * }
 *
 * function LandingPage() {
 *   // Marketing site with lightweight bundle
 *   return (
 *     <EngineProvider engine="hermes">
 *       <LandingContent />
 *     </EngineProvider>
 *   );
 * }
 * ```
 */
export function EngineProvider({
  engine = DEFAULT_ENGINE,
  children,
}: EngineProviderProps) {
  // Sync global engine for imperative APIs
  useEffect(() => {
    setGlobalEngine(engine);
  }, [engine]);

  const value = useMemo<EngineContextValue>(
    () => ({
      engine,
      isEngine: (e: Engine) => e === engine,
    }),
    [engine]
  );

  return (
    <EngineContext.Provider value={value}>
      {children}
    </EngineContext.Provider>
  );
}

EngineProvider.displayName = 'EngineProvider';

'use client';

/**
 * @fileoverview useEngine Hook - Rottay Design System
 * @description React hook for accessing and controlling the UI rendering engine,
 * enabling runtime switching between Classic, Modern, and Rustic engines.
 *
 * @remarks
 * The useEngine hook provides:
 * - **Engine access**: Get current engine (classic, modern, rustic)
 * - **Engine switching**: Change rendering engine at runtime
 * - **Context integration**: Works with EngineProvider
 *
 * Engines differ in their underlying implementation:
 * - **Classic**: Ant Design (feature-rich)
 * - **Modern**: DaisyUI/Tailwind (lightweight)
 * - **Rustic**: Vanilla HTML/CSS (zero dependencies)
 *
 * @example Engine switcher
 * ```tsx
 * function EngineSwitcher() {
 *   const { engine, setEngine } = useEngine();
 *   return (
 *     <select value={engine} onChange={(e) => setEngine(e.target.value)}>
 *       <option value="classic">Classic</option>
 *       <option value="modern">Modern</option>
 *       <option value="rustic">Rustic</option>
 *     </select>
 *   );
 * }
 * ```
 *
 * @see {@link EngineProvider} - Provider component
 * @see {@link EngineName} - Valid engine names
 * @module System/Hooks/Engine
 * @category System
 * @package @rottay/design-system
 */
import { useContext } from 'react';
import { EngineContext } from '../../engines';
import type { EngineContextValue } from '../../contracts';

/**
 * Hook to access and control the current UI rendering engine.
 *
 * The design system supports multiple engines that render components using different
 * underlying libraries:
 * - **classic**: Ant Design based (full-featured)
 * - **modern**: DaisyUI/Tailwind based (utility-first)
 * - **rustic**: Vanilla HTML/CSS (headless, maximum accessibility)
 *
 * @example
 * ```tsx
 * import { useEngine } from '@rottay/design-system';
 *
 * function EngineSelector() {
 *   const { engine, setEngine } = useEngine();
 *
 *   return (
 *     <select value={engine} onChange={(e) => setEngine(e.target.value)}>
 *       <option value="classic">Classic (Ant Design)</option>
 *       <option value="modern">Modern (DaisyUI)</option>
 *       <option value="rustic">Rustic (Vanilla)</option>
 *     </select>
 *   );
 * }
 * ```
 *
 * @returns Object containing the current engine name and a function to change it
 * @returns {EngineName} returns.engine - The current engine name ('classic', 'modern', or 'rustic')
 * @returns {Function} returns.setEngine - Function to change the current engine
 *
 * @throws {Error} Throws an error if used outside of an EngineProvider
 */
export function useEngine(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    // Engine context is required because component factories rely on it to pick
    // the correct implementation and lazy entrypoint.
    throw new Error('useEngine must be used within EngineProvider');
  }
  return context;
}

// Re-export for backwards compatibility
export { useEngine as useEngineContext };

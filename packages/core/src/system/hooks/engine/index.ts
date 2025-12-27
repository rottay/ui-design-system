/**
 * Engine hook - Access and control the current UI engine
 */
import { useContext } from 'react';
import { EngineContext } from '../../providers/engine';
import type { EngineContextValue } from '../../../types';

/**
 * Hook to access and control the current UI rendering engine.
 *
 * The design system supports multiple engines that render components using different
 * underlying libraries:
 * - **titan**: Ant Design based (full-featured)
 * - **hermes**: DaisyUI/Tailwind based (utility-first)
 * - **apollo**: Vanilla HTML/CSS (headless, maximum accessibility)
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
 *       <option value="titan">Titan (Ant Design)</option>
 *       <option value="hermes">Hermes (DaisyUI)</option>
 *       <option value="apollo">Apollo (Vanilla)</option>
 *     </select>
 *   );
 * }
 * ```
 *
 * @returns Object containing the current engine name and a function to change it
 * @returns {EngineName} returns.engine - The current engine name ('titan', 'hermes', or 'apollo')
 * @returns {Function} returns.setEngine - Function to change the current engine
 *
 * @throws {Error} Throws an error if used outside of an EngineProvider
 */
export function useEngine(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within EngineProvider');
  }
  return context;
}

// Re-export for backwards compatibility
export { useEngine as useEngineContext };

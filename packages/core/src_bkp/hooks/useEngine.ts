import { useEngineContext } from '../providers/EngineProvider';
import type { Engine } from '../types/engine';

/**
 * Hook to access the current rendering engine.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const engine = useEngine();
 *   console.log(`Using engine: ${engine}`); // "titan", "hermes", "apollo", or "athena"
 * }
 * ```
 */
export function useEngine(): Engine {
  const { engine } = useEngineContext();
  return engine;
}

/**
 * Hook to check if the current engine matches a specific engine.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isTitan = useIsEngine('titan');
 *
 *   if (isTitan) {
 *     // Render Ant Design specific component
 *   }
 * }
 * ```
 */
export function useIsEngine(engine: Engine): boolean {
  const { isEngine } = useEngineContext();
  return isEngine(engine);
}

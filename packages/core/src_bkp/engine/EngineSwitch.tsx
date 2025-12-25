'use client';

import type { ReactNode } from 'react';
import type { Engine } from '../types/engine';
import { useEngineContext } from '../providers/EngineProvider';

interface EngineSwitchProps {
  /** Content for Titan engine (Ant Design) */
  titan?: ReactNode;
  /** Content for Hermes engine (DaisyUI) */
  hermes?: ReactNode;
  /** Content for Apollo engine (Native HTML) */
  apollo?: ReactNode;
  /** Content for Athena engine (Custom) */
  athena?: ReactNode;
  /** Fallback content if no engine match */
  fallback?: ReactNode;
}

/**
 * Declarative component for rendering different content based on engine.
 *
 * @example
 * ```tsx
 * <EngineSwitch
 *   titan={<AntButton>Click me</AntButton>}
 *   hermes={<DaisyButton>Click me</DaisyButton>}
 *   fallback={<button>Click me</button>}
 * />
 * ```
 */
export function EngineSwitch({
  titan,
  hermes,
  apollo,
  athena,
  fallback = null,
}: EngineSwitchProps): ReactNode {
  const { engine } = useEngineContext();

  const content: Record<Engine, ReactNode | undefined> = {
    titan,
    hermes,
    apollo,
    athena,
  };

  // Return content for current engine, or fallback chain
  return (
    content[engine] ??
    (engine === 'athena' && (apollo ?? hermes ?? titan)) ??
    (engine === 'apollo' && (hermes ?? titan)) ??
    (engine === 'hermes' && titan) ??
    fallback
  );
}

/**
 * Renders content only for the specified engine.
 */
export function EngineOnly({
  engine: targetEngine,
  children,
}: {
  engine: Engine | Engine[];
  children: ReactNode;
}): ReactNode {
  const { engine } = useEngineContext();

  const engines = Array.isArray(targetEngine) ? targetEngine : [targetEngine];

  if (engines.includes(engine)) {
    return children;
  }

  return null;
}

/**
 * Renders content for all engines except the specified one(s).
 */
export function EngineExcept({
  engine: excludedEngine,
  children,
}: {
  engine: Engine | Engine[];
  children: ReactNode;
}): ReactNode {
  const { engine } = useEngineContext();

  const excluded = Array.isArray(excludedEngine) ? excludedEngine : [excludedEngine];

  if (!excluded.includes(engine)) {
    return children;
  }

  return null;
}

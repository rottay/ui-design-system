export type WebGL2Capability = 'unknown' | 'webgl2' | 'none';

let cachedCapability: Exclude<WebGL2Capability, 'unknown'> | null = null;

interface LoseContextExtension {
  loseContext(): void;
}

/**
 * Probe only the certified v1 backend and release the temporary context.
 * WebGL1/experimental-webgl are deliberately not fallbacks for modern Three.
 */
export function probeWebGL2Capability(): Exclude<WebGL2Capability, 'unknown'> {
  if (cachedCapability !== null) return cachedCapability;
  if (typeof document === 'undefined') return 'none';

  let canvas: HTMLCanvasElement | null = null;
  let context: WebGL2RenderingContext | null = null;

  try {
    canvas = document.createElement('canvas');
    context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: true,
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'default',
      preserveDrawingBuffer: false,
      stencil: false,
    });
    cachedCapability = context && typeof context.getExtension === 'function'
      ? 'webgl2'
      : 'none';
    return cachedCapability;
  } catch {
    cachedCapability = 'none';
    return cachedCapability;
  } finally {
    try {
      const extension = typeof context?.getExtension === 'function'
        ? context.getExtension('WEBGL_lose_context') as LoseContextExtension | null
        : null;
      extension?.loseContext();
    } catch {
      // Capability probing must remain fail-closed even on hostile extensions.
    }
    try {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    } catch {
      // Hostile canvas setters cannot escape a fail-closed capability probe.
    }
  }
}

/** Invalidate a failed/poisoned capability after an explicit user retry. */
export function invalidateWebGL2Capability(): void {
  cachedCapability = null;
}

/** Test-only alias; intentionally absent from the public entrypoint. */
export const resetWebGL2CapabilityForTests = invalidateWebGL2Capability;

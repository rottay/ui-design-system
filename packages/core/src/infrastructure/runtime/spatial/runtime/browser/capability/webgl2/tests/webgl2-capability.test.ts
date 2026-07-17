import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  probeWebGL2Capability,
  resetWebGL2CapabilityForTests,
} from '..';

describe('WebGL2 capability', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetWebGL2CapabilityForTests();
  });

  it('accepts only webgl2, releases the probe and caches the result', () => {
    const loseContext = vi.fn();
    const getExtension = vi.fn(() => ({ loseContext }));
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(((type: string) => (
        type === 'webgl2' ? { getExtension } : null
      )) as typeof HTMLCanvasElement.prototype.getContext);

    expect(probeWebGL2Capability()).toBe('webgl2');
    expect(probeWebGL2Capability()).toBe('webgl2');
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(getContext).toHaveBeenCalledWith('webgl2', expect.objectContaining({
      failIfMajorPerformanceCaveat: true,
    }));
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('does not probe webgl1 as a fallback', () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);

    expect(probeWebGL2Capability()).toBe('none');
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(getContext).not.toHaveBeenCalledWith('webgl', expect.anything());
    expect(getContext).not.toHaveBeenCalledWith('experimental-webgl', expect.anything());
  });

  it('fails closed when the browser probe throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('hostile browser');
    });

    expect(probeWebGL2Capability()).toBe('none');
  });

  it('fails closed when even probe Canvas creation is unavailable', () => {
    vi.spyOn(document, 'createElement').mockImplementation((() => {
      throw new Error('canvas creation denied');
    }) as typeof document.createElement);

    expect(probeWebGL2Capability()).toBe('none');
  });
});

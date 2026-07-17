import { afterEach, describe, expect, it, vi } from 'vitest';

import { errorInDev, warnInDev, warnOnceInDev } from '..';

describe('infrastructure/runtime/foundation/diagnostics/development-logging', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('logs warnings and errors in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    warnInDev('warn message', { scope: 'ds' });
    errorInDev('error message', { scope: 'ds' });

    expect(warnSpy).toHaveBeenCalledWith('warn message', { scope: 'ds' });
    expect(errorSpy).toHaveBeenCalledWith('error message', { scope: 'ds' });
  });

  it('suppresses warnings and errors in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    warnInDev('warn message');
    errorInDev('error message');

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs warnOnce keys only once while still allowing distinct keys', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    warnOnceInDev('duplicate-key', 'First warning', 1);
    warnOnceInDev('duplicate-key', 'Second warning', 2);
    warnOnceInDev('other-key', 'Other warning', 3);

    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenNthCalledWith(1, 'First warning', 1);
    expect(warnSpy).toHaveBeenNthCalledWith(2, 'Other warning', 3);
  });
});

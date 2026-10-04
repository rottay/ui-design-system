import { baselineFor } from '@rottay/design-system';

export const neutral = baselineFor('bithire', 'acme');
export const legacy = (baselineFor as (...args: unknown[]) => unknown)('bithire', 'acme', 'first-party');
export const third = baselineFor('bithire', 'acme', 'first-party' as never);

import { baselineFor } from '@rottay/design-system';

export type Baseline = (...args: Parameters<typeof baselineFor>) => unknown;

export const theme = baselineFor('bithire', 'acme');

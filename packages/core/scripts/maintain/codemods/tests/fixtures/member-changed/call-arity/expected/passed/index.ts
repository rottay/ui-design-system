import { baselineFor } from '@rottay/design-system';

declare function schedule(resolve: unknown, slug: string): void;

// One argument in the list, but the function is the argument, not the callee.
schedule(baselineFor, 'acme');

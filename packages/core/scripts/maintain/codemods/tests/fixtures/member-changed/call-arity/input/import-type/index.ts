import type { Theme } from '@rottay/design-system';

// A file is scanned once it imports the package; the import() type is then a site of its own.
export type Baseline = (...args: Parameters<typeof import('@rottay/design-system').baselineFor>) => Theme;

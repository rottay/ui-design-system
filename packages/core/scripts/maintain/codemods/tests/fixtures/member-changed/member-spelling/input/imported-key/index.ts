import type { TenantConfig } from '@rottay/design-system';
import { KEY } from '../foreign';

// Not followed: the member name is spelled in another file and the assertion names another type.
export const read = (config: TenantConfig) => (config as unknown as Record<string, unknown>)[KEY];

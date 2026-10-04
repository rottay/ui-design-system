import type { TenantConfig } from '@rottay/design-system';
import { legacy } from '../foreign';

// The value this file does not write is the target itself; every later argument is written here.
export const config: TenantConfig = Object.assign(legacy, { name: 'Acme' });

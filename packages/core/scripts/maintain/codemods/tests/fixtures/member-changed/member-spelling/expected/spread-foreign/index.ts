import type { TenantConfig } from '@rottay/design-system';
import { legacy } from '../foreign';

// The typecheck passes: a spread operand is not fresh, so its excess properties are not checked.
export const config: TenantConfig = { ...legacy };

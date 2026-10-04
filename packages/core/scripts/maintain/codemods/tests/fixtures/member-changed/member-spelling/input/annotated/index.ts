import type { TenantConfig } from '@rottay/design-system';

declare const appearance: unknown;
declare const base: TenantConfig;

export const config: TenantConfig = { ...base, appearance };

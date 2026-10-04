import type { TenantConfig } from '@rottay/design-system';

declare const base: TenantConfig;

export const config = ({ ...base, personality: 'bold' }) satisfies TenantConfig;

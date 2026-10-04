import type { TenantConfig } from '@rottay/design-system';

export const read = (row: string) => <TenantConfig>JSON.parse(row);

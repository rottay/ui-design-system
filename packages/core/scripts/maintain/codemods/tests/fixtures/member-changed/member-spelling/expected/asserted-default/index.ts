import type { TenantConfig } from '@rottay/design-system';
import { legacy } from '../foreign';

export function slugOf(config: TenantConfig = legacy as TenantConfig) {
  return config.slug;
}

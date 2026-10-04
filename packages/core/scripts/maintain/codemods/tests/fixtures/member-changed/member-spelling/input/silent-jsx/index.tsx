import { Text, type TenantConfig } from '@rottay/design-system';

/** JSX text and comments name no property: engine, appearance, personality. */
export function Label({ config }: { config: TenantConfig }) {
  return <Text data-engine-label="">The engine and the appearance of {config.name} are the artifact's.</Text>;
}

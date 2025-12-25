import { useDSExtras, type DefaultsConfig } from '../providers/DesignSystemProvider';

/**
 * Hook to access component default variants.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const defaults = useDefaults();
 *   console.log(defaults.LoginForm); // "minimal" | "standard" | "enterprise"
 * }
 * ```
 */
export function useDefaults(): DefaultsConfig {
  const { defaults } = useDSExtras();
  return defaults;
}

/**
 * Hook to get the default variant for a specific component.
 *
 * @example
 * ```tsx
 * function LoginForm({ variant }: { variant?: LoginFormVariant }) {
 *   // Use provided variant or fall back to default
 *   const defaultVariant = useDefaultVariant('LoginForm', 'standard');
 *   const activeVariant = variant ?? defaultVariant;
 *
 *   // Render based on activeVariant
 * }
 * ```
 */
export function useDefaultVariant<K extends keyof DefaultsConfig>(
  componentName: K,
  fallback: NonNullable<DefaultsConfig[K]>
): NonNullable<DefaultsConfig[K]> {
  const defaults = useDefaults();
  return (defaults[componentName] ?? fallback) as NonNullable<DefaultsConfig[K]>;
}

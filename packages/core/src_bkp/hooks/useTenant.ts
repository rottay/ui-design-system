import { useDSExtras } from '../providers/DesignSystemProvider';

/**
 * Hook to access the current tenant identifier.
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const tenant = useTenant();
 *
 *   return (
 *     <div>
 *       {tenant && <span>Tenant: {tenant}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTenant(): string | undefined {
  const { tenant } = useDSExtras();
  return tenant;
}

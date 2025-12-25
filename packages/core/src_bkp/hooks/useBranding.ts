import { useDSExtras, type BrandingConfig } from '../providers/DesignSystemProvider';

/**
 * Hook to access branding configuration.
 *
 * @example
 * ```tsx
 * function Header() {
 *   const branding = useBranding();
 *
 *   return (
 *     <header>
 *       {branding.logo && <img src={branding.logo} alt={branding.companyName} />}
 *       <span>{branding.companyName}</span>
 *     </header>
 *   );
 * }
 * ```
 */
export function useBranding(): BrandingConfig {
  const { branding } = useDSExtras();
  return branding;
}

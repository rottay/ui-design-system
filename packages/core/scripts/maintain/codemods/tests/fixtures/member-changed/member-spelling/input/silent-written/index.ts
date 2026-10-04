import type { TenantConfig } from '@rottay/design-system';

// Every key that reaches the type is written in this file, so no removed field can arrive unspelled.
export function build(dark: boolean, plan?: string) {
  return [
    { slug: 'acme', name: 'Acme', ...(dark ? { theme: 'dark' } : { theme: 'light' }), ...(plan && { plan }) } as unknown as TenantConfig,
    ({ ...{ slug: 'beta' }, name: 'Beta' })! satisfies Partial<TenantConfig>,
    Object.assign({} as TenantConfig, { slug: 'gamma' }),
  ];
}

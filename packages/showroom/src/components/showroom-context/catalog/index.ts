import type { ProductProfileKey } from '@rottay/design-system';

export type ShowroomVertical = 'rottay' | 'bithire' | 'evnto';

export interface ShowroomTenantEntry {
  readonly name: string;
  readonly vertical: ShowroomVertical;
  /** The vertical's own ground: what its static mount stamps when no mode is asked for. */
  readonly mode: 'light' | 'dark';
  readonly profileKey: ProductProfileKey;
  readonly profileLabel: string;
  readonly shortLabel: string;
  readonly accent: string;
  readonly hint: string;
}

/**
 * The showroom's one tenant catalog. The runtime, the pickers and the server ground all read
 * this table; the profile belongs to the tenant, never to the engine it is rendered under.
 */
export const SHOWROOM_CATALOG = {
  rottay: {
    name: 'Rottay',
    vertical: 'rottay',
    mode: 'dark',
    profileKey: 'rottay.flagship',
    profileLabel: 'Rottay Flagship',
    shortLabel: 'RT',
    accent: 'var(--ds-color-primary-500)',
    hint: 'Flagship admin baseline powered by the Rottay tenant and rottay vertical preset.',
  },
  bithire: {
    name: 'BitHire',
    vertical: 'bithire',
    mode: 'light',
    profileKey: 'recruiting.operator',
    profileLabel: 'Recruiting Operator',
    shortLabel: 'BH',
    accent: '#4f46e5',
    hint: 'Recruiting tenant layered with the BitHire vertical defaults.',
  },
  evnto: {
    name: 'Evnto',
    vertical: 'evnto',
    mode: 'light',
    profileKey: 'events.organizer',
    profileLabel: 'Events Organizer',
    shortLabel: 'EV',
    accent: '#db2777',
    hint: 'Event product tenant layered with the Evnto vertical defaults.',
  },
} as const satisfies Record<string, ShowroomTenantEntry>;

export type ShowroomTenant = keyof typeof SHOWROOM_CATALOG;

export const SHOWROOM_TENANTS = Object.keys(SHOWROOM_CATALOG) as ShowroomTenant[];

export const DEFAULT_SHOWROOM_TENANT: ShowroomTenant = 'rottay';

export function isShowroomTenant(value: string | null | undefined): value is ShowroomTenant {
  return typeof value === 'string' && Object.hasOwn(SHOWROOM_CATALOG, value);
}

/** Cookie names the server reads to resolve the reader's stored choice. */
export const TENANT_COOKIE = 'rottay-showroom-tenant';
export const ENGINE_COOKIE = 'rottay-showroom-engine';

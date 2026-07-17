export const CRA17_TENANTS = ['bithire', 'themanagementmiami'] as const;
export type Cra17Tenant = (typeof CRA17_TENANTS)[number];

export const CRA17_THEMES = ['light', 'dark'] as const;
export type Cra17Theme = (typeof CRA17_THEMES)[number];

export const CRA17_DIRECTIONS = ['ltr', 'rtl'] as const;
export type Cra17Direction = (typeof CRA17_DIRECTIONS)[number];

/** Functional icon and mark optical-size audit axis requested by CRA17. */
export const CRA17_ASSET_SIZES = [12, 16, 20, 24] as const;

/**
 * FeaturePictogram is explanatory artwork, not a functional icon. Its public
 * contract intentionally starts at 32px, so the atlas audits its four legal
 * numeric sizes instead of bypassing the component with CSS shrinking.
 */
export const CRA17_PICTOGRAM_SIZES = [32, 48, 64, 96] as const;

export interface Cra17Axes {
  readonly direction: Cra17Direction;
  readonly forcedColorsAudit: boolean;
  readonly tenant: Cra17Tenant;
  readonly theme: Cra17Theme;
}

export const CRA17_DEFAULT_AXES: Cra17Axes = {
  direction: 'ltr',
  forcedColorsAudit: false,
  tenant: 'bithire',
  theme: 'light',
};

function includes<const Values extends readonly string[]>(
  values: Values,
  value: string | null,
): value is Values[number] {
  return value !== null && values.includes(value);
}

export function resolveCra17Axes(searchParams: URLSearchParams): Cra17Axes {
  const tenant = searchParams.get('tenant');
  const theme = searchParams.get('theme');
  const direction = searchParams.get('dir');

  return {
    tenant: includes(CRA17_TENANTS, tenant)
      ? tenant
      : CRA17_DEFAULT_AXES.tenant,
    theme: includes(CRA17_THEMES, theme)
      ? theme
      : CRA17_DEFAULT_AXES.theme,
    direction: includes(CRA17_DIRECTIONS, direction)
      ? direction
      : CRA17_DEFAULT_AXES.direction,
    forcedColorsAudit: searchParams.get('forcedColors') === '1',
  };
}

export function cra17ProbeHref(axes: Cra17Axes): string {
  const searchParams = new URLSearchParams({
    tenant: axes.tenant,
    theme: axes.theme,
    dir: axes.direction,
    forcedColors: axes.forcedColorsAudit ? '1' : '0',
  });
  return `/probe/semantic-assets?${searchParams.toString()}`;
}

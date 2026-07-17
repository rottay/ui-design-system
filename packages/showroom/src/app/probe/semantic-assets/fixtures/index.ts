import type { IconName } from '@rottay/design-system/icons';

export const CRA17_TENANTS = ['bithire', 'themanagementmiami'] as const;
export type Cra17Tenant = (typeof CRA17_TENANTS)[number];

export const CRA17_ENGINES = ['classic', 'modern', 'rustic'] as const;
export type Cra17Engine = (typeof CRA17_ENGINES)[number];

export const CRA17_THEMES = ['light', 'dark'] as const;
export type Cra17Theme = (typeof CRA17_THEMES)[number];

export const CRA17_DIRECTIONS = ['ltr', 'rtl'] as const;
export type Cra17Direction = (typeof CRA17_DIRECTIONS)[number];

export const CRA17_CORPORA = ['canonical', 'all'] as const;
export type Cra17Corpus = (typeof CRA17_CORPORA)[number];

/** Frozen WO-CRA-17 optical corpus: 40 roles, no aliases or supplier names. */
export const CRA17_CANONICAL_ICON_NAMES = [
  'action.add',
  'action.edit',
  'action.delete',
  'action.save',
  'action.search',
  'action.filter',
  'navigation.home',
  'navigation.back',
  'navigation.forward',
  'navigation.menu',
  'navigation.more',
  'status.success',
  'status.warning',
  'status.error',
  'status.loading',
  'status.pending',
  'communication.email',
  'communication.message',
  'communication.notification',
  'communication.send',
  'access.login',
  'auth.password',
  'auth.passkey',
  'auth.sso',
  'data.chart',
  'data.table',
  'data.database',
  'data.report',
  'data.trend',
  'ai.assistant',
  'ai.agent',
  'ai.tool',
  'ai.guardrail',
  'ai.recommendation',
  'bithire.candidate',
  'bithire.interview',
  'bithire.pipeline',
  'bithire.evidence',
  'bithire.job',
  'bithire.offer',
] as const satisfies readonly IconName[];

/** Functional icon and mark optical-size audit axis requested by CRA17. */
export const CRA17_ASSET_SIZES = [12, 16, 20, 24] as const;

/**
 * FeaturePictogram is explanatory artwork, not a functional icon. Its public
 * contract intentionally starts at 32px, so the atlas audits its four legal
 * numeric sizes instead of bypassing the component with CSS shrinking.
 */
export const CRA17_PICTOGRAM_SIZES = [32, 48, 64, 96] as const;

export interface Cra17Axes {
  readonly corpus: Cra17Corpus;
  readonly direction: Cra17Direction;
  readonly engine: Cra17Engine;
  readonly forcedColorsAudit: boolean;
  readonly tenant: Cra17Tenant;
  readonly theme: Cra17Theme;
}

export const CRA17_DEFAULT_AXES: Cra17Axes = {
  corpus: 'canonical',
  direction: 'ltr',
  engine: 'modern',
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
  const engine = searchParams.get('engine');
  const corpus = searchParams.get('corpus');

  return {
    corpus: includes(CRA17_CORPORA, corpus)
      ? corpus
      : CRA17_DEFAULT_AXES.corpus,
    tenant: includes(CRA17_TENANTS, tenant)
      ? tenant
      : CRA17_DEFAULT_AXES.tenant,
    engine: includes(CRA17_ENGINES, engine)
      ? engine
      : CRA17_DEFAULT_AXES.engine,
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
    engine: axes.engine,
    theme: axes.theme,
    corpus: axes.corpus,
    dir: axes.direction,
    forcedColors: axes.forcedColorsAudit ? '1' : '0',
  });
  return `/probe/semantic-assets?${searchParams.toString()}`;
}

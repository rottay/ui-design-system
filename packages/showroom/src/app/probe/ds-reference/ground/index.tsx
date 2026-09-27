/**
 * The DS reference lab's tenant ground: a probe-ground configuration per segment.
 *
 * A ground is per-DOCUMENT (stamped on documentElement), so one document cannot carry both
 * tenants; each segment's layout renders this first-in-body with a STATIC tenant and locale.
 * BitHire is the vertical's code-owned baseline; The Management is the published canary DB
 * document, compiled through the kernel's legacy source.
 */

import type { ReactNode } from 'react';

import { buildThemePrepaintScript } from '@rottay/design-system/server';
import tenantThemeCanaryFixtures from '@rottay/design-system/tenant-theme-canary-fixtures';

import { groundFor, GroundStage, type GroundRequest } from '@/components/probe-ground';

import { judgeModeStyle, type JudgeMode } from './stamp';

/** The two grounds the lab renders. Closed on purpose — this is not a selector. */
export type LabTenant = 'bithire' | 'themanagement';

/**
 * Locale axis, additive to the tenant axis and closed for the same reason. `ar` is the harness's
 * only COMPLETE right-to-left document: the stamp writes `dir="rtl"` before hydration.
 */
export type LabLocale = 'en' | 'es' | 'ar';

function labRequest(tenant: LabTenant, locale: LabLocale): GroundRequest {
  if (tenant === 'bithire') {
    return { source: { kind: 'static' }, slug: 'bithire', mode: 'light', locale };
  }
  const specimen = tenantThemeCanaryFixtures.specimens.themanagement;
  if (!specimen) throw new Error('The published The Management canary specimen is missing');
  const { identity } = specimen;
  return {
    source: {
      kind: 'legacy',
      document: specimen.document,
      tenantId: identity.tenantId,
      rowVersion: identity.rowVersion,
      vertical: identity.verticalKey as 'bithire',
      name: 'The Management',
    },
    slug: identity.slug,
    mode: 'light',
    locale,
  };
}

export interface LabGroundProps {
  readonly tenant: LabTenant;
  readonly judge?: JudgeMode;
  /** Defaults to `'en'` — every pre-existing call site is unaffected. */
  readonly locale?: LabLocale;
  readonly children?: ReactNode;
}

export async function LabGround({ tenant, judge = 'none', locale = 'en', children }: LabGroundProps) {
  const ground = await groundFor(labRequest(tenant, locale));
  const judgeCss = judgeModeStyle(judge);

  return (
    <>
      <script
        data-testid="lab-ground-stamp"
        dangerouslySetInnerHTML={{ __html: `${ground.stamp};${buildThemePrepaintScript()}` }}
      />
      <GroundStage {...ground.stage} styleTestId="lab-tenant-artifact-style">
        {children}
      </GroundStage>
      {/* Last, so a judged capture wins, and tagged so its receipt can tell judged from plain. */}
      {judgeCss ? (
        <style data-testid="lab-judge-mode" data-judge={judge} dangerouslySetInnerHTML={{ __html: judgeCss }} />
      ) : null}
    </>
  );
}
